import Document, { Html, Head, Main, NextScript } from "next/document";
import PlausibleProvider from "next-plausible";


class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en" className="">
        <Head>
          <meta
            name="description"
            content="Browse Reddit better with Troddit. Grid views, single column mode, galleries, and a number of post styles. Login with Reddit to see your own subs, vote, and comment. Open source. "
          ></meta>
          
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta />
        </Head>
        <PlausibleProvider domain="troddit.com">

        <body className="overflow-x-hidden text-gray-900 bg-coolGray-200 dark:bg-black dark:text-lightText scrollbar-thin scrollbar-thumb-blue-400 dark:scrollbar-thumb-red-800 scrollbar-thumb-rounded-full">
          <Main />
          <NextScript />
        </body>
        </PlausibleProvider>

      </Html>
    );
  }
}

export default MyDocument;
