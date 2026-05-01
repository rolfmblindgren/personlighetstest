import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { t as tr } from "@/i18n";
import { languages } from "@/i18n/languages";

export function LanguageSelector() {
  const [open, setOpen] = useState(false);
  const [testLanguage, setTestLanguage] = useState<string>();

  useEffect(() => {
    const update = () => {
      const uiLang = localStorage.getItem("locale") || "nb";
      const stored = localStorage.getItem("testLanguage");
      setTestLanguage(stored || uiLang);
    };

    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  const choose = (value: string) => {
    setTestLanguage(value);
    setOpen(false);
    localStorage.setItem("testLanguage", value);

    document.dispatchEvent(new CustomEvent("testlanguageChanged", {
      detail: value
    }));
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {tr(languages[testLanguage as keyof typeof languages]) || tr("Velg språk")}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="bg-cyan-50 border border-cyan-200 shadow-lg"
        onCloseAutoFocus={(e) => {
          e.preventDefault();
          e.target.closest("button")?.focus();
        }}
      >
        {Object.entries(languages).map(([code, label]) => (
          <DropdownMenuItem
            key={code}
            onSelect={(e) => {
              e.preventDefault();
              choose(code);
            }}
          >
            {tr(label)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
