import ProfileHeader from './Header'

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <ProfileHeader />
      {children}
    </>
  )
}
