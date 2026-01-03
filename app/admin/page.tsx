import { redirect } from 'next/navigation'
import { isAdmin } from '@/lib/auth/middleware'

export default async function AdminPage() {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }
  
  // Redirect to dashboard
  redirect('/admin/dashboard')
}
