/* eslint-disable react/display-name */
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import useParseBodyHTML from "../hooks/useParseBodyHTML";

const ErrorFallBack = () => {
  return (
    <div className="text-sm text-th-red">
      {"<troddit encountered an issue rendering this text>"}
    </div>
  );
};

const ParseBodyHTML = ({
  html,
  small = true,
  post = false,
  rows = false,
  card = false,
  limitWidth = false,
  comment = false,
  newTabLinks = true,
}) => {
  const component = useParseBodyHTML({ rawHTML: html, newTabLinks });
  const { theme, resolvedTheme } = useTheme();
  const ref = useRef<any>();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  //allow single click to open links, posts..
  useEffect(() => {
    if (rows || (card && !comment)) {
      ref?.current && ref.current.click();
    }
  }, [ref]);

  if (!mounted) {
    return <></>;
  }
  return (
    <ErrorBoundary FallbackComponent={ErrorFallBack}>
      <div
        ref={ref}
        id="innerhtml"
        onClick={(e) => {
          if (post) {
            e.stopPropagation();
          }
        }} //alternate to single click fix
        className={
          " prose inline-block prose-a:py-0  prose-headings:font-normal prose-p:my-0 prose-h1:text-xl   " +
          " prose-strong:text-th-textStrong prose-headings:text-th-textHeading text-th-textBody  prose-a:break-all prose-pre:max-w-[90vw] prose-pre:md:max-w-lg prose-pre:lg:max-w-3xl  prose-pre:overflow-x-auto prose-table:max-w-[90vw] prose-table:md:max-w-lg prose-table:lg:max-w-full prose-table:overflow-x-auto break-words  " +
          (resolvedTheme == "light" ? " " : " prose-invert  ") +
          (small && card
            ? " prose-sm  "
            : small
            ? " prose-sm prose-h1:text-lg  prose-p:my-0 "
            : "  ") +
          (limitWidth ? " max-w-2xl " : " max-w-none")
        }
        style={{
          wordBreak: "break-word",
        }}
      >
        {component}
      </div>
    </ErrorBoundary>
  );
};

export default ParseBodyHTML;
