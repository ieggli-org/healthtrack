'use client'

import { motion } from 'framer-motion'
import { createBrowserClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const supabase = createBrowserClient()

  const signIn = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-2xl p-10 w-full max-w-sm flex flex-col items-center gap-6"
      >
        <div className="flex flex-col items-center gap-2">
          <h1 className="font-fraunces text-4xl text-heading font-light tracking-tight">
            HealthTrack
          </h1>
          <p className="text-muted text-sm text-center">
            Your weight, understood.
          </p>
        </div>

        <button
          onClick={signIn}
          className="w-full flex items-center justify-center gap-3 bg-surface-2 hover:bg-border border border-border text-heading rounded-xl px-4 py-3 text-sm font-medium transition-colors duration-150 cursor-pointer"
        >
          <GoogleIcon />
          Continue with Google
        </button>

        <p className="text-muted text-xs text-center">
          Personal weight tracking with analytics and projections.
        </p>
      </motion.div>
    </main>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}
