import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import Button from "@/components/Button";
import LikertRowText from "@/components/LikertRow";
import { API } from "@/lib/apiBase";
import { t } from "@/i18n";
import { languages, type LanguageCode } from "@/i18n/languages";

type InviteState = {
  id: number;
  template_title: string;
  invite_email: string;
  invite_name?: string | null;
  subject_name?: string | null;
  subject_birthdate?: string | null;
  subject_language?: LanguageCode | null;
  subject_norm_sex?: string | null;
  answered: number;
  total_items: number;
  status: "sent" | "opened" | "in_progress" | "completed";
  can_answer: boolean;
};

type ItemRow = {
  position: number;
  item_id: number;
  text: string;
  score: number | null;
};

function tx(key: string, fallback: string): string {
  const value = t(key);
  return typeof value === "string" && !value.startsWith("⚠️") ? value : fallback;
}

function usePageSize() {
  const calc = () => (window.matchMedia("(min-width: 640px)").matches ? 10 : 1);
  const [size, setSize] = useState(calc);

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 640px)");
    const onChange = () => setSize(calc());
    mql.addEventListener("change", onChange);
    window.addEventListener("orientationchange", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("orientationchange", onChange);
    };
  }, []);

  return size;
}

function isProfileComplete(invite: InviteState | null) {
  return !!(
    invite?.subject_name?.trim() &&
    invite?.subject_birthdate &&
    invite?.subject_language
  );
}

