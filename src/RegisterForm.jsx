import { useState } from "react";
import { API } from "@/lib/apiBase";
import Button from "@/components/Button";
import InputPassword from '@/components/InputPassword';
import { t } from '@/i18n';

async function resendVerification(email) {
  try {
    const resp = await fetch(`${API}/resend-verification`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await resp.json().catch(() => ({}));
    return { ok: resp.ok, status: resp.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: t('nettVerksFeil') } };
  }
}

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [regPending, setRegPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);

  const [exists, setExists] = useState(false);
  const [existsVerified, setExistsVerified] = useState(false);

  const [notice, setNotice] = useState(null);
  // { type: 'success' | 'error' | 'info', text: string }

  const [capsOn, setCapsOn] = useState(false);

  const noticeClass = {
    error: "text-red-700",
    success: "text-green-700",
    info: "text-gray-700",
  }[notice?.type] || "text-gray-700";

  const emailTrimmed = email.trim().toLowerCase();
  const formInvalid =
        !isEmail(emailTrimmed) ||
    password.length < 8 ||
    !/[A-ZÆØÅ]/.test(password) ||
    !/[a-zæøå]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9æøåÆØÅ]/.test(password);



  const handleSubmit = async (e) => {

    e.preventDefault();
    if (regPending) return;

    setRegPending(true);
    setNotice(null);


    // enkel klientvalidering
    const errors = [];
    if (!isEmail(emailTrimmed)) errors.push(t('invalidEmail'));
    if (password.length < 8) errors.push(t('shortPassword'));
    if (!/[A-ZÆØÅ]/.test(password)) errors.push(t('noUpperCase'));
    if (!/[a-zæøå]/.test(password)) errors.push(t('noLowerCase'));
    if (!/[0-9]/.test(password)) errors.push(t('noNumbers'));
    if (!/[^A-Za-z0-9æøåÆØÅ]/.test(password)) errors.push(t('noSpecials'));
    if (errors.length) {
      setNotice({ type: "error", text: errors.join(" ") });
      setRegPending(false);
      return;
    }

    try {
      const resp = await fetch(`${API}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrimmed, password }),
      });

      // prøv json, men tåler tom body
      const raw = await resp.text();
      let data = {};
      try {
        if (raw) data = JSON.parse(raw);
      } catch {}

      if (resp.status === 201) {
        setNotice({
          type: "success",
          text: data.message?.trim() || t('userIsRegisteredCheckEmail'),
        });
        setExists(false);
        setExistsVerified(false);
        setPassword(""); // rydd opp etter suksess
      } else if (resp.status === 409) {
        const verified = !!data.verified;
        setExists(true);
        setExistsVerified(verified);
        setNotice({
          type: "info",
          text: verified
            ? t('emailIsAlreadyRegisteredLogin')
            : t('emailIsRegisteredButNotConfirmed'),
        });
      } else if (resp.status === 400) {
        setNotice({ type: "error", text: data.error?.trim() || t('emailAndPasswordRequired') });
      } else if (resp.ok) {
        setNotice({
          type: "info",
          text: data.message?.trim() || t('confirmationEmailSent'),
        });
      } else {
        setNotice({
          type: "error",
          text: data.error?.trim() || `${t("somethingWentwrong")} (status ${resp.status}).`,
        });
      }
    } catch (err) {
      console.error(err);
      setNotice({ type: "error", text: t('errorWhenConnectingToServer') });
    } finally {
      setRegPending(false);
    }
  };

  return (
    <>
      <h3 className="text-2xl font-semibold mb-3">{t('signup')}</h3>

      <form onSubmit={handleSubmit} autoComplete="on" className="space-y-4">
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          autoCapitalize="off"
          value={email}
          inputMode="email"
          enterKeyHint="next"
          onChange={(e) => {
            setEmail(e.target.value);
            setExists(false);
            setExistsVerified(false);
            setNotice(null);
          }}
          required
          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2
                 text-base outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200"
          placeholder={t('name_at_domain_no')}
        />

        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Passord
        </label>
        <div className="relative">
          <InputPassword
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => setCapsOn(e.getModifierState("CapsLock"))}
            onKeyUp={(e) => setCapsOn(e.getModifierState("CapsLock"))}
            onBlur={() => setCapsOn(false)}
          />
          <Button
            type="button"
            onClick={() => {setShowPassword(!showPassword); setCapsOn(false)}}
            className="absolute inset-y-0 right-0 my-1 mr-1 rounded-md px-3 text-sm text-gray-600 hover:bg-gray-100"
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
          >
            {showPassword ? t('hide') : t('show')}
          </Button>
        </div>

        {capsOn && (
          <div className="mt-1 text-xs text-yellow-700">
            Caps Lock er på
          </div>
        )}

        <Button type="submit" aria-describedby={notice ? 'reg-notice' : undefined}  className="w-full" disabled={regPending || formInvalid}>
          {regPending ? t('isSending') : t('signup')}
        </Button>

        {notice && (
          <div id="reg-notice" className="mt-4 text-sm" aria-live="polite">
            <div
              className={noticeClass}>
              {notice.text}
            </div>
          </div>
        )}

        {exists && (
          <div className="mt-4 space-y-3">
            {!existsVerified && (
              <Button
                type="button"
                aria-describedby={notice ? "reg-notice" : undefined}
                disabled={resendPending || !isEmail(email.trim().toLowerCase())}
                onClick={async () => {
                  try {
                    setResendPending(true);
                    const r = await resendVerification(email.trim().toLowerCase());
                    if (r.ok) {
                      setNotice({ type: "info", text: t('newRegistratinLinkIsSent') });
                    } else {
                      setNotice({ type: "error", text: r.data?.error || t('couldNotSendRegistrationEmail')});
                    }
                  } finally {
                    setResendPending(false);
                  }
                }}
              >
                {resendPending ? t('isSending') : t('sendNewConfirmationLink') }
              </Button>
            )}
          </div>
        )}


      </form>
    </>
  );
}
