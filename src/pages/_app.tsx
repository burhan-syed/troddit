import "../../styles/globals.css";
import { Provider } from "next-auth/client";

import { MainProvider } from "../MainContext";

function MyApp({ Component, pageProps }) {
  return (
    <MainProvider>
      <Provider session={pageProps.session}>
        <Component {...pageProps} />
      </Provider>
    </MainProvider>
  );
}

export default MyApp;
