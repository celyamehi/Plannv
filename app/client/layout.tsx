import ClientSidebar from '@/components/layout/ClientSidebar'

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientSidebar>
      {children}
    </ClientSidebar>
  )
}
