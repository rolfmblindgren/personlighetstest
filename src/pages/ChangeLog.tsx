// src/pages/Changelog.tsx
import { useMemo } from "react";
import ReactMarkdown from "react-markdown";
import { t } from "@/i18n";

// Vite kan importere råfilinnhold med ?raw
import nb_md from "@/data/changelog_nb.md?raw";
import nn_md from "@/data/changelog_nn.md?raw"; // opprett når du har
import en_md from "@/data/changelog_en.md?raw"; // opprett når du har
import se_md from "@/data/changelog_se.md?raw"; // opprett når du har
import fkv_md from "@/data/changelog_fkv.md?raw"; // opprett når du har

const byLang: Record<string, string> = {
  nb: nb_md,
  nn: nn_md,
  en: en_md,
  se: se_md,
  fkv: fkv_md
};

export default function Changelog() {
  const lang = localStorage.getItem("locale") || "nb";
  const md = useMemo(() => byLang[lang] || byLang["nb"], [lang]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold mb-4">{t("changelogTitle")}</h1>
      <article className="prose prose-slate max-w-none">
        <ReactMarkdown>{md}</ReactMarkdown>
      </article>
    </div>
  );
}
