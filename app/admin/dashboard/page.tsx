import { generateAnalytics } from '@/lib/analytics/generate'
import { isAdmin } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'
import DashboardContent from './DashboardContent'

// Admin pages must be dynamic to ensure session isolation
export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  try {
    // Check admin access
    const admin = await isAdmin()
    if (!admin) {
      redirect('/')
    }
    
    const { data: analytics, error } = await generateAnalytics()
    
    if (error || !analytics) {
      console.error('Analytics generation error:', error)
      return (
        <div style={{ padding: '40px' }}>
          <h1>Admin Dashboard</h1>
          <p style={{ color: '#ef4444', marginBottom: '16px' }}>Error loading analytics: {error || 'Unknown error'}</p>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            Please check the server logs for more details. This might be due to missing data or database connection issues.
          </p>
        </div>
      )
    }

    return <DashboardContent analytics={analytics} />
  } catch (error) {
    console.error('Admin dashboard error:', error)
    return (
      <div style={{ padding: '40px' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>
          An error occurred while loading the dashboard
        </p>
        <p style={{ color: '#64748b', fontSize: '14px' }}>
          {error instanceof Error ? error.message : 'Unknown error'}
        </p>
      </div>
    )
  }
}
