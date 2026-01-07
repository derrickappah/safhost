import CompareHeader from './Header'

export default function CompareLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CompareHeader />
      {children}
    </>
  )
}
