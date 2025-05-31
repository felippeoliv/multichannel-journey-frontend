import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

interface InviteData {
  name: string
  password: string
  confirmPassword: string
}

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [inviteData, setInviteData] = useState<InviteData>({
    name: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [inviteInfo, setInviteInfo] = useState<{ email: string; business_name: string } | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      toast.error('Invalid invite link')
      navigate('/auth/login')
      return
    }

    // TODO: Implementar verificação do token e carregar informações do convite
    // Por enquanto, vamos simular com dados mockados
    setInviteInfo({
      email: 'user@example.com',
      business_name: 'Example Business'
    })
  }, [token, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (inviteData.password !== inviteData.confirmPassword) {
        throw new Error('Passwords do not match')
      }

      if (!token) {
        throw new Error('Invalid invite token')
      }

      await authService.acceptInvite(
        token,
        inviteData.name,
        inviteData.password
      )

      toast.success('Account created successfully! You can now log in.')
      navigate('/auth/login')
    } catch (error) {
      toast.error('Failed to create account. Please try again.')
      console.error('Invite acceptance error:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!inviteInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we verify your invite.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Accept Invitation</CardTitle>
          <CardDescription>
            You've been invited to join {inviteInfo.business_name}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={inviteInfo.email}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={inviteData.name}
                onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={inviteData.password}
                onChange={(e) => setInviteData({ ...inviteData, password: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={inviteData.confirmPassword}
                onChange={(e) => setInviteData({ ...inviteData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => navigate('/auth/login')}
            >
              Already have an account? Sign in
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
} 