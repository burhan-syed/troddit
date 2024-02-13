import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import { useEffect, useState } from "react";
import SubredditBanner from "../../components/SubredditBanner";
import {
  getWikiContent,
  loadPost,
  loadSubredditInfo,
  loadSubreddits,
} from "../../RedditAPI";
import ParseBodyHTML from "../../components/ParseBodyHTML";
import Collection from "../../components/collections/Collection";
import PostModal from "../../components/PostModal";
import LoginModal from "../../components/LoginModal";
import React from "react";
import useThread from "../../hooks/useThread";
import { findMediaInfo } from "../../../lib/utils";
import { getToken } from "next-auth/jwt";
import { getSession } from "next-auth/react";
import { useTAuth } from "../../PremiumAuthContext";
const SubredditPage = ({ query, metaTags, post, postData }) => {
  const user = useTAuth();
  const [subsArray, setSubsArray] = useState<string[]>([]);
  const [wikiContent, setWikiContent] = useState("");
  const [wikiMode, setWikiMode] = useState(false);
  const [commentThread, setCommentThread] = useState(false);
  const [postThread, setPostThread] = useState(false);
  const [withCommentContext, setWithCommentContext] = useState(false);
  useEffect(() => {
    const getWiki = async (wikiquery: {wikiquery:string[];isPremium:boolean}) => {
      const data = await getWikiContent(wikiquery);
      setWikiContent(data?.data?.content_html ?? "nothing found");
    };

    if (user.isLoaded) {
      setSubsArray(
        query?.slug?.[0]
          .split(" ")
          .join("+")
          .split(",")
          .join("+")
          .split("%20")
          .join("+")
          .split("+")
      );
      if (query?.slug?.[1]?.toUpperCase() === "COMMENTS") {
        setPostThread(true);
        query?.context && setWithCommentContext(true);
        query?.slug?.[4] && setCommentThread(true);
      } else if (query?.slug?.[1]?.toUpperCase() === "WIKI") {
        setWikiMode(true);
        let wikiquery = query.slug;
        if (!wikiquery?.[2]) wikiquery[2] = "index";
        getWiki({wikiquery, isPremium: user.premium?.isPremium ?? false});
      }
    }

    return () => {
      setPostThread(false);
      setWithCommentContext(false);
      setCommentThread(false);
      setWikiMode(false);
      setSubsArray([]);
    };
  }, [query, user.isLoaded, user.premium?.isPremium]);
  return (
    <div
      className={
        (subsArray?.[0]?.toUpperCase() !== "ALL" &&
        subsArray?.[0]?.toUpperCase() !== "POPULAR"
          ? " -mt-2 "
          : "") + " overflow-x-hidden overflow-y-auto "
      }
    >
      <Head>
        <title>
          {query?.slug?.[0] ? `troddit · ${query?.slug?.[0]}` : "troddit"}
        </title>
        {metaTags?.ogDescription && (
          <meta name="description" content={metaTags.ogDescription}></meta>
        )}
        {metaTags?.ogSiteName && (
          <>
            <meta property="og:site_name" content={metaTags?.ogSiteName} />
            {metaTags?.ogDescription && (
              <meta
                property="og:description"
                content={metaTags?.ogDescription}
              />
            )}
            {metaTags?.ogTitle && (
              <meta property="og:title" content={metaTags?.ogTitle} />
            )}
            {metaTags?.ogImage && (
              <meta property="og:image" content={metaTags?.ogImage} />
            )}
            {metaTags?.ogHeight && (
              <meta property="og:image:height" content={metaTags?.ogHeight} />
            )}
            {metaTags?.ogWidth && (
              <meta property="og:image:width" content={metaTags?.ogWidth} />
            )}
            {metaTags?.ogType && (
              <meta property="og:type" content={metaTags?.ogType} />
            )}
          </>
        )}
      </Head>
      <main>
        {subsArray?.[0]?.toUpperCase() !== "ALL" &&
        subsArray?.[0]?.toUpperCase() !== "POPULAR" &&
        subsArray?.length > 0 ? (
          <div className="w-screen ">
            <SubredditBanner subreddits={subsArray} userMode={false} />
          </div>
        ) : (
          <div className=""></div>
        )}
        {wikiMode ? (
          <div className="flex flex-col flex-wrap mb-10 md:mx-10 lg:mx-20">
            <Link href={`/r/${subsArray[0]}/wiki`}>
              <h1 className="text-lg font-bold">Wiki</h1>
            </Link>
            {wikiContent ? (
              <ParseBodyHTML html={wikiContent} newTabLinks={false} />
            ) : (
              <div className="w-full rounded-md h-96 bg-th-highlight animate-pulse"></div>
            )}
          </div>
        ) : postThread ? (
          <div className="mt-10">
            <LoginModal />
            <PostModal
              permalink={"/r/" + query?.slug.join("/")}
              returnRoute={query?.slug?.[0] ? `/r/${query?.slug[0]}` : "/"}
              setSelect={setCommentThread}
              direct={true}
              commentMode={commentThread}
              withcontext={withCommentContext}
              postData={post}
              postNum={0}
              curKey={undefined}
            />
          </div>
        ) : (
          <Feed initialData={postData} />
        )}
      </main>
    </div>
  );
};

SubredditPage.getInitialProps = async (d) => {
  const { query, req, res } = d;
  // let subreddits = query?.slug?.[0];
  // subreddits = query?.slug?.[0]?.split(" ")?.join("+")?.split("%2b")?.join("+");
  return { query };
};

export default SubredditPage;
