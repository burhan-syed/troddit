/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import NavBar from "../components/NavBar";

const about = () => {
  return (
    <div>
      <Head>
        <title>troddit · about</title>
      </Head>
      <NavBar />
      <div className="flex flex-row items-center justify-center min-h-screen mx-4 space-y-2 text-justify dark:text-gray-300">
        <div className="flex flex-col space-y-1">
          <p className="">
            Troddit is a client for Reddit built to enhance your browsing
            experience on desktop. All content on this site is retrieved using
            the Reddit API.
          </p>
          <p>
            We support secure logins with Reddit so you can vote and have
            immediate access to your subreddits and collections. 
          </p>

          <p className="pt-4">
            This is an independently run site. We do not serve ads but do use
            Google Analytics to better understand our traffic.
          </p>
          <p>
            You can support us and assure Troddit remains ad-free by donating
            via{" "}
            <a
              className="text-blue-500 underline"
              href="https://www.paypal.com/donate?hosted_button_id=74C839HD2W2KL"
              target="_blank"
              rel="noreferrer"
            >
              PayPal here.
            </a>{" "}
            Thanks!
          </p>
          <p>
            Contact at{" "}
            <a
              className="text-blue-500 underline"
              href="mailto: dev@troddit.com"
            >
              dev@troddit.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default about;
