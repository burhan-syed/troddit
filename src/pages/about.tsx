/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import NavBar from "../components/NavBar";
import { AiOutlineGithub } from "react-icons/ai";
const about = () => {
  return (
    <div>
      <Head>
        <title>troddit · about</title>
      </Head>
      <NavBar />
      <div className="flex flex-col items-center justify-center min-h-screen mx-4 space-y-2 overflow-hidden text-justify dark:text-lightText">
        <div className="flex flex-col max-w-lg min-h-full space-y-1 ">
          <p className="">
            Troddit is a web app for Reddit. Follow subreddits and users locally
            or login with your Reddit account to vote, comment, and manage your
            existing subscriptions.
          </p>

          <p className="py-4">
            This is an independent site not affiliated with Reddit. All content
            on this site is retrieved from the public Reddit API.
          </p>

          <p className="py-4">
            For any inquiries, questions, feature requests, or bug reports,
            create a request on{" "}
            <a
              href="https://www.github.com/burhan-syed/troddit"
              target="_blank"
              rel="noreferrer"
              className="text-blue-500 hover:cursor-pointer"
            >
              GitHub
            </a>{" "}
            or contact me at{" "}
            <a
              className="text-blue-500 underline"
              href="mailto: trodditdev@gmail.com"
            >
              trodditdev@gmail.com
            </a>
          </p>

          <div className="flex flex-row items-center justify-between pt-10 ">
            <a
              href="https://ko-fi.com/K3K47IYH1"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/61e11e22d8ff4a5b4a1b3346_Supportbutton-1-p-500.png"
                alt="Buy Me a Coffee at ko-fi.com"
                className="h-10 transition-all rounded-md dark:border hover:scale-110"
              />
            </a>
            <a
              href="https://www.github.com/burhan-syed/troddit"
              target="_blank"
              rel="noreferrer"
              className="hover:cursor-pointer"
            >
              <AiOutlineGithub className="w-12 h-12 transition-all hover:scale-110" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default about;
