import AdvertisementHeader from './Header'

export default function AdvertisementLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <AdvertisementHeader />
      {children}
    </>
  )
}
