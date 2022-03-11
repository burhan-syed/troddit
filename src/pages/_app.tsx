import "../../styles/globals.css";
import { Provider } from "next-auth/client";
import { ThemeProvider } from "next-themes";
import { MainProvider } from "../MainContext";
import { MySubsProvider } from "../MySubs";
import Script from "next/script";
import { useRouter } from "next/router";
// import * as gtag from "../../lib/gtag";
import { useEffect, useState } from "react";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [dataDomain, setDataDomain] = useState("");
  useEffect(() => {
    //console.log("FIRST", window.location.host);
    if (window.location.host.includes("troddit.com")) {
      setDataDomain("troddit.com");
    } else {
      setDataDomain(window.location.host);
    }
    return () => {
      setDataDomain("");
    };
  }, []);
  // useEffect(() => {
  //   const handleRouteChange = (url) => {
  //     gtag.pageview(url);
  //   };
  //   router.events.on("routeChangeComplete", handleRouteChange);
  //   return () => {
  //     router.events.off("routeChangeComplete", handleRouteChange);
  //   };
  // }, [router.events]);
  return (
    <>
      {/* <Script
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
      /> */}
      <Script defer data-domain={"troddit.com"} src="/js/script.js"></Script>

      <Head>
        {/* <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        ></meta> */}
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system">
        <MainProvider>
          <MySubsProvider>
            <Provider session={pageProps.session}>
              <Component {...pageProps} />
            </Provider>
          </MySubsProvider>
        </MainProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
