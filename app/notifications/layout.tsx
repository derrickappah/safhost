import NotificationsHeader from './Header'

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NotificationsHeader />
      {children}
    </>
  )
}
