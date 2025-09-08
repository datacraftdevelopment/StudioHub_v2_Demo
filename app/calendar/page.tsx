import React from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import CalendarClient from '@/components/CalendarClient'

export default function CalendarPage() {
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
    <React.Fragment>
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <CalendarClient user={user} />
      </main>
    </React.Fragment>
  )
}