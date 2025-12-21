import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { authService } from '@/services/authService'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      await authService.login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-background flex items-center justify-center p-3 sm:p-4 md:p-6">
      <div className="w-full max-w-[90vw] sm:max-w-md mx-auto px-2 sm:px-0">
        <h1 className="text-xl sm:text-2xl md:text-2xl font-bold text-white text-center mb-6 sm:mb-8 tracking-wide">
          LEGERIUM ADMIN SIGN IN
        </h1>
        
        <Card className="border-0 shadow-xl sm:shadow-2xl">
          <CardContent className="p-4 sm:p-6 md:p-8">
            <p className="text-center text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Please fill in your unique admin login details below
            </p>

            {error && (
              <div className="bg-red-50 text-red-500 p-2 sm:p-3 rounded-md mb-3 sm:mb-4 text-xs sm:text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="email" className="text-gray-700 text-sm sm:text-base">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder=""
                  required
                  className="text-sm sm:text-base h-10 sm:h-11"
                />
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="password" className="text-gray-700 text-sm sm:text-base">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=""
                    required
                    className="text-sm sm:text-base h-10 sm:h-11 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                    ) : (
                      <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="text-right">
                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  forgot password?
                </Link>
              </div>

              <Button 
                type="submit" 
                className="w-full h-10 sm:h-12 text-sm sm:text-base" 
                disabled={isLoading}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}