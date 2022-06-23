/* eslint-disable react/display-name */
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import ParseATag from "./ParseATag";

import HtmlToReact from "html-to-react";

const HtmlToReactParser = HtmlToReact.Parser;
const htmlToReactParser = new HtmlToReactParser();
const isValidNode = function () {
  return true;
};

// Order matters. Instructions are processed in the order they're defined
const processNodeDefinitions = new HtmlToReact.ProcessNodeDefinitions(React);
const processingInstructions = [
  {
    shouldProcessNode: function (node) {
      let check =
        node.parent &&
        node.parent.name &&
        node.parent.name === "a" &&
        node.parent?.attribs?.href?.includes("https://") &&
        node.name !== "img"; //leave comment gifs alone

      //check && console.log(node);
      return check;
    },
    processNode: function (node, children, index) {
      return React.createElement(ParseATag, { key: index }, node); //node?.data?.toUpperCase();
    },
  },
  {
    // Anything else
    shouldProcessNode: function (node) {
      return true;
    },
    processNode: processNodeDefinitions.processDefaultNode,
  },
];

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
  const { theme, resolvedTheme } = useTheme();
  const [component, setComponent] = useState<any>();
  const ref = useRef<any>();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    //formatting per Teddit
    // const unescape = (s) => {
    //   if (s) {
    //     var re = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
    //     var unescaped = {
    //       "&amp;": "&",
    //       "&#38;": "&",
    //       "&lt;": "<",
    //       "&#60;": "<",
    //       "&gt;": ">",
    //       "&#62;": ">",
    //       "&apos;": "'",
    //       "&#39;": "'",
    //       "&quot;": '"',
    //       "&#34;": '"',
    //     };
    //     let result = s.replace(re, (m) => {
    //       return unescaped[m];
    //     });
    //     if (newTabLinks) {
    //       result = blankTargets(result);
    //     }
    //     result = replaceDomains(result);
    //     return result;
    //   } else {
    //     return "";
    //   }
    // };

    const blankTargets = (str) => {
      if (str?.includes("<a ")) {
        str = str?.replaceAll("<a ", '<a target="_blank" rel="noreferrer" ');
      }
      return str;
    };

    const replaceDomains = (str) => {
      if (typeof str == "undefined" || !str) return;
      let splitstr = str.split("<a");
      let replaceall: string[] = [];
      splitstr.forEach((substr) => replaceall.push(replaceUserDomains(substr)));
      return replaceall.join("<a");
    };

    const replaceUserDomains = (str: string) => {
      let redditRegex = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))/gm;
      let matchRegex1 = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))+(\/[ru]\/)/gm;
      let matchRegex2 = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))+(\/user\/)/gm;
      let matchRegex3 =
        /([A-z.]+\.)?(reddit(\.com)|redd(\.it))+(\/)+([A-z0-9]){6}("|\s)/gm;
      // let youtubeRegex = /([A-z.]+\.)?youtu(be\.com|\.be)/gm;
      // let twitterRegex = /([A-z.]+\.)?twitter\.com/gm;
      // let instagramRegex = /([A-z.]+\.)?instagram.com/gm;
      if (
        str.match(matchRegex1) ||
        str.match(matchRegex2) ||
        str.match(matchRegex3)
      ) {
        str = str.replace(redditRegex, "troddit.com");
      }
      return str;
    };

    const parseHTML = (html) => {
      const reactElement = htmlToReactParser.parseWithInstructions(
        html,
        isValidNode,
        processingInstructions
      );
      return reactElement;
    };

    //let unescaped = unescape(html); //no longer need this due to html-to-react
    let result = replaceDomains(html);
    if (newTabLinks) {
      result = blankTargets(result);
    }
    let reactElement = parseHTML(result);
    setComponent(reactElement);
  }, [html]);

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
          "  prose-strong:text-th-textStrong prose-headings:text-th-textHeading text-th-textBody " +
          (resolvedTheme == "light" ? " " : " prose-invert  ") +
          (small && card
            ? " prose-sm  "
            : small
            ? " prose-sm prose-h1:text-lg  prose-p:my-0 "
            : "  ") +
          (limitWidth ? " max-w-2xl " : " max-w-none")
        }
      >
        {component}
      </div>
    </ErrorBoundary>
  );
};

export default ParseBodyHTML;
