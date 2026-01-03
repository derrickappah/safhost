import Link from 'next/link'
import { getSchools } from '@/lib/actions/schools'

export default async function AdminSchoolsPage() {
  const { data: schools } = await getSchools()

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700 }}>Schools</h1>
        <Link
          href="/admin/schools/new"
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: 600
          }}
        >
          Add School
        </Link>
      </div>
      
      {schools && schools.length > 0 ? (
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
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Location</th>
                <th style={{ textAlign: 'left', padding: '12px', fontSize: '14px', fontWeight: 600 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {schools.map((school) => (
                <tr key={school.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{school.name}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#64748b' }}>{school.location}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    <Link
                      href={`/admin/schools/${school.id}`}
                      style={{
                        color: '#2563eb',
                        textDecoration: 'none'
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
          <p style={{ color: '#64748b', marginBottom: '16px' }}>No schools found</p>
          <Link
            href="/admin/schools/new"
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
            Add First School
          </Link>
        </div>
      )}
    </div>
  )
}
