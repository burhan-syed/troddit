/* eslint-disable @next/next/no-img-element */

import React from "react";
import Head from "next/head";
import Link from "next/link";
import { AiOutlineGithub } from "react-icons/ai";
import packageInfo from "../../package.json";
const VERSION = packageInfo.version;
const link = "text-th-link hover:underline hover:text-th-linkHover "
const AboutPage = ({ changelog }) => {
  return (
    <div className="h-screen mx-4 -mt-16">
      <Head>
        <title>troddit · about</title>
      </Head>
      <div className="h-full text-justify text-th-text ">
        <div className="flex flex-col justify-center max-w-xl min-h-full gap-4 mx-auto space-y-1 overflow-y-scroll scrollbar-none ">
          <p className="">
            Troddit is a web app for Reddit. Follow subreddits and users locally
            or login with your Reddit account to vote, comment, and manage your
            existing subscriptions.
          </p>

          <p className="">
            This is an independent site not affiliated with Reddit. All content
            on this site is retrieved from the public Reddit API.
          </p>

          <p className="">
            For any feature requests, bug reports, please create an issue on{" "}
            <a
              href="https://www.github.com/burhan-syed/troddit"
              target="_blank"
              rel="noreferrer"
              className={link}
            >
              GitHub
            </a>{" "}
            or contact me at{" "}
            <a
              className={link}
              href="mailto: trodditdev@gmail.com"
            >
              trodditdev@gmail.com
            </a> for anything else.
          </p>
          <p className="">
            <Link
              href={"/changelog"}
              className="flex flex-wrap justify-between pt-5 font-semibold hover:underline">

              <h4>v{VERSION}</h4>
              <h4>See Changelog</h4>

            </Link>
          </p>
        </div>
        <div className="absolute left-0 w-full bottom-5 sm:bottom-20">
          <div className="flex items-center justify-between max-w-xl mx-4 sm:mx-auto">
            <a
              href="https://ko-fi.com/K3K47IYH1"
              target="_blank"
              rel="noreferrer"
            >
              <img
                src="https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/61e11e22d8ff4a5b4a1b3346_Supportbutton-1-p-500.png"
                alt="Buy Me a Coffee at ko-fi.com"
                className="h-10 transition-all rounded-md border-th-border hover:scale-110"
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

export default AboutPage;
