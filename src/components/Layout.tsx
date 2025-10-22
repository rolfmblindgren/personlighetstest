// src/components/Layout.jsx
import { Link } from 'react-router-dom'
import logo from '@/assets/Grendel-G.png'
import { H1 } from '@/components/Heading.tsx'
import { isTokenValid } from '@/auth'
import { t } from "@/i18n"
import LanguagePicker from "@/components/LanguagePicker"

export function Layout({ children }) {
  const loggedIn = isTokenValid()

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 md:p-10">
        <header className="bg-teal-200 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {logo && <img src={logo} className="h-12 w-auto" alt="Grendel logo" />}
              <H1>{t("title")}z</H1>
            </div>

            <div className="flex items-center space-x-4">
              {loggedIn && (
                <nav className="flex space-x-4">
                  <Link to="/dashboard" className="text-sm font-medium text-teal-900 hover:text-teal-700">
                    {t("dashboard")}
                  </Link>
                  <Link to="/tests" className="text-sm font-medium text-teal-900 hover:text-teal-700">
                    {t("myTests")}
                  </Link>
                </nav>
              )}
              <LanguagePicker />
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  )
}
