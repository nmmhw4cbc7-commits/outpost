import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/')
      } else {
        navigate('/login')
      }
    })
  }, [navigate])

  return (
    <div className="min-h-screen bg-beige-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-matcha-200 border-t-matcha-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-matcha-600 font-serif text-lg">Signing you in...</p>
      </div>
    </div>
  )
}
