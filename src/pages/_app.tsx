import "../../styles/globals.css";
import { Provider } from "next-auth/client";
import { ThemeProvider } from "next-themes";
import { MainProvider } from "../MainContext";
import { MySubsProvider } from "../MySubs";
import { MyCollectionsProvider } from "../components/collections/CollectionContext";

import Script from "next/script";
import Head from "next/head";

import { Toaster } from "react-hot-toast";

function MyApp({ Component, pageProps }) {
  // const router = useRouter();
  // const [dataDomain, setDataDomain] = useState("");
  // useEffect(() => {
  //   if (window.location.host.includes("troddit.com")) {
  //     setDataDomain("troddit.com");
  //   } else {
  //     setDataDomain(window.location.host);
  //   }
  //   return () => {
  //     setDataDomain("");
  //   };
  // }, []);
  return (
    <>
      <Script defer data-domain={"troddit.com"} src="/js/script.js"></Script>

      <Head>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, shrink-to-fit=no, user-scalable=no, viewport-fit=cover"
        />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system">
        <MainProvider>
          <MySubsProvider>
            <MyCollectionsProvider>
              <Provider session={pageProps.session}>
                <Component {...pageProps} />
                <Toaster position="bottom-center" />
              </Provider>
            </MyCollectionsProvider>
          </MySubsProvider>
        </MainProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
