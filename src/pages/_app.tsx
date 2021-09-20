import "../../styles/globals.css";
import { Provider } from "next-auth/client";
import { ThemeProvider } from "next-themes";
import { MainProvider } from "../MainContext";
import Script from 'next/script'
import { useRouter } from 'next/router'
import * as gtag from '../../lib/gtag'
import { useEffect } from "react";
import  Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter()
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url)
    }
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router.events])
  return (
    <>
    <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${gtag.GA_TRACKING_ID}`}
      />
      <Script
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gtag.GA_TRACKING_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Head>
      <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          ></meta>
      </Head>
    <ThemeProvider attribute="class">
      <MainProvider>
        <Provider session={pageProps.session}>
          <Component {...pageProps} />
        </Provider>
      </MainProvider>
    </ThemeProvider>
    </>
  );
}

export default MyApp;
