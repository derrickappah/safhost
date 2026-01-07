import SupportHeader from './Header'

export default function SupportLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SupportHeader />
      {children}
    </>
  )
}
