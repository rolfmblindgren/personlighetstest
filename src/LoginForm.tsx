import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { API } from "./lib/apiBase";
import Button from './components/Button';
import InputPassword from '@/components/InputPassword';
import { t } from '@/i18n';
import { useAuth } from "@/context/AuthContext";  // 👈 ny
import { Eye, EyeOff } from "lucide-react";



async function parseJsonMaybe(res) {
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) {
    try { return await res.json(); } catch { return {}; }
  }
  // fall back til tekst (for logging), men vis ikke i UI
  try { console.debug(await res.text()); } catch {}
  return {};
}

async function resendVerification(email) {
  try {
    const r = await fetch(`${API}/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await parseJsonMaybe(r);
    return { ok: r.ok, status: r.status, data };
  } catch {
    return { ok: false, status: 0, data: { error: 'Nettverksfeil' } };
  }
}

type LoginErrorInfo = {
  message: string | JSX.Element;
  showResetLink?: boolean;
};


export default function LoginForm() {

  const navigate = useNavigate();  // nødvendig for redirect
  const { loggedIn } = useAuth();  // 👈 reaktiv status
  const { login } = useAuth(); // legg til her, sammen med loggedIn

  const [loginError, setLoginError] = useState<LoginError | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [capsOn, setCapsOn] = useState(false);

  const [showPassword, setShowPassword] = useState(false);


  // --- Hjelpefunksjon for å vise feil ---
  function showError(message: string | JSX.Element, showResetLink = true) {
    setLoginError({ message, showResetLink });
  }

  useEffect(() => {
    if (loggedIn) {
      // gyldig token: gå til dashbord
      navigate('/dashboard', {replace: true });
    }
  }, [loggedIn, navigate]);  // 👈 oppdateres automatisk


  async function handleLogin(email: string, password: string) {
    try {
      const res =  await fetch(`${API}/login`, {
	method: "POST",
	headers: { "Content-Type": "application/json" },
	body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      console.log("res er", res);
      console.log("LOGIN RESPONSE:", res.status, data);


      if (res.status === 403 && data.code === 'EMAIL_NOT_VERIFIED') {
	const currentEmail = email.trim().toLowerCase(); // alltid riktig verdi

	showError(
	  <>
	    {t('registeredButNotConfirmedEmail')}.{' '}
	    <button
              type="button"
              className="text-emerald-700 underline font-medium hover:text-emerald-900 focus:outline-none"
              onClick={async () => {
		const r = await resendVerification(currentEmail);
		showError(
		  r.ok
		    ? t('newRegistrationLinkIsSent')
		    : (r.data?.error || t('couldNotSendRegistrationEmail')),
		  false
		);
              }}
	    >
              {t('clickHere')}
	    </button>{' '}
	    {t('toReceiveNewConfirmationLink')}
	  </>,
	  false
	);
	return;
      }

      if (res.status === 401 && data.code === "INVALID_CREDENTIALS") {
	showError(t("invalidEmailOrPassword"));
	return;
      }

      if (res.status === 403 && data.code === "EMAIL_NOT_VERIFIED") {
	showError(
	  <>
	    {t("registeredButNotConfirmedEmail")}.{" "}
	    <button
              type="button"
              className="text-emerald-700 underline font-medium hover:text-emerald-900 focus:outline-none"
              onClick={async () => {
		const r = await resendVerification(email.trim().toLowerCase());
		showError(
		  r.ok
		    ? t("newRegistrationLinkIsSent")
		    : (r.data?.error || t("couldNotSendRegistrationEmail")),
		  false
		);
              }}
	    >
              {t("clickHere")}
	    </button>{" "}
	    {t("toReceiveNewConfirmationLink")}
	  </>,
	  false
	);
	return;
      }

      if (!res.ok) {
	showError(t("unknownError"));
	return;
      }

      if (!res.ok) {
        showError(t("unknownError"));
        return;
      }

      login(data.token); // <- context.login, bare token
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      showError(t("networkError"));
    }


  }



  // --- UI ---

 return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleLogin(loginEmail.trim().toLowerCase(), loginPassword);
      }}
      className="space-y-3"
    >
      {/* E-post */}
      <label className="block">
        <span className="block text-sm font-medium text-gray-700">
          {t("epost")}
        </span>
        <input
          name="email"
          type="email"
	  placeholder={t('name_at_domain_no')}
          required
          value={loginEmail}
          onChange={(e) => setLoginEmail(e.target.value)}
          className="w-full rounded border p-2"
        />
      </label>

      {/* Passord + Vis-knapp */}
      <label className="block text-sm font-medium text-gray-700">
        {t("password")}
      </label>
      <div className="relative">
        <input
          id="password"
          name="password"
	  placeholder={t('writePassword')}
          type={showPassword ? "text" : "password"}
          required
          value={loginPassword}
          onChange={(e) => setLoginPassword(e.target.value)}
          className="w-full rounded border p-2 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword((s) => !s)}
          className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700"
          aria-label={showPassword ? t("hidePassword") : t("showPassword")}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>

      {/* Logg inn */}
      <Button
        type="submit"
        className="w-full rounded bg-emerald-600 p-2 text-white hover:bg-emerald-700"
      >
        {t("login")}
      </Button>

      {/* Feilmelding */}
      {loginError && (
        <div
          role="alert"
          className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          {loginError.message}
          {loginError.showResetLink && (
            <>
              {" "}
              <a href="/forgot" className="underline">
                {t("clickHere")}
              </a>{" "}
              {t("toResetPassword")}
            </>
          )}
        </div>
      )}
    </form>
  );
};
