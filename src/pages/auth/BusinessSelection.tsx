import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function BusinessSelection() {
  const { user, loading, selectBusiness } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) {
      navigate('/auth/login')
    } else if (user.selectedBusinessId) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleBusinessSelect = async (businessId: string) => {
    try {
      await selectBusiness(businessId)
      navigate('/dashboard')
    } catch (error) {
      toast.error('Failed to select business. Please try again.')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user?.businesses?.length) {
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
          {user.businesses.map((business) => (
            <Button
              key={business.id}
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleBusinessSelect(business.id)}
            >
              {business.name}
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
} 