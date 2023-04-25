import React, { useEffect, useRef, useState } from "react";
import ParseBodyHTML from "./ParseBodyHTML";
import useParseBodyHTML from "../hooks/useParseBodyHTML";
import { useTheme } from "next-themes";
import { ErrorBoundary } from "react-error-boundary";
import { BsChevronCompactDown } from "react-icons/bs";

const scrollStyle =
  " scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full ";

const ErrorFallBack = () => {
  return (
    <div className="text-sm text-th-red">
      {"<troddit encountered an issue rendering this text>"}
    </div>
  );
};

const PostBody = ({
  rawHTML,
  newTabLinks,
  mode,
  limitHeight,
  checkCardHeight,
  withBG = true,
}: {
  rawHTML: string;
  newTabLinks?: boolean;
  mode: "post" | "comment" | "card" | "expando";
  limitHeight?: 384 | 128 | number;
  checkCardHeight?: (height?: number) => void;
  withBG?: boolean;
}) => {
  const component = useParseBodyHTML({ rawHTML, newTabLinks });
  const { theme, resolvedTheme } = useTheme();
  const ref = useRef<HTMLDivElement>(null);
  const [heightLimited, setHeightLimited] = useState(
    () => !!limitHeight ?? false
  );
  useEffect(() => {
    setHeightLimited(!!limitHeight);
  }, [limitHeight]);
  const [hiddenText, setHiddenText] = useState(false);
  const [hideText, setHideText] = useState(() => !!limitHeight ?? false);
  useEffect(() => {
    let cRef = ref.current;
    const checkIsTextHidden = () => {
      if (
        (ref?.current?.scrollHeight ?? 0) > (ref.current?.clientHeight ?? 0)
      ) {
        setHiddenText(true);
      } else {
        setHiddenText(false);
      }
    };
    if (heightLimited && ref.current) {
      checkIsTextHidden();
      ref.current.addEventListener("resize", checkIsTextHidden);
    }
    if (ref?.current?.getBoundingClientRect()?.height && checkCardHeight) {
      checkCardHeight();
    }
    return () => {
      cRef && cRef.removeEventListener("resize", checkIsTextHidden);
    };
  }, [component, mode, heightLimited]);

  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallBack}>
        <div
          ref={ref}
          id="innerhtml"
          onClick={(e) => {
            // if (post) {
            //   e.stopPropagation();
            // }
          }} //alternate to single click fix
          className={
            " relative prose inline-block prose-a:py-0  prose-headings:font-normal prose-p:my-0 prose-h1:text-xl   " +
            " prose-strong:text-th-textStrong prose-headings:text-th-textHeading text-th-textBody  prose-a:break-all prose-pre:max-w-[90vw] prose-pre:md:max-w-lg prose-pre:lg:max-w-3xl  prose-pre:overflow-x-auto prose-table:max-w-[90vw] prose-table:md:max-w-lg prose-table:lg:max-w-full prose-table:overflow-x-auto break-words max-w-none prose-pre:ring-1 prose-pre:ring-th-border2 " +
            (withBG
              ? "rounded-lg bg-th-highlight ring-1 ring-th-border2 "
              : "") +
            (resolvedTheme == "light" ? " " : " prose-invert  ") +
            (mode === "card"
              ? " prose-sm max-w-none w-full px-2 pr-4 py-1 "
              : mode === "expando"
              ? " prose-sm max-w-none w-full p-2"
              : mode === "post"
              ? " w-full p-4 "
              : "") +
            (hideText && mode !== "post"
              ? " overflow-hidden "
              : ` overflow-auto ${scrollStyle} pr-4 `)
          }
          style={{
            wordBreak: "break-word",
            maxHeight: `${
              limitHeight
                ? mode === "post" && !hideText
                  ? ""
                  : `${limitHeight}px`
                : ""
            }`,
          }}
        >
          {hiddenText && heightLimited && hideText && mode !== "post" && (
            <>
              <div
                className={
                  "absolute bottom-0 w-full h-32 pointer-events-none bg-gradient-to-t from-th-highlight to-transparent"
                }
              ></div>
              <button
                className="absolute flex items-center justify-center w-full h-10 -translate-x-1/2 bottom-2 left-1/2 group"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setHideText((h) => !h);
                }}
              >
                <BsChevronCompactDown className="flex-none w-8 h-8 stroke-white group-hover:translate-y-0.5 ease-in-out transition-transform" />
              </button>
            </>
          )}
          {component}
        </div>
      </ErrorBoundary>
    </>
  );
};

export default PostBody;
