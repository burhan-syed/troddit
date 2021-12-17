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
      <div className="flex flex-row items-center justify-center min-h-screen mx-4 space-y-2 overflow-hidden text-justify dark:text-lightText">
        <div className="flex flex-col max-w-lg space-y-1 ">
          <p className="">
            Troddit is a web app for Reddit. While an account is not
            required, we do support secure logins with Reddit so you can vote,
            comment, and have immediate access to your personal subreddits.
          </p>

          <p className="py-4">
            This is an independently run site not affiliated with Reddit. All content on
            this site is retrieved from the public Reddit API. 
          </p>
          <p>
            {
              "You can support us by sharing this site and if you're feeling generous donations are welcome via "
            }
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
            can be reached at{" "}
            <a
              className="text-blue-500 underline"
              href="mailto: trodditdev@gmail.com"
            >
              trodditdev@gmail.com
            </a>
          </p>
          {/* <p className="text-transparent select-none">
            Hello there, why are you snooping here? {"Don't"} mind this. Troddit
            supports infinite scrolling for Reddit in a grid format. Masonry
            layout of Reddit Posts. Reddit Scroller. Reddit browswer. 
          </p> */}
        </div>
      </div>
    </div>
  );
};

export default about;
