// components/LikertRowText.tsx
import React, { useId, KeyboardEvent } from "react";

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
  const legendId = useId(); // for aria-labelledby

  const COLOR_CLASSES = [
    "border-red-700",     // Helt uenig
    "border-red-500",
    "border-orange-400",
    "border-yellow-400",  // Usikker
    "border-lime-400",
    "border-green-400",
    "border-green-700",   // Helt enig
  ];

  function onGroupKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();

    const max = labels.length - 1;
    const cur = value ?? 0;
    const next =
      e.key === "ArrowLeft"
        ? (cur - 1 + labels.length) % labels.length
        : (cur + 1) % labels.length;

    onChange(next);
  }

  return (
    <fieldset className="rounded-xl p-4 bg-white border shadow-inner shadow-gray-400">
      <legend id={legendId} className="mb-3 font-medium bg-white">
        {question}
      </legend>

      <div
        role="radiogroup"
        aria-labelledby={legendId}
        className="flex flex-wrap justify-center gap-2"
        onKeyDown={onGroupKeyDown}
      >
        {labels.map((label, i) => {
          const isSelected = value === i;
          const base =
            "px-4 py-2 min-w-[110px] rounded-full border-2 transition text-black " +
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500";

          const selected = isSelected
            ? "bg-green-600 text-white font-semibold"
            : "hover:bg-gray-200";

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={isSelected ? 0 : -1}
              className={`${base} ${COLOR_CLASSES[i]} ${selected}`}
              onClick={() => onChange(i)}
              onKeyDown={(e) => {
                // Støtt Enter/Space direkte på knappen (Space kan ellers scrolle)
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onChange(i);
                }
              }}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
