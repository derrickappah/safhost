'use client'

import { useState } from 'react'
import { IoEllipsisVertical } from 'react-icons/io5'
import AdminPageHeader from '../AdminPageHeader'
import ExportButtons from './ExportButtons'
import styles from './page.module.css'

interface DashboardContentProps {
  analytics: any
}

export default function DashboardContent({ analytics }: DashboardContentProps) {
  const [showExportMenu, setShowExportMenu] = useState(false)

  return (
    <div className={styles.container}>
      <AdminPageHeader 
        title="Admin Dashboard"
        actions={<ExportButtons />}
      />
      
      {/* Stats Grid */}
      <div className={styles.statsSection}>
        <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Hostels</h3>
          <p className={styles.statValue}>{analytics.totalHostels}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Schools</h3>
          <p className={styles.statValue}>{analytics.totalSchools}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Active Subscriptions</h3>
          <p className={styles.statValue}>{analytics.activeSubscriptions}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Revenue</h3>
          <p className={styles.statValueRevenue}>GHS {analytics.totalRevenue.toFixed(2)}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Hostel Views</h3>
          <p className={styles.statValue}>{analytics.hostelViews}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Total Contacts</h3>
          <p className={styles.statValue}>{analytics.totalContacts || 0}</p>
        </div>
        
        <div className={styles.statCard}>
          <h3 className={styles.statLabel}>Reviews</h3>
          <p className={styles.statValue}>{analytics.reviewsCount}</p>
        </div>
        </div>
      </div>
      
      {/* Revenue Breakdown */}
      <div className={styles.revenueGrid}>
        {/* Revenue per School */}
        <div className={styles.revenueCard}>
          <h2 className={styles.revenueTitle}>Revenue per School</h2>
          {analytics.revenuePerSchool.length > 0 ? (
            <div className={styles.revenueList}>
              {analytics.revenuePerSchool.slice(0, 5).map((item: any) => (
                <div key={item.schoolId} className={styles.revenueItem}>
                  <span className={styles.revenueItemName}>{item.schoolName}</span>
                  <span className={styles.revenueItemAmount}>
                    GHS {(item.revenue / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No revenue data</p>
          )}
        </div>
        
        {/* Revenue per Region */}
        <div className={styles.revenueCard}>
          <h2 className={styles.revenueTitle}>Revenue per Region</h2>
          {analytics.revenuePerRegion.length > 0 ? (
            <div className={styles.revenueList}>
              {analytics.revenuePerRegion.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className={styles.revenueItem}>
                  <span className={styles.revenueItemName}>{item.region}</span>
                  <span className={styles.revenueItemAmount}>
                    GHS {(item.revenue / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No revenue data</p>
          )}
        </div>
      </div>
      
      {/* Popular Hostels */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Popular Hostels</h2>
        {analytics.popularHostels.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Hostel</th>
                  <th className={styles.tableHeaderCell}>Views</th>
                  <th className={styles.tableHeaderCell}>Contacts</th>
                  <th className={styles.tableHeaderCell}>Total</th>
                </tr>
              </thead>
              <tbody>
                {analytics.popularHostels.map((hostel: any) => (
                  <tr key={hostel.hostelId} className={styles.tableRow}>
                    <td className={styles.tableCellBold} data-label="Hostel">
                      {hostel.hostelName}
                    </td>
                    <td className={styles.tableCell} data-label="Views">{hostel.views}</td>
                    <td className={styles.tableCell} data-label="Contacts">{hostel.contacts}</td>
                    <td className={styles.tableCellBold} data-label="Total">
                      {hostel.views + hostel.contacts}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile Card View */}
            <div className={styles.mobileCardList}>
              {analytics.popularHostels.map((hostel: any) => (
                <div key={hostel.hostelId} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <h3 className={styles.mobileCardTitle}>{hostel.hostelName}</h3>
                  </div>
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Views:</span>
                      <span className={styles.mobileCardValue}>{hostel.views}</span>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Contacts:</span>
                      <span className={styles.mobileCardValue}>{hostel.contacts}</span>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Total:</span>
                      <span className={styles.mobileCardValueBold}>{hostel.views + hostel.contacts}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>No data available</p>
        )}
      </div>
      
      {/* Subscription Status */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Subscription Status</h2>
        <div className={styles.statusGrid}>
          <div className={`${styles.statusCard} ${styles.statusActive}`}>
            <div className={`${styles.statusValue} ${styles.statusActiveValue}`}>
              {analytics.subscriptionStatus.active}
            </div>
            <div className={styles.statusLabel}>Active</div>
          </div>
          <div className={`${styles.statusCard} ${styles.statusPending}`}>
            <div className={`${styles.statusValue} ${styles.statusPendingValue}`}>
              {analytics.subscriptionStatus.pending}
            </div>
            <div className={styles.statusLabel}>Pending</div>
          </div>
          <div className={`${styles.statusCard} ${styles.statusExpired}`}>
            <div className={`${styles.statusValue} ${styles.statusExpiredValue}`}>
              {analytics.subscriptionStatus.expired}
            </div>
            <div className={styles.statusLabel}>Expired</div>
          </div>
          <div className={`${styles.statusCard} ${styles.statusCancelled}`}>
            <div className={`${styles.statusValue} ${styles.statusCancelledValue}`}>
              {analytics.subscriptionStatus.cancelled}
            </div>
            <div className={styles.statusLabel}>Cancelled</div>
          </div>
        </div>
      </div>
      
      {/* Views per User */}
      {analytics.viewsPerUser && analytics.viewsPerUser.length > 0 && (
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>Top Users by Views</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>User</th>
                <th className={styles.tableHeaderCell}>Total Views</th>
                <th className={styles.tableHeaderCell}>Unique Hostels</th>
              </tr>
            </thead>
            <tbody>
              {analytics.viewsPerUser.map((user: any) => (
                <tr key={user.userId} className={styles.tableRow}>
                  <td className={styles.tableCellBold} data-label="User">{user.userEmail}</td>
                  <td className={styles.tableCell} data-label="Total Views">{user.views}</td>
                  <td className={styles.tableCell} data-label="Unique Hostels">{user.uniqueHostels}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile Card View */}
          <div className={styles.mobileCardList}>
            {analytics.viewsPerUser.map((user: any) => (
              <div key={user.userId} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <h3 className={styles.mobileCardTitle}>{user.userEmail}</h3>
                </div>
                <div className={styles.mobileCardContent}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Total Views:</span>
                    <span className={styles.mobileCardValue}>{user.views}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Unique Hostels:</span>
                    <span className={styles.mobileCardValue}>{user.uniqueHostels}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts per User */}
      {analytics.contactsPerUser && analytics.contactsPerUser.length > 0 && (
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>Top Users by Contacts</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>User</th>
                <th className={styles.tableHeaderCell}>Total Contacts</th>
                <th className={styles.tableHeaderCell}>Unique Hostels</th>
              </tr>
            </thead>
            <tbody>
              {analytics.contactsPerUser.map((user: any) => (
                <tr key={user.userId} className={styles.tableRow}>
                  <td className={styles.tableCellBold} data-label="User">{user.userEmail}</td>
                  <td className={styles.tableCell} data-label="Total Contacts">{user.contacts}</td>
                  <td className={styles.tableCell} data-label="Unique Hostels">{user.uniqueHostels}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile Card View */}
          <div className={styles.mobileCardList}>
            {analytics.contactsPerUser.map((user: any) => (
              <div key={user.userId} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <h3 className={styles.mobileCardTitle}>{user.userEmail}</h3>
                </div>
                <div className={styles.mobileCardContent}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Total Contacts:</span>
                    <span className={styles.mobileCardValue}>{user.contacts}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Unique Hostels:</span>
                    <span className={styles.mobileCardValue}>{user.uniqueHostels}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Views Over Time */}
      {analytics.viewsOverTime && analytics.viewsOverTime.length > 0 && (
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>Views Over Time (Last 30 Days)</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Total Views</th>
                <th className={styles.tableHeaderCell}>Unique Views</th>
              </tr>
            </thead>
            <tbody>
              {analytics.viewsOverTime.slice(-10).map((item: any) => (
                <tr key={item.date} className={styles.tableRow}>
                  <td className={styles.tableCell} data-label="Date">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className={styles.tableCell} data-label="Total Views">{item.views}</td>
                  <td className={styles.tableCell} data-label="Unique Views">{item.uniqueViews}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile Card View */}
          <div className={styles.mobileCardList}>
            {analytics.viewsOverTime.slice(-10).map((item: any) => (
              <div key={item.date} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <h3 className={styles.mobileCardTitle}>
                    {new Date(item.date).toLocaleDateString()}
                  </h3>
                </div>
                <div className={styles.mobileCardContent}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Total Views:</span>
                    <span className={styles.mobileCardValue}>{item.views}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Unique Views:</span>
                    <span className={styles.mobileCardValue}>{item.uniqueViews}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Contacts Over Time */}
      {analytics.contactsOverTime && analytics.contactsOverTime.length > 0 && (
        <div className={styles.tableCard}>
          <h2 className={styles.tableTitle}>Contacts Over Time (Last 30 Days)</h2>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
              <tr>
                <th className={styles.tableHeaderCell}>Date</th>
                <th className={styles.tableHeaderCell}>Total Contacts</th>
                <th className={styles.tableHeaderCell}>Unique Contacts</th>
              </tr>
            </thead>
            <tbody>
              {analytics.contactsOverTime.slice(-10).map((item: any) => (
                <tr key={item.date} className={styles.tableRow}>
                  <td className={styles.tableCell} data-label="Date">
                    {new Date(item.date).toLocaleDateString()}
                  </td>
                  <td className={styles.tableCell} data-label="Total Contacts">{item.contacts}</td>
                  <td className={styles.tableCell} data-label="Unique Contacts">{item.uniqueContacts}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* Mobile Card View */}
          <div className={styles.mobileCardList}>
            {analytics.contactsOverTime.slice(-10).map((item: any) => (
              <div key={item.date} className={styles.mobileCard}>
                <div className={styles.mobileCardHeader}>
                  <h3 className={styles.mobileCardTitle}>
                    {new Date(item.date).toLocaleDateString()}
                  </h3>
                </div>
                <div className={styles.mobileCardContent}>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Total Contacts:</span>
                    <span className={styles.mobileCardValue}>{item.contacts}</span>
                  </div>
                  <div className={styles.mobileCardRow}>
                    <span className={styles.mobileCardLabel}>Unique Contacts:</span>
                    <span className={styles.mobileCardValue}>{item.uniqueContacts}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className={styles.tableCard}>
        <h2 className={styles.tableTitle}>Recent Payments</h2>
        {analytics.recentPayments.length > 0 ? (
          <>
            <table className={styles.table}>
              <thead className={styles.tableHeader}>
                <tr>
                  <th className={styles.tableHeaderCell}>Date</th>
                  <th className={styles.tableHeaderCell}>Amount</th>
                  <th className={styles.tableHeaderCell}>Status</th>
                  <th className={styles.tableHeaderCell}>Reference</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentPayments.map((payment: any) => (
                  <tr key={payment.id} className={styles.tableRow}>
                    <td className={styles.tableCell} data-label="Date">
                      {new Date(payment.created_at).toLocaleDateString()}
                    </td>
                    <td className={styles.tableCell} data-label="Amount">
                      GHS {Number(payment.amount) / 100}
                    </td>
                    <td className={styles.tableCell} data-label="Status">
                      <span className={`${styles.statusBadge} ${payment.status === 'success' ? styles.statusBadgeSuccess : styles.statusBadgeFailed}`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className={styles.tableCell} data-label="Reference">
                      <span className={styles.referenceCode}>
                        {payment.provider_ref || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {/* Mobile Card View */}
            <div className={styles.mobileCardList}>
              {analytics.recentPayments.map((payment: any) => (
                <div key={payment.id} className={styles.mobileCard}>
                  <div className={styles.mobileCardHeader}>
                    <h3 className={styles.mobileCardTitle}>
                      GHS {Number(payment.amount) / 100}
                    </h3>
                    <span className={`${styles.statusBadge} ${payment.status === 'success' ? styles.statusBadgeSuccess : styles.statusBadgeFailed}`}>
                      {payment.status}
                    </span>
                  </div>
                  <div className={styles.mobileCardContent}>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Date:</span>
                      <span className={styles.mobileCardValue}>
                        {new Date(payment.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className={styles.mobileCardRow}>
                      <span className={styles.mobileCardLabel}>Reference:</span>
                      <span className={styles.referenceCode}>
                        {payment.provider_ref || '-'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className={styles.emptyState}>No recent payments</p>
        )}
      </div>
    </div>
  )
}
