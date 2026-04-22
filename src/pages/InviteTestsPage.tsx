import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import Button from "@/components/Button";
import { authFetch } from "@/lib/apiFetch";
import { API } from "@/lib/apiBase";
import { t } from "@/i18n";
import { languages, type LanguageCode } from "@/i18n/languages";

type TemplateRow = {
  id: number;
  slug: string;
  title: string;
  description?: string;
};

type InviteStatus =
  | "sent"
  | "opened"
  | "in_progress"
  | "completed"
  | "awaiting_payment"
  | "payment_expired";

type InviteRow = {
  id: number;
  test_id: number;
  template_title: string;
  invite_email: string;
  invite_name?: string | null;
  subject_name?: string | null;
  subject_birthdate?: string | null;
  subject_language?: string | null;
  subject_norm_sex?: string | null;
  progress: number;
  answered: number;
  total_items: number;
  status: InviteStatus;
  payment_status?: string | null;
  payment_amount?: number | null;
  payment_currency?: string | null;
  created_at?: string | null;
  invite_url?: string | null;
  checkout_url?: string | null;
  scores_url?: string | null;
};

type FormState = {
  invite_email: string;
  invite_name: string;
  template_id: string;
  subject_name: string;
  subject_birthdate: string;
  subject_language: LanguageCode;
  subject_norm_sex: string;
};

const emptyForm: FormState = {
  invite_email: "",
  invite_name: "",
  template_id: "",
  subject_name: "",
  subject_birthdate: "",
  subject_language: "nb",
  subject_norm_sex: "unspecified",
};

function tx(key: string, fallback: string): string {
  const value = t(key);
  return typeof value === "string" && !value.startsWith("⚠️") ? value : fallback;
}

