import FeedbackHeader from './Header'

export default function FeedbackLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <FeedbackHeader />
      {children}
    </>
  )
}
