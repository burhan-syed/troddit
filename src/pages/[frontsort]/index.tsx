import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import Head from "next/head";
import PostModal from "../../components/PostModal";
import LoginModal from "../../components/LoginModal";
import { loadPost } from "../../RedditAPI";
import { findMediaInfo } from "../../../lib/utils";

const Subs = ({ query, metaTags, post }) => {
  return (
    <div>
      <Head>
        <title>
          {metaTags?.ogTitle
            ? `troddit · ${metaTags?.ogTitle}`
            : query?.frontsort
            ? `troddit · ${query?.frontsort}`
            : "troddit"}
        </title>
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

      <main className="">
        {query.frontsort === "best" ||
        query.frontsort === "hot" ||
        query.frontsort === "new" ||
        query.frontsort === "top" ||
        query.frontsort === "rising" ? (
          <>
            <Feed />
          </>
        ) : (
          <>
            <div className="mt-10">
              <LoginModal />
              <PostModal
                permalink={`/${query?.frontsort}`}
                returnRoute={query?.slug?.[0] ? `/r/${query?.slug[0]}` : "/"}
                setSelect={() => {}}
                direct={true}
                curKey={undefined}
                postNum={undefined}
                postData={post}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

Subs.getInitialProps = async (d) => {
  const { query, req } = d;
  let url = req?.url;
  url = url?.split("?")?.[0];
  if (
    !(
      query.frontsort === "best" ||
      query.frontsort === "hot" ||
      query.frontsort === "new" ||
      query.frontsort === "top" ||
      query.frontsort === "rising"
    )
  ) {
    try {
      const { post } = await loadPost(url);
      //const data = await fetch(`https://www.reddit.com${url}.json`)
      //let post = (await data.json())?.[0]?.data?.children?.[0]?.data;
      const media = await findMediaInfo(
        post,
        true,
        d?.req?.headers.host?.split(":")?.[0]
      );
      let metaTags = {
        ogSiteName: "troddit",
        ogDescription: `Post on r/${post.subreddit} by u/${
          post.author
        } • ${post.score?.toLocaleString(
          "en-US"
        )} points and ${post.num_comments?.toLocaleString("en-US")} comments`,
        ogTitle: post.title,
        ogImage: media?.imageInfo?.[media?.imageInfo?.length - 1]?.url,
        ogHeight: media?.dimensions?.[1],
        ogWidth: media?.dimensions?.[0],
        ogType: `image`,
      };
      return { query, metaTags, post: post?.preview ? post : undefined };
    } catch (err) {
      return { query };
    }
  }
  return { query };
};

export default Subs;
