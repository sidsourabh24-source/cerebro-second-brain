import { Suspense } from 'react'
import LoginForm from './LoginForm'

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
