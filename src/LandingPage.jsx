import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'  
import logo from './assets/Grendel-G.png'
import { isTokenValid } from './components/ProtectedRoute';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import Button from "./components/Button";
import { API } from './lib/apiBase'
import { H1, H2 } from './components/Heading.tsx'

function LandingPage() {

  const navigate = useNavigate();  // nødvendig for redirect

  useEffect(() => {
    if (isTokenValid()) {
      // gyldig token: gå til dashbord
      navigate('/dashboard')
    } else {
      // tom eller utløpt token: fjern den
      localStorage.removeItem('token')
    }
  }, [navigate])

  const [loginError, setLoginError] = useState('');

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [showPassword, setShowPassword] = useState(false)
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
        <meta name="description" content="Vitenskapelig testing av personlighet" />
      </Helmet>

      <div>

        <main className="p-6">
          <div className="flex flex-col md:flex-row gap-6">


            <div className="md:basis-3/5 bg-slate-100 p-4 rounded-lg">
              <H2>Hva er dette?</H2>
              <p>
                Dette er en evidensbasert personlighetstest som måler de fem store faktorene (Big Five). Testen tar under ett minutt å registrere seg for, og du får en detaljert tilbakemelding umiddelbart etter fullføring.
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
