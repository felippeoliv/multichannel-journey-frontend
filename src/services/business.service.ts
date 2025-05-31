import { supabase } from '@/lib/supabase'
import { BusinessData } from './auth.service'

interface Business {
  id: string
  name: string
  email: string
  phone: string
  description: string
  created_at: string
}

interface BusinessUser {
  business: Business
}

class BusinessService {
  async createBusiness(data: BusinessData) {
    const { data: business, error } = await supabase
      .from('businesses')
      .insert({
        name: data.name,
        email: data.email,
        phone: data.phone,
        description: data.description || ''
      })
      .select()
      .single()

    if (error) throw error
    return business
  }

  async getBusinessById(id: string) {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }

  async getUserBusinesses(userId: string): Promise<Business[]> {
    console.log('BusinessService: Fetching businesses for user:', userId)
    const { data, error } = await supabase
      .from('business_users')
      .select(`
        *,
        business:businesses(*)
      `)
      .eq('user_id', userId)

    if (error) {
      console.error('BusinessService: Error fetching businesses:', error)
      throw error
    }

    console.log('BusinessService: Raw data from Supabase:', data)
    
    if (!data || data.length === 0) {
      console.log('BusinessService: No businesses found for user')
      return []
    }

    const businesses = data.map(item => item.business)
    console.log('BusinessService: Mapped businesses:', businesses)
    return businesses
  }

  async updateBusiness(id: string, data: Partial<BusinessData>) {
    const { data: business, error } = await supabase
      .from('businesses')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return business
  }

  async deleteBusiness(id: string) {
    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const businessService = new BusinessService() 