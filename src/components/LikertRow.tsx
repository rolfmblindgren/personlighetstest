// components/LikertRowText.tsx
import React from "react";
import { useEffect, useState } from "react"
import {t as tr } from "@/i18n";
import { testLabels } from "@/i18n/testlabels";

const testLang = localStorage.getItem("testLanguage") || "nb";


type Props = {
  question?: string;
  value: number | null;           // valgt 0..6 (eller null)
  onChange: (n: number) => void;  // kalles når bruker velger
  labels?: string[];
  framed?: boolean;
};


const NO_LABELS_7 = [
  "heltenig",
  "noksåenig",
  "littenig",
  "usikker",
  "littuenig",
  "noksåuenig",
  "heltuenig"
];


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

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setTestLang(e.detail) // oppdater språk
    }
    document.addEventListener("testlanguageChanged", handler as EventListener)
    return () => document.removeEventListener("testlanguageChanged", handler as EventListener)
  }, [])


  const getLabel = (key: keyof typeof testLabels["nb"]) => {
    const langSet = testLabels[testLang as keyof typeof testLabels] || testLabels.nb
    return langSet[key] || testLabels.nb[key]
  }


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
                " px-4 py-2 whitespace-normal  rounded-full border-2 transition text-black",
                COLOR_CLASSES[idx],
                isSelected ? "bg-green-600 text-white font-semibold" : "hover:bg-gray-200",
              ].join(" ")}
            >
              {getLabel(label)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
