import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html className="">
        <Head />
        <body className="overflow-x-hidden text-gray-900 bg-coolGray-200 dark:bg-black dark:text-gray-100 scrollbar-thin scrollbar-thumb-blue-400 dark:scrollbar-thumb-red-800 scrollbar-thumb-rounded-full">
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
