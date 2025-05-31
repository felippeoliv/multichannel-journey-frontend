import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface Business {
  id: string
  name: string
  email: string
  phone: string
  description: string
  created_at: string
}

interface BusinessWithRole extends Business {
  role: string
}

export default function BusinessSelection() {
  const { user, loading, selectBusiness } = useAuth()
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<BusinessWithRole[]>([])
  const [loadingBusinesses, setLoadingBusinesses] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
    } else {
      fetchUserBusinesses()
    }
  }, [user, navigate])

  const fetchUserBusinesses = async () => {
    try {
      const { data, error } = await supabase
        .from('business_users')
        .select(`
          role,
          business:businesses(*)
        `)
        .eq('user_id', user?.id)

      if (error) throw error

      const formattedBusinesses = data.map(item => ({
        ...item.business,
        role: item.role
      }))

      setBusinesses(formattedBusinesses)
    } catch (error) {
      console.error('Error fetching businesses:', error)
      toast.error('Failed to load businesses')
    } finally {
      setLoadingBusinesses(false)
    }
  }

  const handleBusinessSelect = async (businessId: string) => {
    try {
      await selectBusiness(businessId)
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to select business. Please try again.')
    }
  }

  if (loading || loadingBusinesses) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!businesses.length) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>No Businesses Found</CardTitle>
            <CardDescription>You don't have access to any businesses yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate('/auth/login')}
            >
              Back to Login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Select a Business</CardTitle>
          <CardDescription>Choose which business you want to access</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {businesses.map((business) => (
            <Button
              key={business.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBusinessSelect(business.id)}
            >
              <div className="flex flex-col items-start">
                <span>{business.name}</span>
                <span className="text-xs text-gray-500 capitalize">Role: {business.role}</span>
              </div>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 