// src/components/Layout.jsx

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="mx-auto max-w-5xl bg-white rounded-2xl shadow-lg ring-1 ring-black/5 p-6 md:p-10">
        {children}
      </div>
    </div>
  )
}
