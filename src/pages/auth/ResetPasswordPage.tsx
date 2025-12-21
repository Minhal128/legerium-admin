import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { api } from '@/services/api'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  // Determine initial step based on path or default to email
  const [step, setStep] = useState(location.pathname === '/forgot-password' ? 1 : 1) // 1: Email, 2: OTP, 3: New Password
  
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    
    try {
      await api.post('/auth/forgot-password', { email })
      setMessage('OTP sent to your email')
      setStep(2)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await api.post('/auth/verify-reset-code', { email, code: otp })
      setStep(3)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    
    setLoading(true)
    setError('')
    
    try {
      await api.post('/auth/reset-password', { email, code: otp, password })
      navigate('/login', { state: { message: 'Password reset successfully. Please login.' } })
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen auth-background flex items-center justify-center px-4 py-6 sm:p-4">
      <div className="w-full max-w-md mx-auto">
        <h1 className="text-xl sm:text-2xl font-bold text-white text-center mb-6 sm:mb-8 tracking-wide">
          {step === 1 ? 'RESET PASSWORD' : step === 2 ? 'ENTER OTP' : 'NEW PASSWORD'}
        </h1>
        
        <Card className="border-0 shadow-lg sm:shadow-2xl">
          <CardContent className="p-4 sm:p-6 md:p-8">
            {step === 1 && (
              <>
                <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Enter your email address to receive a reset code
                </p>
                <form onSubmit={handleSendOtp} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 text-sm sm:text-base">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@legerium.com"
                      className="text-sm sm:text-base h-10 sm:h-11"
                    />
                  </div>
                  {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full h-10 sm:h-12 text-sm sm:text-base" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Code'}
                  </Button>
                  <Button variant="link" className="w-full text-xs sm:text-sm" onClick={() => navigate('/login')}>
                    Back to Login
                  </Button>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Enter the OTP code sent to <span className="font-medium break-all">{email}</span>
                </p>
                <form onSubmit={handleVerifyOtp} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp" className="text-gray-700 text-sm sm:text-base">OTP Code</Label>
                    <Input
                      id="otp"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      placeholder="123456"
                      maxLength={6}
                      className="text-center letter-spacing-2 text-lg sm:text-xl h-12 sm:h-14"
                    />
                  </div>
                  {message && <p className="text-xs sm:text-sm text-green-500">{message}</p>}
                  {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full h-10 sm:h-12 text-sm sm:text-base" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify Code'}
                  </Button>
                  <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-0 mt-3 sm:mt-4">
                    <Button variant="link" onClick={() => setStep(1)} type="button" className="text-xs sm:text-sm px-0">
                      Change Email
                    </Button>
                    <Button variant="link" onClick={() => handleSendOtp} type="button" className="text-xs sm:text-sm px-0">
                      Resend OTP
                    </Button>
                  </div>
                </form>
              </>
            )}

            {step === 3 && (
              <>
                <p className="text-center text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
                  Create a new password for your account
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4 sm:space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 text-sm sm:text-base">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={8}
                        className="text-sm sm:text-base h-10 sm:h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-gray-700 text-sm sm:text-base">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="text-sm sm:text-base h-10 sm:h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                      </button>
                    </div>
                  </div>

                  {error && <p className="text-xs sm:text-sm text-red-500">{error}</p>}
                  <Button type="submit" className="w-full h-10 sm:h-12 text-sm sm:text-base" disabled={loading}>
                    {loading ? 'Resetting...' : 'Reset Password'}
                  </Button>
                </form>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}