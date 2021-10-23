import Document, { Html, Head, Main, NextScript } from "next/document";

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
            content="Browse Reddit better with Troddit. Full size photos and videos in grid layout with infinite scrolling. Login with Reddit to vote, comment, and see your own frontpage. "
          ></meta>
          
          <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
          <meta />
        </Head>
        <body className="overflow-x-hidden text-gray-900 bg-coolGray-200 dark:bg-black dark:text-gray-100 scrollbar-thin scrollbar-thumb-blue-400 dark:scrollbar-thumb-red-800 scrollbar-thumb-rounded-full">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
