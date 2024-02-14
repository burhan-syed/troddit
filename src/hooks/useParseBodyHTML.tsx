/* eslint-disable react/display-name */
import React, { useEffect, useState } from "react";
import ParseATag from "../components/ParseATag";

import HtmlToReact from "html-to-react";

const HtmlToReactParser = HtmlToReact.Parser;
const htmlToReactParser = HtmlToReactParser();
const isValidNode = function () {
  return true;
};

// Order matters. Instructions are processed in the order they're defined
const processNodeDefinitions = HtmlToReact.ProcessNodeDefinitions();
const processingInstructions = [
  {
    shouldProcessNode: function (node) {
      let check =
        node.parent &&
        node.parent.name &&
        node.parent.name === "a" &&
        node.parent?.attribs?.href?.includes("https://") &&
        checkSupport(node.parent?.attribs?.href, node) &&
        node.name !== "img"; //leave comment gifs alone
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
const checkSupport = (link: string, node: any) => {
  //prevent recurring nodes from all having expansion buttons
  if (node?.next?.parent?.attribs?.href === link) {
    return false;
  }

  let imgurRegex = /([A-z.]+\.)?(imgur(\.com))+(\/)+([A-z0-9]){7}\./gm;
  let redditRegex =
    /(preview+\.)+(reddit(\.com)|redd(\.it))+(\/[A-z0-9]+)+(\.(png|jpg))\./gm;
  let greedyRegex = /(\.(png|jpg))/gm;
  return !!(
    link.match(imgurRegex) ||
    link.match(redditRegex) ||
    link.match(greedyRegex)
  );
};

const useParseBodyHTML = ({ rawHTML, newTabLinks = false }) => {
  const [component, setComponent] = useState<any>();

  useEffect(() => {
    const PROTOCOL = window.location.protocol;
    const DOMAIN = window?.location?.host ?? "troddit.com";

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
        str = str.replace(redditRegex, DOMAIN); //.replace(/(https:\/\/|http:\/\/)/g,PROTOCOL);
        if (str.includes("https:") && PROTOCOL !== "https:") {
          str = str.replace("https:", PROTOCOL);
        }
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
    let result = replaceDomains(rawHTML);
    if (newTabLinks) {
      result = blankTargets(result);
    }
    let reactElement = parseHTML(result);
    setComponent(reactElement);
  }, [rawHTML]);

  return component;
};

export default useParseBodyHTML;
