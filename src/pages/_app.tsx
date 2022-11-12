import "../../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { MainProvider } from "../MainContext";
import { MySubsProvider } from "../MySubs";
import { MyCollectionsProvider } from "../components/collections/CollectionContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from 'react-query/devtools'
import Script from "next/script";
import Head from "next/head";

import toast, { Toaster } from "react-hot-toast";
import NavBar from "../components/NavBar";
import React, { useEffect } from "react";
import packageInfo from "../../package.json";
import { checkVersion } from "../../lib/utils";
import ToastCustom from "../components/toast/ToastCustom";

const VERSION = packageInfo.version;
const queryClient = new QueryClient();
function MyApp({ Component, pageProps }) {
  useEffect(() => {
    const curVersion = VERSION;
    const prevVersion = localStorage.getItem("trodditVersion");
    if (prevVersion){
      let compare = checkVersion(
        curVersion,
        prevVersion
      );
      if (compare === 1) {
        const toastId = toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Troddit has updated! Click to see changelog`}
              mode={"version"}
            />
          ),
          { position: "bottom-center", duration: 8000 }
        );
      }
    }
    localStorage.setItem("trodditVersion", curVersion);

   
  }, []);
  return (
    <>
      <Script defer data-domain={"troddit.com"} src="/js/script.js"></Script>

      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, viewport-fit=cover" //user-scalable="no"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <SessionProvider session={pageProps.session}>
        <ThemeProvider defaultTheme="system">
          <MainProvider>
            <MySubsProvider>
              <MyCollectionsProvider>
                <QueryClientProvider client={queryClient}>
                  <NavBar />
                  <div className="mb-14"></div>
                  <Component {...pageProps} />
                  <Toaster position="bottom-center" />
                  {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                </QueryClientProvider>
              </MyCollectionsProvider>
            </MySubsProvider>
          </MainProvider>
        </ThemeProvider>
      </SessionProvider>
    </>
  );
}

export default MyApp;
