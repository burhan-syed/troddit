import fs from "fs";
import ReactMarkdown from "react-markdown";

const ChangeLogPage = ({ changelog }) => {
  return (
    <div className="flex justify-center my-10 ">
      <p className="mx-10 bg-lightPost border border-lightBorder  dark:border-darkBorder hover:dark:border-darkBorderHighlight hover:bg-lightPostHover dark:hover:bg-darkPostHover dark:bg-darkBG p-4 rounded-lg shadow-xl prose-sm  prose prose-headings:text-stone-700 text-stone-700 dark:prose-headings:text-lightText  dark:text-lightText prose-h3:text-base prose-h2:text-xl prose-h3:font-light prose-ul:font-light prose-h2:mt-6 prose-h2:my-0.5 prose-h3:my-0 prose-h1:h-6">
        <ReactMarkdown>{changelog}</ReactMarkdown>
      </p>
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
