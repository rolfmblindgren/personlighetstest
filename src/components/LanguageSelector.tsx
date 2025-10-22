import { useEffect, useState } from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { t as tr } from "@/i18n"

const languages = {
  nb: "bokmål",
  nn: "nynorsk",
  se: "nordsamisk",
  fkv: "kvensk"
}

export function LanguageSelector() {
  const [open, setOpen] = useState(false)
  const [lang, setLang] = useState<string>()
  const [testLanguage, setTestLanguage] = useState<string>()

  // når komponenten lastes, bruk lagret test-språk eller default til grensesnitt-språket

  useEffect(() => {
    const update = () => {
      const uiLang = localStorage.getItem("locale") || "nb"
      const stored = localStorage.getItem("testLanguage")
      setLang(uiLang)
      setTestLanguage(stored || uiLang)
    }

    update() // første gang
    window.addEventListener("storage", update)
    return () => window.removeEventListener("storage", update)
  }, [])

  const choose = (value: string) => {
    setTestLanguage(value)
    setOpen(false)
    localStorage.setItem("testLanguage", value)

    // 🔔 Send event slik at andre komponenter kan reagere uten reload
    document.dispatchEvent(new CustomEvent("testlanguageChanged", {
      detail: value
    }))
    console.log("Testspråk endret til:", value)
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {tr(languages[testLanguage]) || tr("Velg språk")}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="bg-cyan-50 border border-cyan-200 shadow-lg"
        onCloseAutoFocus={(e) => {
          e.preventDefault()
          e.target.closest("button")?.focus()
        }}
      >
        {Object.entries(languages).map(([code, label]) => (
          <DropdownMenuItem
            key={code}
            onSelect={(e) => {
              e.preventDefault()
              choose(code)
            }}
          >
            {tr(label)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
