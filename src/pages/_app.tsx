import "../../styles/globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { MainProvider, localSeen } from "../MainContext";
import { MySubsProvider } from "../MySubs";
import { MyCollectionsProvider } from "../components/collections/CollectionContext";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import Script from "next/script";
import Head from "next/head";
import { Analytics } from "@vercel/analytics/react";

import toast, { Toaster } from "react-hot-toast";
import NavBar from "../components/NavBar";
import React, { useEffect } from "react";
import packageInfo from "../../package.json";
import { checkVersion } from "../../lib/utils";
import ToastCustom from "../components/toast/ToastCustom";
import { usePlausible } from "next-plausible";

const VERSION = packageInfo.version;
const queryClient = new QueryClient();
function MyApp({ Component, pageProps }) {
  const plausible = usePlausible();
  useEffect(() => {
    const curVersion = VERSION;
    const prevVersion = localStorage.getItem("trodditVersion");
    if (prevVersion) {
      let compare = checkVersion(curVersion, prevVersion);
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
    function setNoSurveyFlag() {
      localStorage.setItem("nosurvey1", JSON.stringify(true));
    }
    if (!JSON.parse(localStorage.getItem("nosurvey1") ?? "false")) {
      localSeen
        .length()
        .then((length) => {
          if (length > 10000) {
            plausible("survey");
            const toastId = toast.custom(
              (t) => (
                <ToastCustom
                  t={t}
                  message={`Thanks for using Troddit. Can you take a survey?`}
                  mode={"link"}
                  link="https://forms.gle/8rqwa1rR1Yc6HLxZ6"
                  actionLabel=""
                  action={() => {
                    window.location.href =
                      "https://forms.gle/8rqwa1rR1Yc6HLxZ6";
                  }}
                  action2={() => {
                    toast.custom(
                      (t2) => (
                        <ToastCustom
                          t={t2}
                          message="Don't show survey again?"
                          mode="alert"
                          action={setNoSurveyFlag}
                        />
                      ),
                      {
                        position: "bottom-center",
                        duration: 3000,
                        id: "survey-close",
                      }
                    );
                  }}
                  showAll={true}
                />
              ),
              { position: "bottom-center", duration: 10000, id: "survey" }
            );
          }
        })
        .catch((err) => {});
    }
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
                  <Analytics />
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
