import { createContext, useContext, useEffect, useState } from 'react'
import { Session, User as SupabaseUser } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { authService, SignUpData } from '@/services/auth.service'
import { businessService } from '@/services/business.service'

interface Business {
  id: string
  name: string
  email: string
  phone: string
  description: string
  created_at: string
}

interface User extends SupabaseUser {
  name?: string
  role?: string
  businesses: Business[]
  selectedBusinessId: string | null
  emailVerified: boolean
  lastLoginAt: string
}

interface AuthContextType {
  session: Session | null
  user: User | null
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

function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session?.user) {
        fetchUser(session.user)
      } else {
        setLoading(false)
      }
    })

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session?.user) {
        fetchUser(session.user)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchUser(supabaseUser: SupabaseUser) {
    console.log('AuthProvider: Fetching user data for:', supabaseUser.id)
    try {
      console.log('AuthProvider: Fetching businesses for user')
      const businesses = await businessService.getUserBusinesses(supabaseUser.id)
      console.log('AuthProvider: Fetched businesses:', businesses)
      
      // Get user profile data
      console.log('AuthProvider: Fetching user profile data')
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('name')
        .eq('id', supabaseUser.id)
        .maybeSingle()

      if (userError) {
        console.error('AuthProvider: Error fetching user profile:', userError)
        throw userError
      }
      
      console.log('AuthProvider: User profile data:', userData)
      
      const userWithBusinesses: User = {
        ...supabaseUser,
        ...userData,
        businesses,
        selectedBusinessId: businesses.length > 0 ? businesses[0].id : null,
        emailVerified: supabaseUser.email_confirmed_at !== null,
        lastLoginAt: new Date().toISOString()
      }
      
      console.log('AuthProvider: Setting user with businesses:', userWithBusinesses)
      setUser(userWithBusinesses)
      setLoading(false)
    } catch (error) {
      console.error('AuthProvider: Error fetching user:', error)
      setError(error as Error)
      setUser(null)
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('AuthProvider: Attempting sign in for:', email)
    setLoading(true)
    setError(null)
    try {
      await authService.signIn(email, password)
      console.log('AuthProvider: Sign in successful')
    } catch (error) {
      console.error('AuthProvider: Sign in error:', error)
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, name: string, businessId?: string) => {
    setLoading(true)
    setError(null)
    try {
      await authService.signUp({ 
        email, 
        password, 
        name,
        businessId 
      })
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
      await authService.signOut()
      console.log('AuthProvider: Sign out successful')
    } catch (error) {
      console.error('AuthProvider: Sign out error:', error)
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const selectBusiness = async (businessId: string) => {
    if (!user) return

    console.log('AuthProvider: Selecting business:', businessId)
    setLoading(true)
    setError(null)
    try {
      const business = await businessService.getBusinessById(businessId)
      if (!business) {
        throw new Error('Business not found')
      }

      // Get user role for this business
      const { data: businessUser, error: businessUserError } = await supabase
        .from('business_users')
        .select('role')
        .eq('user_id', user.id)
        .eq('business_id', businessId)
        .single()

      if (businessUserError) throw businessUserError

      setUser({
        ...user,
        selectedBusinessId: businessId,
        role: businessUser.role
      })
    } catch (error) {
      console.error('AuthProvider: Error selecting business:', error)
      setError(error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setLoading(true)
    setError(null)
    try {
      await authService.resetPassword(email)
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
      await authService.updatePassword(newPassword)
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
      await authService.resendVerificationEmail(user.email)
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
      
      if (error) throw error

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

export { useAuth, AuthProvider } 