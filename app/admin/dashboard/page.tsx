import { createClient } from '@/lib/supabase/server'
import { generateAnalytics } from '@/lib/analytics/generate'
import { isAdmin } from '@/lib/auth/middleware'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import ExportButtonsClient from './ExportButtons'

export default async function AdminDashboard() {
  // Check admin access
  const admin = await isAdmin()
  if (!admin) {
    redirect('/')
  }
  
  const { data: analytics, error } = await generateAnalytics()
  
  if (error || !analytics) {
    return (
      <div style={{ padding: '40px' }}>
        <h1>Admin Dashboard</h1>
        <p style={{ color: '#ef4444' }}>Error loading analytics: {error}</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, margin: 0 }}>
          Admin Dashboard
        </h1>
        <ExportButtonsClient />
      </div>
      
      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Total Hostels
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
            {analytics.totalHostels}
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Schools
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
            {analytics.totalSchools}
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Active Subscriptions
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
            {analytics.activeSubscriptions}
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Total Revenue
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#059669' }}>
            GHS {analytics.totalRevenue.toFixed(2)}
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Hostel Views
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
            {analytics.hostelViews}
          </p>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ fontSize: '14px', color: '#64748b', marginBottom: '8px' }}>
            Reviews
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 700, color: '#1e293b' }}>
            {analytics.reviewsCount}
          </p>
        </div>
      </div>
      
      {/* Revenue Breakdown */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Revenue per School */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Revenue per School
          </h2>
          {analytics.revenuePerSchool.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analytics.revenuePerSchool.slice(0, 5).map((item) => (
                <div key={item.schoolId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {item.schoolName}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>
                    GHS {(item.revenue / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>No revenue data</p>
          )}
        </div>
        
        {/* Revenue per Region */}
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
            Revenue per Region
          </h2>
          {analytics.revenuePerRegion.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {analytics.revenuePerRegion.slice(0, 5).map((item, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '8px'
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {item.region}
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#059669' }}>
                    GHS {(item.revenue / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#64748b' }}>No revenue data</p>
          )}
        </div>
      </div>
      
      {/* Popular Hostels */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Popular Hostels
        </h2>
        {analytics.popularHostels.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Hostel</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Views</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Contacts</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {analytics.popularHostels.map((hostel) => (
                <tr key={hostel.hostelId} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}>
                    {hostel.hostelName}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{hostel.views}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{hostel.contacts}</td>
                  <td style={{ padding: '12px', fontSize: '14px', fontWeight: 600 }}>
                    {hostel.views + hostel.contacts}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b' }}>No data available</p>
        )}
      </div>
      
      {/* Subscription Status */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Subscription Status
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px'
        }}>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#16a34a', marginBottom: '4px' }}>
              {analytics.subscriptionStatus.active}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Active</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fef3c7', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#d97706', marginBottom: '4px' }}>
              {analytics.subscriptionStatus.pending}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Pending</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fee2e2', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#dc2626', marginBottom: '4px' }}>
              {analytics.subscriptionStatus.expired}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Expired</div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#64748b', marginBottom: '4px' }}>
              {analytics.subscriptionStatus.cancelled}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>Cancelled</div>
          </div>
        </div>
      </div>
      
      {/* Recent Payments */}
      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px' }}>
          Recent Payments
        </h2>
        {analytics.recentPayments.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Amount</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', color: '#64748b' }}>Reference</th>
              </tr>
            </thead>
            <tbody>
              {analytics.recentPayments.map((payment: any) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {new Date(payment.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    GHS {Number(payment.amount) / 100}
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: payment.status === 'success' ? '#dcfce7' : '#fee2e2',
                      color: payment.status === 'success' ? '#166534' : '#991b1b',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {payment.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                    {payment.provider_ref || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p style={{ color: '#64748b', padding: '24px 0' }}>No recent payments</p>
        )}
      </div>
    </div>
  )
}
