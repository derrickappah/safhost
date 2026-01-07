import SubscribeHeader from './Header'

export default function SubscribeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SubscribeHeader />
      {children}
    </>
  )
}
