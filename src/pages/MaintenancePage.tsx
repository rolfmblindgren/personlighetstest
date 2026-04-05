import logo from "@/assets/Grendel-G.png";
import Button from "@/components/Button";
import LanguagePicker from "@/components/LanguagePicker";
import { t } from "@/i18n";
import { useLang } from "@/i18n/hooks";
import type { MaintenanceState } from "@/lib/maintenance";

type Props = {
  state: MaintenanceState;
  onRetry: () => void | Promise<void>;
};

const LOCALE_MAP: Record<string, string> = {
  nb: "nb-NO",
  nn: "nn-NO",
  se: "se-NO",
  fkv: "nb-NO",
};

function formatUntil(until: string | null | undefined, lang: string): string {
  if (!until) return "";

  const date = new Date(until);
  if (Number.isNaN(date.getTime())) {
    return until;
  }

  return new Intl.DateTimeFormat(LOCALE_MAP[lang] || "nb-NO", {
    dateStyle: "full",
    timeStyle: "short",
  }).format(date);
}

export default function MaintenancePage({ state, onRetry }: Props) {
  const lang = useLang();
  const formattedUntil = formatUntil(state.until, lang);

  return (
    <div className="min-h-screen overflow-hidden bg-[linear-gradient(180deg,#e8fffb_0%,#f8fbff_45%,#eef7f4_100%)] px-6 py-10 text-slate-900">
      <div className="pointer-events-none absolute inset-x-0 top-[-120px] mx-auto h-80 w-80 rounded-full bg-teal-300/35 blur-3xl" />
      <div className="pointer-events-none absolute right-[-120px] top-1/3 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-80px] left-[-60px] h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative z-10 mx-auto flex max-w-6xl justify-end pb-4">
        <LanguagePicker />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <section className="rounded-[2rem] border border-white/70 bg-white/88 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur md:p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-teal-100">
                <img src={logo} alt="Grendel" className="h-12 w-auto" />
              </div>
              <div>
                <div className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                  {t("maintenanceBadge") || "Vedlikehold"}
                </div>
                <div className="text-base text-slate-500">{t("title")}</div>
              </div>
            </div>

            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">
              {state.title || t("maintenanceTitle") || "Vi er straks tilbake"}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
              {state.message ||
                t("maintenanceBody") ||
                "Vi oppgraderer tjenesten akkurat nå. Det skal ikke vare lenge."}
            </p>

            {formattedUntil && (
              <div className="mt-6 inline-flex rounded-full bg-teal-50 px-4 py-2 text-sm font-medium text-teal-900 ring-1 ring-teal-100">
                {t("maintenanceUntilLabel") || "Forventet tilbake"}: {formattedUntil}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={() => void onRetry()}>
                {t("maintenanceRetry") || "Prøv igjen"}
              </Button>

              {state.contact_email && (
                <Button
                  as="a"
                  href={`mailto:${state.contact_email}`}
                  variant="secondary"
                  size="lg"
                >
                  {t("maintenanceContact") || "Kontakt oss"}
                </Button>
              )}
            </div>
          </section>

          <aside className="rounded-[2rem] border border-slate-200/70 bg-slate-950 p-8 text-slate-50 shadow-[0_30px_80px_rgba(15,23,42,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-teal-100">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(74,222,128,0.9)]" />
                {t("maintenanceStatusLabel") || "Status"}
              </span>
              <span className="text-sm text-slate-300">
                {t("maintenanceWindowLabel") || "Arbeidsvindu"}
              </span>
            </div>

            <div className="space-y-4">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
                  {t("maintenanceWeAreDoing") || "Hva vi gjør"}
                </div>
                <div className="mt-2 text-2xl font-semibold text-white">
                  {t("maintenanceStatusTitle") || "Oppgraderer tjenesten"}
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-300">
                  {t("maintenanceStatusBody") ||
                    "Vi gjør forbedringer i bakgrunnen for å få en roligere og mer pålitelig opplevelse når vi er oppe igjen."}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
                    {t("maintenanceFocusLabel") || "Fokus nå"}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {t("maintenanceFocusValue") || "Stabilitet og finpuss"}
                  </div>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm uppercase tracking-[0.18em] text-slate-400">
                    {t("maintenanceResponseLabel") || "Når siden er tilbake"}
                  </div>
                  <div className="mt-2 text-lg font-semibold text-white">
                    {t("maintenanceResponseValue") || "Alt skal fungere som vanlig"}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-dashed border-white/15 bg-white/[0.04] p-5 text-sm leading-7 text-slate-300">
                {t("maintenanceFooter") ||
                  "Takk for tålmodigheten. Hvis noe haster, kan du sende oss en e-post, så følger vi opp så fort vi er tilbake."}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
