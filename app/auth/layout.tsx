import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Authentication - SafHost',
  description: 'Sign up or log in to access hostel listings',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="auth-layout">
      {children}
    </div>
  )
}
