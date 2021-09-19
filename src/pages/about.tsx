/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import NavBar from "../components/NavBar";

const about = () => {
  return (
    <div>
      <Head>
        <title>troddit</title>
      </Head>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-screen mx-4 space-y-2 text-center dark:text-gray-300">
        <p>Troddit is a web client providing a seamless experience for browsing images, videos, and text posts on Reddit.</p>
        <p>You can support this site and keep it ad-free via PayPal <a className="text-blue-500 underline" href="https://www.paypal.com/donate?hosted_button_id=74C839HD2W2KL" target="_blank" rel="noreferrer">here</a></p>
        <p>Contact at <a  className="text-blue-500 underline" href="mailto: dev@troddit.com">dev@troddit.com</a></p>

      </div>
    </div>
  );
};

export default about;
