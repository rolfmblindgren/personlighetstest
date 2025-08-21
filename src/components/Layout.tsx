// src/components/Layout.jsx

import logo from '@/assets/Grendel-G.png'
import { H1, H2 } from '@/components/Heading.tsx'

export function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 md:p-10">
	        <header className="bg-teal-200 p-4 rounded-lg">
          <div className="flex items-center space-x-4">
            {logo && <img src={logo} className="h-12 w-auto" alt="Grendel logo" />}
            <H1>Grendel Personlighetstest</H1>
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
