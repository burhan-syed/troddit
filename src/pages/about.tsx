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
      <div className="flex flex-row items-center justify-center min-h-screen mx-4 space-y-2 overflow-hidden text-justify dark:text-gray-300">
        <div className="flex flex-col max-w-lg space-y-1 ">
          <p className="">
            Troddit is a web client for Reddit.
            While an account is not required, we do support secure logins with
            Reddit so you can vote and have immediate access to your personal
            front page, subreddits, and collections.
          </p>

          <p className="py-4">
            This is an independently run site. We do not serve ads but do use
            Google Analytics to better understand our traffic. All content on
            this site is retrieved from the Reddit API.
          </p>
          <p>
            If you would like to support us and assure Troddit remains ad-free
            you can donate via{" "}
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
          <p className="py-4">
            For any inquiries, questions, feature requests, or bug reports, I
            can be reached here:{" "}
            <a
              className="text-blue-500 underline"
              href="mailto: dev@troddit.com"
            >
              dev@troddit.com
            </a>
          </p>
          <p className="text-transparent select-none">
            Hello there, why are you snooping here? {"Don't"} mind this. Troddit
            supports infinite scrolling for Reddit in a grid format. Masonry
            layout of Reddit Posts. Reddit Scroller. Reddit browswer. 
          </p>
        </div>
      </div>
    </div>
  );
};

export default about;
