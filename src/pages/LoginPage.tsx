import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Check your email to confirm your account.')
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      // on success, redirect will be handled by App.tsx once we add auth state
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo / Brand */}
        <div className="text-center flex flex-col items-center gap-3">
          <div className="flex items-center gap-3">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <polyline points="2,32 20,10 38,32" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
              <polyline points="10,32 20,18 30,32" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.5"/>
            </svg>
            <h1 className="text-4xl font-bold text-white tracking-tight">Ridgeline</h1>
          </div>
          <p className="text-stone-400 text-sm">Built for the Trades</p>
        </div>

        <Card className="bg-stone-900 border-stone-800">
          <CardHeader>
            <CardTitle className="text-white">{isSignUp ? 'Create Account' : 'Sign In'}</CardTitle>
            <CardDescription className="text-stone-400">
              {isSignUp ? 'Get started with Ridgeline' : 'Welcome back'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-stone-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-stone-300">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className="bg-stone-800 border-stone-700 text-white placeholder:text-stone-500"
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white" disabled={loading}>
                {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
              </Button>

              {!isSignUp && (
                <Button variant="link" className="w-full text-stone-400 hover:text-white" type="button">
                  Forgot password?
                </Button>
              )}
            </form>

            <div className="mt-4 text-center text-sm text-stone-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-emerald-500 hover:text-emerald-400 font-medium"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
