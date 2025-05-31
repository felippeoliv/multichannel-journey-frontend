import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export interface SignUpData {
  email: string
  password: string
  name: string
  businessId: string
}

export interface BusinessData {
  name: string
  description?: string
  email?: string
  phone?: string
}

export interface UserRole {
  user_id: string
  business_id: string
  role: 'admin' | 'manager' | 'agent'
}

class AuthService {
  async signUp(data: SignUpData) {
    // 1. Criar o usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No user data returned from signup')

    // 2. Criar o perfil do usuário
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: data.email,
        name: data.name
      })

    if (profileError) throw profileError

    // 3. Vincular usuário ao negócio como admin
    const { error: roleError } = await supabase
      .from('business_users')
      .insert({
        user_id: authData.user.id,
        business_id: data.businessId,
        role: 'admin'
      })

    if (roleError) throw roleError

    return {
      user: authData.user
    }
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    if (error) throw error
  }

  async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
  }

  async resendVerificationEmail(email: string) {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    })
    if (error) throw error
  }

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  }

  // Novos métodos para gerenciar relacionamentos usuário-negócio
  async getUserBusinesses(userId: string) {
    const { data, error } = await supabase
      .from('business_users')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('user_id', userId)

    if (error) throw error
    return data
  }

  async getBusinessUsers(businessId: string) {
    const { data, error } = await supabase
      .from('business_users')
      .select(`
        *,
        user:users(*)
      `)
      .eq('business_id', businessId)

    if (error) throw error
    return data
  }

  async inviteUser(businessId: string, email: string, role: 'manager' | 'agent') {
    // 1. Criar o convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .insert({
        email,
        business_id: businessId,
        role,
        token: crypto.randomUUID()
      })
      .select()
      .single()

    if (inviteError) throw inviteError

    // 2. Enviar email com o link de convite
    // TODO: Implementar envio de email com o link de convite
    // O link deve apontar para /auth/accept-invite?token=${invite.token}

    return invite
  }

  async acceptInvite(token: string, name: string, password: string) {
    // 1. Buscar o convite
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError) throw inviteError
    if (!invite) throw new Error('Invalid invite token')

    // 2. Criar o usuário
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: invite.email,
      password,
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No user data returned from signup')

    // 3. Criar o perfil do usuário
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: invite.email,
        name
      })

    if (profileError) throw profileError

    // 4. Vincular usuário ao negócio
    const { error: roleError } = await supabase
      .from('business_users')
      .insert({
        user_id: authData.user.id,
        business_id: invite.business_id,
        role: invite.role
      })

    if (roleError) throw roleError

    // 5. Marcar convite como aceito
    const { error: updateError } = await supabase
      .from('invites')
      .update({ accepted: true })
      .eq('token', token)

    if (updateError) throw updateError

    return {
      user: authData.user,
      business_id: invite.business_id
    }
  }
}

export const authService = new AuthService() 