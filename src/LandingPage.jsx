import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import logo from './assets/Grendel-G.png';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import Button from "./components/Button";
import { API } from './lib/apiBase';
import { H1, H2 } from './components/Heading.tsx';
import { t } from '@/i18n';
import { useAuth } from "@/context/AuthContext";  // 👈 ny

const SITE_URL = 'https://flaskapps.grendel.no/portal';
const OG_IMAGE_URL = `${SITE_URL}/grendel-share-card.svg`;

function LandingPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Grendel Personlighetstest',
    url: `${SITE_URL}/`,
    inLanguage: 'no',
    description: 'Vitenskapelig personlighetstesting med tydelige resultater og en enkel testflyt.',
    publisher: {
      '@type': 'Organization',
      name: 'Grendel',
      url: SITE_URL,
    },
  };

  const navigate = useNavigate();  // nødvendig for redirect
  const { loggedIn } = useAuth();  // 👈 reaktiv status

  useEffect(() => {
    if (loggedIn) {
      // gyldig token: gå til dashbord
      navigate('/dashboard');
    }
  }, [loggedIn, navigate]);  // 👈 oppdateres automatisk

  const [loginError, setLoginError] = useState('');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [regPending, setRegPending] = useState(false);
  const [regMsg, setRegMsg] = useState('');
  const [regErr, setRegErr] = useState('');

  return (
    <>
      <Helmet>
        <title>Grendel Personlighetstest</title>
        <meta
          name="description"
          content="Grendel Personlighetstest tilbyr vitenskapelig personlighetstesting med tydelige resultater og en enkel testflyt."
        />
        <link rel="canonical" href={`${SITE_URL}/`} />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="nb_NO" />
        <meta property="og:site_name" content="Grendel Personlighetstest" />
        <meta property="og:title" content="Grendel Personlighetstest" />
        <meta
          property="og:description"
          content="Vitenskapelig personlighetstesting med tydelige resultater og en enkel testflyt."
        />
        <meta property="og:url" content={`${SITE_URL}/`} />
        <meta property="og:image" content={OG_IMAGE_URL} />
        <meta property="og:image:type" content="image/svg+xml" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Grendel Personlighetstest med lys blå delingsgrafikk og kort beskrivelse av testen." />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Grendel Personlighetstest" />
        <meta
          name="twitter:description"
          content="Vitenskapelig personlighetstesting med tydelige resultater og en enkel testflyt."
        />
        <meta name="twitter:image" content={OG_IMAGE_URL} />
        <meta name="twitter:image:alt" content="Grendel Personlighetstest med lys blå delingsgrafikk og kort beskrivelse av testen." />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>

      <div>

        <main className="p-6">
          <div className="flex flex-col md:flex-row gap-6">


            <div className="md:basis-3/5 bg-slate-100 p-4 rounded-lg">
              <H2>{t('whatIsThis')}</H2>
              <p>
                {t('siteExplanation')}
              </p>

              <picture>
                <source
                  srcSet="/bilder/zahlenzauberer-480.webp 480w, /bilder/zahlenzauberer-1280.webp 1280w"
                  type="image/webp"
                />
                <source
                  srcSet="/bilder/zahlenzauberer-480.png 480w, /bilder/zahlenzauberer-1280.png 1280w"
                  type="image/png"
                />
                <img
                  src="/bilder/zahlenzauberer-1280.png"
                  alt="Personer i forskjellige aktiviteter"
                  className = "w-full h-auto rounded-lg mt-4 max-w-full"
                />
              </picture>
            </div>

            <div className="md:basis-2/5 bg-slate-100 p-4 rounded-lg">

              <LoginForm />

              <div className="my-6 h-px bg-gray-200" />

              <RegisterForm />

            </div>


          </div>
        </main>
      </div>
    </>
  )
}

export default LandingPage