function formatDate(value?: string | null): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("nb-NO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatMoney(amount?: number | null, currency?: string | null): string {
  if (!amount) return "";
  const code = (currency || "nok").toUpperCase();
  try {
    return new Intl.NumberFormat("nb-NO", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${amount} ${code}`;
  }
}

function statusLabel(status: InviteStatus): string {
  switch (status) {
    case "completed":
      return tx("inviteStatusCompleted", "Fullført");
    case "in_progress":
      return tx("inviteStatusInProgress", "Pågår");
    case "opened":
      return tx("inviteStatusOpened", "Åpnet");
    case "payment_expired":
      return tx("inviteStatusPaymentExpired", "Betaling avbrutt");
    case "awaiting_payment":
      return tx("inviteStatusAwaitingPayment", "Venter på betaling");
    default:
      return tx("inviteStatusSent", "Sendt");
  }
}

export default function InviteTestsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const status = (searchParams.get("invite_checkout") || "").trim();
    if (!status) return;

    if (status === "ok") {
      setNotice(tx("inviteCheckoutSuccess", "Betalingen gikk gjennom. Testlenken blir sendt så snart bekreftelsen er på plass."));
      setError("");
    } else if (status === "cancelled") {
      setError(tx("inviteCheckoutCancelled", "Betalingen ble avbrutt. Du kan prøve igjen når du vil."));
      setNotice("");
    }

    const next = new URLSearchParams(searchParams);
    next.delete("invite_checkout");
    next.delete("invite_id");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [templatesResponse, invitesResponse] = await Promise.all([
          authFetch(`${API}/test-templates`),
          authFetch(`${API}/test-invites`),
        ]);

        if (!templatesResponse.ok || !invitesResponse.ok) {
          throw new Error(tx("inviteFetchError", "Kunne ikke hente invitasjoner"));
        }

        const nextTemplates: TemplateRow[] = await templatesResponse.json();
        const invitesPayload = await invitesResponse.json();

        if (cancelled) return;

        setTemplates(nextTemplates || []);
        setInvites(invitesPayload?.items || []);
        setForm((prev) => ({
          ...prev,
          template_id: prev.template_id || String(nextTemplates?.[0]?.id || ""),
        }));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : tx("inviteFetchError", "Kunne ikke hente invitasjoner"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedTemplate = useMemo(
    () => templates.find((template) => String(template.id) === form.template_id) || null,
    [templates, form.template_id]
  );

  async function handleCopy(inviteUrl: string) {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setNotice(tx("inviteCopied", "Lenken ble kopiert."));
      setError("");
    } catch {
      setError(tx("inviteCopyError", "Kunne ikke kopiere lenken."));
      setNotice("");
    }
  }

  async function redirectToCheckout(payload: any) {
    const checkoutUrl = payload?.checkout_url || payload?.url;
    if (!checkoutUrl) {
      throw new Error(tx("invitePaymentStartError", "Kunne ikke starte betaling for invitasjonen."));
    }
    window.location.href = checkoutUrl;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setError("");
    setNotice("");

    try {
      const response = await authFetch(`${API}/test-invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          invite_email: form.invite_email,
          invite_name: form.invite_name,
          template_id: Number(form.template_id),
          subject_name: form.subject_name,
          subject_birthdate: form.subject_birthdate,
          subject_language: form.subject_language,
          subject_norm_sex: form.subject_norm_sex,
        }),
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || tx("inviteCreateError", "Kunne ikke opprette testinvitasjonen"));
      }

      await redirectToCheckout(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("inviteCreateError", "Kunne ikke opprette testinvitasjonen"));
    } finally {
      setSending(false);
    }
  }

  async function payForInvite(inviteId: number) {
    setError("");
    setNotice("");

    try {
      const response = await authFetch(`${API}/test-invites/${inviteId}/checkout`, {
        method: "POST",
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(payload?.error || tx("invitePaymentStartError", "Kunne ikke starte betaling for invitasjonen."));
      }

      await redirectToCheckout(payload);
    } catch (err) {
      setError(err instanceof Error ? err.message : tx("invitePaymentStartError", "Kunne ikke starte betaling for invitasjonen."));
    }
  }

  if (loading) {
    return <div className="max-w-5xl mx-auto p-4">{tx("inviteLoading", "Laster invitasjoner …")}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-semibold text-slate-950">
          {tx("inviteTestsTitle", "Inviter noen til å ta testen")}
        </h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          {tx(
            "inviteTestsIntro",
            "Opprett en testlenke, betal med Stripe, og la mottakeren fylle ut testen og opplysningene sine selv."
          )}
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block font-medium text-slate-800">
              {tx("inviteeEmailLabel", "E-post til testpersonen")}
            </label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.invite_email}
              onChange={(event) => setForm((prev) => ({ ...prev, invite_email: event.target.value }))}
              required
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-800">
              {tx("inviteeNameLabel", "Navn på testpersonen")}
            </label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.invite_name}
              onChange={(event) => setForm((prev) => ({ ...prev, invite_name: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-800">
              {tx("inviteTemplateLabel", "Test")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.template_id}
              onChange={(event) => setForm((prev) => ({ ...prev, template_id: event.target.value }))}
              required
            >
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.title}
                </option>
              ))}
            </select>
            {selectedTemplate?.description && (
              <p className="mt-2 text-sm text-slate-500">{selectedTemplate.description}</p>
            )}
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-800">
              {tx("inviteSubjectLanguageLabel", "Testspråk")}
            </label>
            <select
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.subject_language}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  subject_language: event.target.value as LanguageCode,
                }))
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
              value={form.subject_norm_sex}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  subject_norm_sex: event.target.value,
                }))
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

          <div>
            <label className="mb-1 block font-medium text-slate-800">
              {tx("inviteSubjectNameLabel", "Navn i rapporten")}
            </label>
            <input
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.subject_name}
              onChange={(event) => setForm((prev) => ({ ...prev, subject_name: event.target.value }))}
            />
          </div>

          <div>
            <label className="mb-1 block font-medium text-slate-800">
              {tx("inviteSubjectBirthdateLabel", "Fødselsdato")}
            </label>
            <input
              type="date"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              value={form.subject_birthdate}
              onChange={(event) => setForm((prev) => ({ ...prev, subject_birthdate: event.target.value }))}
            />
          </div>

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <Button type="submit" disabled={sending || !form.template_id}>
              {sending
                ? tx("inviteSendingButton", "Starter betaling …")
                : tx("inviteSendButton", "Betal og send testlenke")}
            </Button>
            <div className="text-sm text-slate-500">
              {tx("invitePriceLabel", "Pris")}: {formatMoney(75, "nok")}
            </div>
          </div>
        </form>

        {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{error}</div>}
        {notice && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700">{notice}</div>}
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold text-slate-950">
            {tx("inviteListTitle", "Utsendte testlenker")}
          </h2>
          <div className="text-sm text-slate-500">{invites.length}</div>
        </div>

        {invites.length === 0 ? (
          <p className="mt-4 text-slate-600">{tx("inviteNoItems", "Ingen invitasjoner ennå.")}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {invites.map((invite) => (
              <article
                key={invite.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/70 p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-lg font-semibold text-slate-900">
                      {invite.subject_name || invite.invite_name || invite.invite_email}
                    </div>
                    <div className="text-sm text-slate-600">
                      {invite.template_title} · {invite.invite_email}
                    </div>
                    {invite.created_at && (
                      <div className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                        {tx("inviteCreatedLabel", "Opprettet")} {formatDate(invite.created_at)}
                      </div>
                    )}
                  </div>

                  <div className="inline-flex rounded-full bg-white px-3 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-200">
                    {statusLabel(invite.status)}
                  </div>
                </div>

                <div className="mt-4 text-sm text-slate-600 space-y-1">
                  <div>
                    {tx("inviteProgressLabel", "Fremdrift")}: {invite.answered}/{invite.total_items}
                  </div>
                  <div>
                    {tx("normBasis", "Normgrunnlag")}: {invite.subject_norm_sex === "mann"
                      ? tx("normMan", "Mannsnorm")
                      : invite.subject_norm_sex === "kvinne"
                        ? tx("normWoman", "Kvinnenorm")
                        : tx("normCommon", "Felles norm")}
                  </div>
                  {invite.payment_amount ? (
                    <div>
                      {tx("invitePriceLabel", "Pris")}: {formatMoney(invite.payment_amount, invite.payment_currency)}
                    </div>
                  ) : null}
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {invite.payment_status !== "paid" ? (
                    <Button variant="secondary" size="sm" onClick={() => void payForInvite(invite.id)}>
                      {tx("invitePayNow", "Betal nå")}
                    </Button>
                  ) : (
                    <>
                      {invite.invite_url && (
                        <Button variant="secondary" size="sm" onClick={() => void handleCopy(invite.invite_url!)}>
                          {tx("inviteCopyLink", "Kopiér lenke")}
                        </Button>
                      )}
                      {invite.status === "completed" && invite.scores_url && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(invite.scores_url as string)}
                        >
                          {tx("inviteViewResults", "Se resultater")}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
