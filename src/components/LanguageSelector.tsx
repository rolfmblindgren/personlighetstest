import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select"

import { useState, useEffect } from "react"

export function LanguageSelector() {
  const [language, setLanguage] = useState("nb")

  useEffect(() => {
    const stored = localStorage.getItem("language")
    if (stored) setLanguage(stored)
  }, [])

  const handleChange = (value: string) => {
    setLanguage(value)
    localStorage.setItem("language", value)
    // Du kan her trigge i18n eller oppdatere context
    console.log("Språk endret til:", value)
  }

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className="w-[120px] bg-white/60 hover:bg-white">
        <SelectValue placeholder="Språk" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="nb">🇳🇴 Bokmål</SelectItem>
        <SelectItem value="nn">🧭 Nynorsk</SelectItem>
        <SelectItem value="fkv">🪶 Kvensk</SelectItem>
        <SelectItem value="rme">🎻 Tater(ish)</SelectItem>
      </SelectContent>
    </Select>
  )
}
