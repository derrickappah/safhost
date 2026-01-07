import FavoritesHeader from './Header'

export default function FavoritesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FavoritesHeader />
      {children}
    </>
  )
}
