// src/pages/dashboard.tsx (eller hvor du nå bygger)
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Antall brukere</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">1</p>
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
  )
}