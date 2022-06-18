/* eslint-disable @next/next/no-img-element */
import fs from "fs";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { AiOutlineGithub } from "react-icons/ai";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
const ChangeLogPage = ({ changelog }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) {
    return <></>;
  }
  return (
    <div className="flex items-center justify-center my-10 ">
      <div className="flex flex-col max-w-lg gap-10 lg:max-w-2xl">
        <p
          className={
            (resolvedTheme == "dark"
              ? " prose-headings:text-th-text  text-th-text  "
              : "  prose-headings:text-stone-700 text-stone-700") +
            " border bg-th-post prose-a:text-th-link hover:prose-a:text-th-linkHover border-th-border2 prose-a:hover:underline p-4 rounded-lg  prose-sm  prose  prose-h3:text-base prose-h2:text-xl prose-h3:font-light prose-ul:font-light prose-h2:mt-6 prose-h2:my-0.5 prose-h3:my-0 prose-h1:h-6"
            + ("  shadow-md hover:shadow-2xl " )
          }
        >
          <ReactMarkdown rehypePlugins={[rehypeRaw]}>{changelog}</ReactMarkdown>
        </p>
        <div className="flex items-center justify-between ">
          <a
            href="https://ko-fi.com/K3K47IYH1"
            target="_blank"
            rel="noreferrer"
          >
            <img
              src="https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/61e11e22d8ff4a5b4a1b3346_Supportbutton-1-p-500.png"
              alt="Buy Me a Coffee at ko-fi.com"
              className="h-10 transition-all border rounded-md border-th-border hover:scale-110"
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
  );
};

export const getStaticProps = async () => {
  const changelog = fs.readFileSync("changelog.md", "utf-8");
  return {
    props: {
      changelog,
    },
  };
};

export default ChangeLogPage;
