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
            content="A seamless experience for browsing through Reddit with a grid layout. Login with Reddit to experience your personalized home page, immediate access to your followed subreddits, and access to vote and comment."
          ></meta>
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
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
