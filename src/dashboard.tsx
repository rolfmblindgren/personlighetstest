import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from "@/context/AuthContext"
import { isTokenValid } from '@/auth'
import { API } from '@/lib/apiBase'
import Button from '@/components/Button'
import UsersWidget from '@/components/UsersWidget'
import TestWidget from '@/components/TestWidget'
import MyTestsWidget from "@/components/MyTestsWidget"
import { H1, H2, H3 } from '@/components/Heading'
import { t } from '@/i18n'

export default function Dashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="p-4">
      <div className="flex justify-end mb-4">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          {t('logout')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>{t('numberOfUsers')}</CardTitle></CardHeader>
          <CardContent><UsersWidget /></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{t('startNewTest')}</CardTitle></CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/tests")}
              className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700"
            >              {t('chooseTests')}
            </Button>
          </CardContent>
        </Card>

	<Card>
	  <CardHeader><CardTitle>{t("myTests")}</CardTitle></CardHeader>
  <CardContent><MyTestsWidget /></CardContent>
</Card>

        <Card>
          <CardHeader><CardTitle>{t('settings')}</CardTitle></CardHeader>
          <CardContent>
            <p>{t("goToAdminMenu")}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
