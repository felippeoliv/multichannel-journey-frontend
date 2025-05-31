import { supabase } from '@/lib/supabase'

export interface JourneyData {
  name: string
  description?: string
  type: 'onboarding' | 'engagement' | 'renewal' | 'offer'
  is_template?: boolean
  is_shareable?: boolean
  original_template_id?: string
}

export interface BusinessJourneyData {
  business_id: string
  journey_id: string
  settings?: Record<string, any>
}

class JourneyService {
  async createJourney(data: JourneyData, userId: string) {
    const { data: journey, error } = await supabase
      .from('journeys')
      .insert({
        ...data,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return journey
  }

  async createTemplate(data: JourneyData, userId: string) {
    return this.createJourney({
      ...data,
      is_template: true
    }, userId)
  }

  async getTemplates() {
    const { data: templates, error } = await supabase
      .from('journeys')
      .select('*')
      .eq('is_template', true)
      .eq('is_shareable', true)

    if (error) throw error
    return templates
  }

  async createBusinessJourney(data: BusinessJourneyData, userId: string) {
    // Primeiro, verificar se a jornada é um template compartilhável
    const { data: journey, error: journeyError } = await supabase
      .from('journeys')
      .select('*')
      .eq('id', data.journey_id)
      .single()

    if (journeyError) throw journeyError
    if (!journey.is_template || !journey.is_shareable) {
      throw new Error('Journey is not a shareable template')
    }

    // Criar a instância da jornada para o negócio
    const { data: businessJourney, error } = await supabase
      .from('business_journeys')
      .insert({
        ...data,
        created_by: userId
      })
      .select()
      .single()

    if (error) throw error
    return businessJourney
  }

  async getBusinessJourneys(businessId: string) {
    const { data: journeys, error } = await supabase
      .from('business_journeys')
      .select(`
        *,
        journey:journeys(*)
      `)
      .eq('business_id', businessId)
      .eq('is_active', true)

    if (error) throw error
    return journeys
  }

  async updateBusinessJourney(id: string, data: Partial<BusinessJourneyData>) {
    const { data: journey, error } = await supabase
      .from('business_journeys')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return journey
  }

  async deleteBusinessJourney(id: string) {
    const { error } = await supabase
      .from('business_journeys')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
}

export const journeyService = new JourneyService() 