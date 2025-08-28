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
  question?: string;
  value: number | null;           // valgt 0..6 (eller null)
  onChange: (n: number) => void;  // kalles når bruker velger
  labels?: string[];
  framed?: boolean;
};

export default function LikertRowText({
  question,
  value,
  onChange,
  labels = NO_LABELS_7,
  framed = true,
}: Props) {
  const COLOR_CLASSES = [
    "border-red-700",
    "border-red-500",
    "border-orange-400",
    "border-yellow-400",
    "border-lime-400",
    "border-green-400",
    "border-green-700",
  ];

  const container = framed
    ? "rounded-xl p-4 bg-white border shadow-inner shadow-gray-300/70"
    : "";

  return (
    <fieldset className={container}>
      {question && <legend className="mb-3 font-medium bg-white">{question}</legend>}

      {/* en rad knapper */}
      <div className="w-full flex flex-nowrap gap-3 overflow-x-auto justify-center">
        {labels.map((label, idx) => {
          const isSelected = value === idx;
          return (
            <button
              key={idx}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onChange(idx);
              }}
              onClick={() => onChange(idx)}
              className={[
                "flex-none px-4 py-2 rounded-full border-2 transition text-black whitespace-nowrap",
                COLOR_CLASSES[idx],
                isSelected ? "bg-green-600 text-white font-semibold" : "hover:bg-gray-200",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
