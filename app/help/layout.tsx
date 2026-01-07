import HelpHeader from './Header'

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <HelpHeader />
      {children}
    </>
  )
}
