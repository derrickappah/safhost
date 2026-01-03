import Link from 'next/link'
import { getHostels } from '@/lib/actions/hostels'

export default async function AdminHostelsPage() {
  const { data: hostels } = await getHostels({ limit: 100 })

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Hostels</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link
            href="/admin/hostels/bulk-upload"
            style={{
              padding: '12px 24px',
              backgroundColor: '#f1f5f9',
              color: '#1e293b',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              border: '1px solid #e2e8f0'
            }}
          >
            Bulk Upload
          </Link>
          <Link
            href="/admin/hostels/new"
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600
            }}
          >
            Add Hostel
          </Link>
        </div>
      </div>
      
      {hostels && hostels.length > 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Name</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Price</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Rating</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Status</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {hostels.map((hostel) => (
                <tr key={hostel.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{hostel.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>GHS {hostel.price_min}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{Number(hostel.rating).toFixed(1)}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: hostel.is_active ? '#dcfce7' : '#fee2e2',
                      color: hostel.is_active ? '#166534' : '#991b1b',
                      fontSize: '12px',
                      fontWeight: 600
                    }}>
                      {hostel.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <Link
                      href={`/admin/hostels/${hostel.id}`}
                      style={{
                        color: '#2563eb',
                        textDecoration: 'none',
                        marginRight: '16px'
                      }}
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          padding: '48px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#64748b', marginBottom: '16px' }}>No hostels found</p>
          <Link
            href="/admin/hostels/new"
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-block'
            }}
          >
            Add First Hostel
          </Link>
        </div>
      )}
    </div>
  )
}
