import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { isTokenValid } from '@/auth'
import { API } from '@/lib/apiBase'
import Button from '@/components/Button'
import UsersWidget from '@/components/UsersWidget'
import TestWidget from '@/components/TestWidget'
import { H1, H2, H3 } from '@/components/Heading'

export default function Dashboard() {
  const navigate = useNavigate()

  useEffect(() => {
    if (!isTokenValid()) {
      localStorage.removeItem('token')
      navigate('/')
    }
  }, [])
  
  
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logg ut
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Antall brukere</CardTitle>
          </CardHeader>
          <CardContent>
	    <UsersWidget />
          </CardContent>
        </Card>

	<Card>
          <CardHeader><CardTitle>Siste tester</CardTitle></CardHeader>
          <CardContent>
            <TestWidget countOnly />
          </CardContent>
	</Card>

        <Card>
          <CardHeader>
            <CardTitle>Aktive tester</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">23</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Innstillinger</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Administrer systemoppsett og tillatelser.</p>
          </CardContent>
        </Card>
      </div>

      {/* Siste tester */}
      <Card>
        <CardHeader><CardTitle>Siste tester</CardTitle></CardHeader>
        <CardContent>
          <TestWidget limit={8} />
        </CardContent>
      </Card>

    </div>
  )
}
