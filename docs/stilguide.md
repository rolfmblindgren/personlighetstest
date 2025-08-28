# Stilguide for enkle, tidløse komponenter

## farger og kontrast
- **Primærtekst:** svart på hvit bakgrunn (lettest å lese, tidløst uttrykk).
- **Valgmarkering:** grønn bakgrunn, hvit tekst, fet skrift → signaliserer «aktivt valg» tydelig uten å være aggressivt.
- **Rammer:** bruk gradvis fargeskala som gir *visuelle cues* (rød → oransje → gul → lime → grønn) uten at teksten farges.
- **Hover-effekt:** subtil grå bakgrunn (`hover:bg-gray-200`) for at knappene skal føles interaktive.

## former og spacing
- **Runde hjørner:** `rounded-full` for knapper gir et mykt, moderne preg.
- **Jevn luft:** `px-4 py-2` på knapper, `gap-2` mellom knapper, `p-4` rundt hver blokk.
- **Begrens bredde:** `min-w-[110px]` gir lik størrelse og forhindrer brutt layout.

## rammer og bakgrunn
- **Komponentramme:** `fieldset` med hvit bakgrunn, subtil skygge (`shadow-inner shadow-gray-400`) → gir lett «innsunken» effekt.
- **Legends:** bakgrunn hvit for å integrere med feltet uten unødige linjer.
- **Knapper:** `border-2` + fargeklasser for å trekke blikket mot valgmulighetene, men la teksten være nøytral.

## tilgjengelighet
- **Bruk `role="radiogroup"` og `role="radio"`.**
- **Bruk `aria-checked` for valgt tilstand.**
- **Støtt tastatur:** `onKeyDown` med Enter/Space for å velge.

## filosofi
- Unngå tall (0–6), bruk språk («helt uenig» → «helt enig»).
- Bruk farge som veiviser, ikke som pynt.
- Hold tekstsort på hvitt for lesbarhet og tidløshet.
- Ikke overless med ekstra grafikk eller ikoner med mindre det gir reell verdi.

---

# eksempel: likert-rad i react + tailwind

```tsx
// components/LikertRowText.tsx
import React from "react";

const NO_LABELS_7 = [
  "Helt uenig",
  "Nokså uenig",
  "Litt uenig",
  "Usikker",
  "Litt enig",
  "Nokså enig",
  "Helt enig",
];

type Props = {
  question: string;
  value: number | null;           // valgt indeks 0..6 (eller null)
  onChange: (n: number) => void;  // kalles når bruker velger
  labels?: string[];
};

export default function LikertRowText({
  question,
  value,
  onChange,
  labels = NO_LABELS_7,
}: Props) {
  const COLOR_CLASSES = [
    "border-red-700",     // Helt uenig
    "border-red-500",
    "border-orange-400",
    "border-yellow-400",  // Usikker
    "border-lime-400",
    "border-green-400",
    "border-green-700",   // Helt enig
  ];

  return (
    <fieldset className="rounded-xl p-4 bg-white border shadow-inner shadow-gray-400">
      <legend className="mb-3 font-medium bg-white">{question}</legend>
      <div className="flex flex-wrap justify-center gap-2" role="radiogroup">
        {labels.map((label, v) => {
          const base =
            "px-4 py-2 min-w-[110px] rounded-full border-2 transition text-black";
          const isSelected = value === v;
          const selected = isSelected
            ? "bg-green-600 text-white font-semibold"
            : "hover:bg-gray-200";

          return (
            <button
              key={v}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onChange(v);
              }}
              className={`${base} ${COLOR_CLASSES[v]} ${selected}`}
              onClick={() => onChange(v)}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
```
