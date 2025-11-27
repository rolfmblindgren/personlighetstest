// src/components/Layout.jsx
import { Link } from 'react-router-dom'
import logo from '@/assets/Grendel-G.png'
import { H1 } from '@/components/Heading.tsx'
import { t } from "@/i18n"
import LanguagePicker from "@/components/LanguagePicker"
import { useAuth } from "@/context/AuthContext";  // 👈 ny

export function Layout({ children }) {
  const { loggedIn } = useAuth();
  console.log("Layout render → loggedIn =", loggedIn);

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 md:p-10">


	<header className="bg-teal-200 p-4 rounded-lg mb-6">
  <div className="flex flex-wrap items-center justify-between gap-4">
    <div className="flex items-center space-x-4">
      {logo && <Link to="/"><img src={logo} className="h-12 w-auto" alt="Grendel logo" /></Link>}
      <H1>{t("title")}</H1>
    </div>

    <div className="flex items-center space-x-4 ml-auto">

      <Link
        to="/CHANGELOG"
        className="text-sm font-medium text-teal-900 hover:text-teal-700 hover:underline underline-offset-2"
      >
        {t("changelogTitle")}
      </Link>


      <Link
        to="/GDPR"
        className="text-sm font-medium text-teal-900 hover:text-teal-700 hover:underline underline-offset-2"
      >
        🛡️ {t("GDPR")}
      </Link>

      {loggedIn && (
        <nav className="flex space-x-4">
          <Link to="/dashboard" className="text-sm font-medium text-teal-900 hover:text-teal-700">
            {t("dashboard")}
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
