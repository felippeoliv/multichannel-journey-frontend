import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'

interface RegistrationData {
  email: string
  password: string
  name: string
  businessName?: string
  businessPlan?: 'free' | 'pro' | 'enterprise'
}

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    email: '',
    password: '',
    name: '',
  })
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handlePersonalInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStep(2)
  }

  const handleBusinessSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // First create the business
      const { data: businessData, error: businessError } = await supabase
        .from('businesses')
        .insert({
          name: registrationData.businessName,
          plan: registrationData.businessPlan || 'free',
          settings: {
            allowedChannels: [],
            maxUsers: 1,
            features: []
          }
        })
        .select()
        .single()

      if (businessError) throw businessError

      // Then create the user with the business ID
      await signUp(
        registrationData.email,
        registrationData.password,
        registrationData.name,
        businessData.id
      )

      toast.success('Account created successfully! Please check your email to verify your account.')
      navigate('/auth/login')
    } catch (error) {
      toast.error('Failed to create account. Please try again.')
      console.error('Registration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderPersonalInfoStep = () => (
    <form onSubmit={handlePersonalInfoSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Enter your name"
            value={registrationData.name}
            onChange={(e) => setRegistrationData({ ...registrationData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            value={registrationData.email}
            onChange={(e) => setRegistrationData({ ...registrationData, email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="Create a password"
            value={registrationData.password}
            onChange={(e) => setRegistrationData({ ...registrationData, password: e.target.value })}
            required
          />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full">
          Continue to Business Details
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
  )

  const renderBusinessStep = () => (
    <form onSubmit={handleBusinessSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            type="text"
            placeholder="Enter your business name"
            value={registrationData.businessName || ''}
            onChange={(e) => setRegistrationData({ ...registrationData, businessName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessPlan">Business Plan</Label>
          <select
            id="businessPlan"
            className="w-full p-2 border rounded-md"
            value={registrationData.businessPlan || 'free'}
            onChange={(e) => setRegistrationData({ ...registrationData, businessPlan: e.target.value as 'free' | 'pro' | 'enterprise' })}
            required
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Creating account...' : 'Create account'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => setStep(1)}
        >
          Back to Personal Info
        </Button>
      </CardFooter>
    </form>
  )

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>
            {step === 1 ? 'Create an account' : 'Business Details'}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? 'Sign up to get started with Exodus'
              : 'Tell us about your business'}
          </CardDescription>
        </CardHeader>
        {step === 1 ? renderPersonalInfoStep() : renderBusinessStep()}
      </Card>
    </div>
  )
} 