import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import { getLocale } from "@/i18n";
import { AuthProvider } from "@/context/AuthContext";
import { I18nProvider } from "@/i18n/I18nProvider";
import { LegacyImportProvider } from "@/context/LegacyImportContext";


document.documentElement.setAttribute("lang", getLocale().replace("_","-"));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <LegacyImportProvider>
          <I18nProvider>
            <App />
          </I18nProvider>
        </LegacyImportProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
