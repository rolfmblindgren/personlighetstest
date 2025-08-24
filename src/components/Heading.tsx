export function H1 ({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl font-bold mb-4">
      {children}
    </h1>
  )
}

export function H2 ({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-2xl font-semibold mb-3">
      {children}
    </h2>
  )
}

export function H3 ({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-1xl font-semibold mb-2">
      {children}
    </h3>
  )
}