export default function PublicInvitePage() {
  const [searchParams] = useSearchParams();
  const token = (searchParams.get("token") || "").trim();
  const pageSize = usePageSize();

  const [invite, setInvite] = useState<InviteState | null>(null);
  const [items, setItems] = useState<ItemRow[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | null>>({});
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [savingPage, setSavingPage] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadInvite() {
      if (!token) {
        setError(tx("inviteInvalid", "Invitasjonen er ugyldig eller utløpt."));
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API}/test-invite-access?token=${encodeURIComponent(token)}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || tx("inviteInvalid", "Invitasjonen er ugyldig eller utløpt."));
        }
        if (cancelled) return;

        setInvite(payload);
        localStorage.setItem("testLanguage", payload?.subject_language || "nb");
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : tx("inviteInvalid", "Invitasjonen er ugyldig eller utløpt."));
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadInvite();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const readyForQuestions = isProfileComplete(invite) && invite?.status !== "completed";

  useEffect(() => {
    let cancelled = false;

    async function loadItems() {
      if (!readyForQuestions || !invite) return;

      setLoadingItems(true);
      setError("");

      try {
        const params = new URLSearchParams({
          token,
          offset: String(offset),
          limit: String(pageSize),
        });
        const response = await fetch(`${API}/test-invite-access/items?${params.toString()}`);
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          throw new Error(payload?.error || tx("inviteItemsError", "Kunne ikke hente spørsmål"));
        }
        if (cancelled) return;

        const nextItems: ItemRow[] = (payload?.items || []).map((item: any) => ({
          ...item,
          score: item.score ?? null,
        }));

        setItems(nextItems);
        setInvite((prev) =>
          prev
            ? {
                ...prev,
                total_items: payload?.total ?? prev.total_items,
              }
            : prev
        );
        setAnswers((prev) => {
          const next = { ...prev };
          for (const item of nextItems) next[item.position] = item.score;
          return next;
        });
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : tx("inviteItemsError", "Kunne ikke hente spørsmål"));
      } finally {
        if (!cancelled) setLoadingItems(false);
      }
    }

    void loadItems();

    return () => {
      cancelled = true;
    };
  }, [invite?.id, readyForQuestions, token, offset, pageSize]);

  const pageAnswered = useMemo(() => {
    const requiredPositions = items.map((item) => item.position);
    return requiredPositions.length > 0 && requiredPositions.every((position) => answers[position] != null);
  }, [items, answers]);

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    if (!invite) return;

    setSavingProfile(true);
    setError("");

    try {
      const response = await fetch(`${API}/test-invite-access/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          subject_name: invite.subject_name,
          subject_birthdate: invite.subject_birthdate,
          subject_language: invite.subject_language,
          subject_norm_sex: invite.subject_norm_sex || "unspecified",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || tx("inviteProfileError", "Kunne ikke lagre opplysningene"));
      }

      setInvite(payload);
      setOffset(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("inviteProfileError", "Kunne ikke lagre opplysningene"));
    } finally {
      setSavingProfile(false);
    }
  }

  async function savePage() {
    if (!invite) return;

    const responses = items
      .map((item) => {
        const score = answers[item.position];
        if (score == null) return null;
        return { position: item.position, item_id: item.item_id, score };
      })
      .filter(Boolean);

    if (responses.length === 0) {
      return;
    }

    setSavingPage(true);
    setError("");

    try {
      const response = await fetch(`${API}/test-invite-access/responses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          responses,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || tx("inviteSavePageError", "Kunne ikke lagre svarene"));
      }

      setInvite((prev) =>
        prev
          ? {
              ...prev,
              answered: payload?.answered ?? prev.answered,
              total_items: payload?.total_items ?? prev.total_items,
              status:
                (payload?.answered || 0) > 0 && prev.status === "sent"
                  ? "in_progress"
                  : prev.status,
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("inviteSavePageError", "Kunne ikke lagre svarene"));
      throw err;
    } finally {
      setSavingPage(false);
    }
  }

  async function nextPage() {
    await savePage();
    setOffset((prev) => prev + pageSize);
  }

  async function previousPage() {
    await savePage();
    setOffset((prev) => Math.max(0, prev - pageSize));
  }

  async function finishTest() {
    if (!invite) return;

    try {
      await savePage();
      setCompleting(true);
      const response = await fetch(`${API}/test-invite-access/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || tx("inviteCompleteError", "Kunne ikke fullføre testen"));
      }

      setInvite((prev) =>
        prev
          ? {
              ...prev,
              status: "completed",
            }
          : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("inviteCompleteError", "Kunne ikke fullføre testen"));
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6">{tx("inviteLoading", "Laster invitasjon …")}</div>;
  }

  if (error && !invite) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!invite) {
    return null;
  }

  if (invite.status === "completed") {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <div className="rounded-3xl border border-emerald-200 bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold text-slate-950">
            {tx("inviteCompletedTitle", "Takk for at du fullførte testen")}
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            {tx("inviteCompletedBody", "Resultatet er nå tilgjengelig for personen som sendte invitasjonen.")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-sm uppercase tracking-[0.18em] text-slate-500">
          {tx("inviteAccessTitle", "Invitasjon til personlighetstest")}
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-slate-950">{invite.template_title}</h1>
        <p className="mt-3 text-slate-600">
          {tx(
            "inviteAccessIntro",
            "Fyll ut noen opplysninger om deg selv før testen starter. Når du er ferdig, blir resultatet tilgjengelig for den som sendte invitasjonen."
          )}
        </p>
      </section>

      {!readyForQuestions ? (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={saveProfile} className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block font-medium text-slate-800">{tx("inviteSubjectNameLabel", "Navn")}</label>
              <input
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={invite.subject_name || ""}
                onChange={(event) =>
                  setInvite((prev) =>
                    prev ? { ...prev, subject_name: event.target.value } : prev
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-800">
                {tx("inviteSubjectBirthdateLabel", "Fødselsdato")}
              </label>
              <input
                type="date"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={invite.subject_birthdate || ""}
                onChange={(event) =>
                  setInvite((prev) =>
                    prev ? { ...prev, subject_birthdate: event.target.value } : prev
                  )
                }
              />
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-800">
                {tx("inviteSubjectLanguageLabel", "Testspråk")}
              </label>
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={invite.subject_language || "nb"}
                onChange={(event) =>
                  setInvite((prev) =>
                    prev
                      ? {
                          ...prev,
                          subject_language: event.target.value as LanguageCode,
                        }
                      : prev
                  )
                }
              >
                {Object.entries(languages).map(([code, key]) => (
                  <option key={code} value={code}>
                    {tx(key, key)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block font-medium text-slate-800">
                {tx("normBasis", "Normgrunnlag")}
              </label>
              <select
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                value={invite.subject_norm_sex || "unspecified"}
                onChange={(event) =>
                  setInvite((prev) =>
                    prev ? { ...prev, subject_norm_sex: event.target.value } : prev
                  )
                }
              >
                <option value="unspecified">{tx("normCommon", "Felles norm")}</option>
                <option value="mann">{tx("normMan", "Mannsnorm")}</option>
                <option value="kvinne">{tx("normWoman", "Kvinnenorm")}</option>
              </select>
              <p className="mt-2 text-sm text-slate-500">
                {tx("normBasisHelp", "Velg hvilket normgrunnlag skårene skal sammenlignes med.")}
              </p>
            </div>

            <div className="flex items-end">
              <Button type="submit" disabled={savingProfile}>
                {savingProfile
                  ? tx("inviteSavingProfile", "Lagrer …")
                  : tx("inviteStartButton", "Lagre og start")}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
          {loadingItems ? (
            <p>{tx("inviteItemsLoading", "Laster spørsmål …")}</p>
          ) : (
            <>
              <ul className="space-y-6">
                {items.map((item) => (
                  <li key={item.position}>
                    <div className="mb-3 font-medium text-slate-900">{item.text}</div>
                    <LikertRowText
                      question=""
                      value={answers[item.position] ?? null}
                      onChange={(value) =>
                        setAnswers((prev) => ({
                          ...prev,
                          [item.position]: value,
                        }))
                      }
                    />
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex items-center justify-between gap-4">
                <Button
                  variant="secondary"
                  onClick={() => void previousPage()}
                  disabled={savingPage || offset === 0}
                >
                  {tx("forrige", "Forrige")}
                </Button>

                <div className="text-sm text-slate-600">
                  {invite.total_items
                    ? `${Math.min(offset + items.length, invite.total_items)} / ${invite.total_items}`
                    : tx("inviteProgressLabel", "Fremdrift")}
                </div>

                {invite.total_items && offset + pageSize >= invite.total_items ? (
                  <Button
                    onClick={() => void finishTest()}
                    disabled={savingPage || completing || !pageAnswered}
                  >
                    {completing
                      ? tx("inviteCompleting", "Fullfører …")
                      : tx("inviteFinishButton", "Fullfør")}
                  </Button>
                ) : (
                  <Button
                    onClick={() => void nextPage()}
                    disabled={savingPage || !pageAnswered}
                  >
                    {tx("neste", "Neste")}
                  </Button>
                )}
              </div>
            </>
          )}
        </section>
      )}
    </div>
  );
}
