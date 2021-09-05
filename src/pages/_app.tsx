import "../../styles/globals.css";
import { Provider } from "next-auth/client";
import { ThemeProvider } from "next-themes";
import { MainProvider } from "../MainContext";

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class">
      <MainProvider>
        <Provider session={pageProps.session}>
          <Component {...pageProps} />
        </Provider>
      </MainProvider>
    </ThemeProvider>
  );
}

export default MyApp;
