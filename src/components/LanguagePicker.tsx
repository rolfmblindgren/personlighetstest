// src/components/LanguagePicker.jsx
import { useEffect, useState } from "react"
import {
  DropdownMenu, DropdownMenuTrigger,
  DropdownMenuContent, DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const languages = { nb: "Bokmål", nn: "Nynorsk", se: "Davvisámegiella", fkv: "Kainun kieli" }

export default function LanguagePicker() {
  const [lang, setLang] = useState(localStorage.getItem("locale") || "nb")
  const [open, setOpen] = useState(false)

  // Ikke reload her – vent til valg er gjort
  useEffect(() => {
    localStorage.setItem("locale", lang)
  }, [lang])

  const choose = (code) => {
    setLang(code)
    setOpen(false)
    // gjør reload her (etter at menyen er lukket)
    window.location.reload()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {languages[lang] || "Velg språk"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
	className="bg-cyan-50 border border-cyan-200 shadow-lg"
        // hindrer at fokus «snapper» tilbake og lukker umiddelbart
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {Object.entries(languages).map(([code, label]) => (
          <DropdownMenuItem key={code} onSelect={(e) => { e.preventDefault(); choose(code) }}>
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
