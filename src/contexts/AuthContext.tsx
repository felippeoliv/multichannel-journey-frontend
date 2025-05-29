import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { User } from '../lib/supabase'

interface Business {
  id: string
  name: string
  plan: 'free' | 'pro' | 'enterprise'
  settings: {
    allowedChannels: string[]
    maxUsers: number
    features: string[]
  }
}

interface UserWithBusinesses extends User {
  businesses: Business[]
  selectedBusinessId: string | null
  emailVerified: boolean
  lastLoginAt: string
}

interface AuthContextType {
  session: Session | null
  user: UserWithBusinesses | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, businessId?: string) => Promise<void>
  signOut: () => Promise<void>
  selectBusiness: (businessId: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  resendVerificationEmail: () => Promise<void>
  updateUserProfile: (data: Partial<User>) => Promise<void>
  error: Error | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<UserWithBusinesses | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) {
      console.log('AuthProvider: Already initialized, skipping...')
      return
    }

    console.log('AuthProvider: Initializing...')
    initialized.current = true
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Initial session:', session)
      setSession(session)
      if (session?.user) {
        fetchUser(session.user)
      } else {
        console.log('AuthProvider: No session found, setting loading to false')
        setLoading(false)
      }
    }).catch(error => {
      console.error('AuthProvider: Error getting initial session:', error)
      setError(error)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthProvider: Auth state changed:', _event, session)
      setSession(session)
      if (session?.user) {
        await fetchUser(session.user)
        if (!user) {
          console.error('AuthProvider: fetchUser completed but user state is still null.');
        }
      } else {
        console.log('AuthProvider: No user in session, clearing user state')
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      console.log('AuthProvider: Cleaning up...')
      subscription.unsubscribe()
      initialized.current = false
    }
  }, [])

  async function fetchUser(supabaseUser: SupabaseUser) {
    console.log('AuthProvider: Fetching user data for:', supabaseUser.id)
    try {
      // Primeiro, buscar os dados básicos do usuário
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, businesses(*)') // Fetch user and associated businesses in one query
        .eq('id', supabaseUser.id)
        .maybeSingle() // Use maybeSingle instead of single

      if (userError) {
        console.error('AuthProvider: Error fetching user:', userError)
        setError(userError)
        setUser(null) // Explicitly set user to null on error
        setLoading(false)
        return
      }

      console.log('AuthProvider: User data fetched:', userData)

      if (userData) {
        // Handle case where user exists but has no associated businesses
        const userBusinesses = userData?.businesses || [];

        setUser({
          ...userData,
          businesses: userBusinesses,
          selectedBusinessId: userBusinesses.length > 0 ? userBusinesses[0].id : null, // Select the first business if available
          emailVerified: supabaseUser.email_confirmed_at !== null,
          lastLoginAt: new Date().toISOString()
        })
      } else {
        console.log('AuthProvider: User data not found in "users" table for id:', supabaseUser.id);
        setUser(null);
      }
      setLoading(false)
    } catch (error) {
      console.error('AuthProvider: Unexpected error fetching user:', error)
      setError(error as Error)
      setUser(null) // Explicitly set user to null on error
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email)
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        console.error('AuthProvider: Sign in error:', error)
        setError(error)
        setLoading(false)
        throw error
      }
      console.log('AuthProvider: Sign in successful')
    } catch (error) {
      console.error('AuthProvider: Unexpected sign in error:', error)
      setError(error as Error)
      setLoading(false)
      throw error
    }
  }

  const signUp = async (email: string, password: string, name: string, businessId?: string) => {
    setLoading(true)
    setError(null)
    try {
      // First create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('AuthProvider: Supabase Auth signUp result:', { authData, authError });

      if (authError) {
        setError(authError)
        throw authError
      }

      if (!authData.user) {
        throw new Error('No user data returned from signup')
      }

      // Then create the user profile with business association
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          name,
          role: 'admin', // First user is always admin
          business_id: businessId,
          is_agent: false,
        })

      if (profileError) {
        setError(profileError)
        throw profileError
      }

      // If businessId is provided, create the user-business association
      if (businessId) {
        const { error: businessError } = await supabase
          .from('user_businesses')
          .insert({
            user_id: authData.user.id,
            business_id: businessId,
            role: 'admin'
          })

        if (businessError) {
          setError(businessError)
          throw businessError
        }
      }

      // Fetch the complete user data
      await fetchUser(authData.user)
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    console.log('AuthProvider: Attempting sign out')
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('AuthProvider: Sign out error:', error)
        setError(error)
        setLoading(false)
        throw error
      }
      console.log('AuthProvider: Sign out successful')
      setLoading(false)
    } catch (error) {
      console.error('AuthProvider: Unexpected sign out error:', error)
      setError(error as Error)
      setLoading(false)
      throw error
    }
  }

  const selectBusiness = async (businessId: string) => {
    if (!user) return

    console.log('AuthProvider: Selecting business:', businessId)
    setLoading(true)
    setError(null)
    try {
      // Verificar se o usuário tem acesso ao negócio
      const { data, error } = await supabase
        .from('user_businesses')
        .select('*')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single()

      if (error || !data) {
        console.error('AuthProvider: User does not have access to this business')
        setError(error || new Error('User does not have access to this business'))
        setLoading(false)
        throw new Error('User does not have access to this business')
      }

      setUser({
        ...user,
        selectedBusinessId: businessId
      })
      setLoading(false)
    } catch (error) {
      console.error('AuthProvider: Error selecting business:', error)
      setError(error as Error)
      setLoading(false)
      throw error
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) {
        setError(error)
        throw error
      }
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (newPassword: string) => {
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })
      if (error) {
        setError(error)
        throw error
      }
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resendVerificationEmail = async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email,
      })
      if (error) {
        setError(error)
        throw error
      }
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateUserProfile = async (data: Partial<User>) => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
      
      if (error) {
        setError(error)
        throw error
      }

      setUser({
        ...user,
        ...data
      })
    } catch (error) {
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  console.log('AuthProvider: Current state:', { session, user, loading, error })

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        signIn,
        signUp,
        signOut,
        selectBusiness,
        resetPassword,
        updatePassword,
        resendVerificationEmail,
        updateUserProfile,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 