import { useEffect, useState } from "react";

const ParseBodyHTML = ({
  html,
  small = true,
  card = false,
  limitWidth = false,
}) => {
  const [insertHTML, setInsertHTML] = useState(html);
  useEffect(() => {
    //formatting per Teddit
    const unescape = (s) => {

      if (s) {
        var re = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g;
        var unescaped = {
          "&amp;": "&",
          "&#38;": "&",
          "&lt;": "<",
          "&#60;": "<",
          "&gt;": ">",
          "&#62;": ">",
          "&apos;": "'",
          "&#39;": "'",
          "&quot;": '"',
          "&#34;": '"',
        };
        let result = s.replace(re, (m) => {
          return unescaped[m];
        });
        result = blankTargets(result);
        result = replaceDomains(result);

        return result;
      } else {
        return "";
      }
    };

    const blankTargets = (str) => {
      if (str?.includes("<a ")) {
        str = str?.replaceAll(
          "<a ",
          '<a target="_blank" '
        );
      }
      return str; 
    }

    const replaceDomains = (str) => {
      if (typeof str == "undefined" || !str) return;
      let splitstr = str.split("<a");
      let replaceall = [];
      splitstr.forEach((substr) => replaceall.push(replaceUserDomains(substr)));
      return replaceall.join("<a");
    };

    const replaceUserDomains = (str: String) => {
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
    
   
    let unescaped = unescape(html);
    setInsertHTML(unescaped);
  }, [html]);

  return (
    <div
      className={
        "dark:prose-invert prose prose-stone prose-headings:text-stone-900 text-stone-700 dark:text-lightText dark:prose-headings:text-lightText prose-headings:font-normal prose-h1:text-xl   dark:prose-strong:text-rose-400 dark:prose-strong:font-semibold  prose-p:my-0  prose-strong:text-rose-800  " +
        (small && card
          ? " prose-sm  "
          : small
          ? " prose-sm prose-h1:text-lg  prose-p:my-0 "
          : "  ") +
        (limitWidth ? " max-w-2xl " : " max-w-none")
      }
      id="innerhtml"
      dangerouslySetInnerHTML={{ __html: insertHTML }}
    ></div>
  );
};

export default ParseBodyHTML;
