import { useEffect, useState } from "react";

const ParseBodyHTML = ({ html, small = true, limitWidth = false }) => {
  const [insertHTML, setInsertHTML] = useState("");
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

        result = replaceDomains(result);

        return result;
      } else {
        return "";
      }
    };

    const replaceDomains = (str) => {
      if (typeof str == "undefined" || !str) return;
      return replaceUserDomains(str);
    };

    const replaceUserDomains = (str: String) => {
      let redditRegex = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))/gm;
      //excluding poll links for now
      let pollRegex = /([A-z.]+\.)?(reddit(\.com)|redd(\.it))?(\/poll\/)/gm;
      // let youtubeRegex = /([A-z.]+\.)?youtu(be\.com|\.be)/gm;
      // let twitterRegex = /([A-z.]+\.)?twitter\.com/gm;
      // let instagramRegex = /([A-z.]+\.)?instagram.com/gm;
      if (!str.match(pollRegex)) {
        str = str.replace(redditRegex, "troddit.com");
      }
      return str;
    };

    let unescaped = unescape(html);
    //let unescapedHTML = splitSpans(unescaped);
    //console.log(unescaped);
    setInsertHTML(unescaped);
  }, [html]);

  return (
    <div
      className={
        "dark:prose-invert prose prose-stone xl:prose-stone prose-headings:text-stone-700 dark:prose-headings:text-stone-300 dark:prose-strong:text-red-400  prose-strong:text-cyan-700  " +
        (small
          ? " prose-sm xl:prose-base xl:prose-p:my-0 prose-p:my-0 "
          : " 2xl:prose-lg ") +
        (limitWidth ? " max-w-2xl " : " max-w-none")
      }
      id="innerhtml"
      dangerouslySetInnerHTML={{ __html: insertHTML }}
    ></div>
  );
};

export default ParseBodyHTML;
