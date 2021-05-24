import React, { useEffect, useState } from 'react';
import { HelmetProvider, Helmet } from 'react-helmet-async';
import Routes from './routes';
import './App.global.scss';

const APP_NAME = 'Joshua Stephen';
const APP_DESCRIPTION =
  'A web developer passionate about javascript all around the web.';

function App() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    let mql: MediaQueryList;

    const handler = (event: MediaQueryListEvent | MediaQueryList) => {
      setTheme(event.matches ? 'dark' : 'light');
    };

    if (window.matchMedia) {
      mql = window.matchMedia('(prefers-color-scheme: dark)');

      handler(mql);

      mql.addEventListener('change', handler);
    }

    return () => {
      if (mql) {
        mql.removeEventListener('change', handler);
      }
    };
  }, []);

  return (
    <HelmetProvider>
      <Helmet>
        <title>{APP_NAME}</title>
        <meta name="application-name" content={APP_NAME} />
        <meta name="description" content={APP_DESCRIPTION} />
        <meta property="og:title" content={APP_NAME} />
        <meta property="og:description" content={APP_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="jostephhh" />
        <meta property="og:url" content="https://josteph.github.io" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@jostephhh" />
        <meta name="twitter:creator" content="@jostephhh" />
        <body data-theme={theme} />
      </Helmet>
      <Routes />
    </HelmetProvider>
  );
}

export default App;
