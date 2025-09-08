import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Navigation from '@/components/Navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const userCookie = cookies().get('fm-user')
  
  if (!userCookie) {
    redirect('/login')
  }

  let user
  try {
    user = JSON.parse(userCookie.value)
  } catch {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation user={user} />
      {children}
    </div>
  )
}