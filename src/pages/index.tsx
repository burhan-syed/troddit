/* eslint-disable react-hooks/rules-of-hooks */
import Head from "next/head";
import Feed from "../components/Feed";
import { useEffect, useState } from "react";
import { getSession, useSession } from "next-auth/react";
import { loadFront, loadPost } from "../RedditAPI";
import { getToken } from "next-auth/jwt";
import React from "react";
import Card1 from "../components/cards/Card1";
import Modal from "../components/ui/Modal";

const index = ({ postData, user }) => {
  const [initialData, setInitialData] = useState({});
  const [ready, setReady] = useState(false);
  const data = useSession();
  const isloading = data.status === "loading";
  useEffect(() => {
    if (!isloading) {
      const parseCookie = (str) =>
        str
          .split(";")
          .map((v) => v.split("="))
          .reduce((acc, v) => {
            acc[decodeURIComponent(v[0].trim())] = decodeURIComponent(
              v[1].trim()
            );
            return acc;
          }, {});
      const cookies = parseCookie(document.cookie);
      //can't use initial ssr props if login mismatch or local subs changed
      if (
        user !== (data?.data?.user?.name ?? "") ||
        (cookies?.["localSubs"] && cookies?.["localSubs"] !== "false")
      ) {
        setInitialData({});
      } else {
        setInitialData(postData);
      }
      setReady(true);
    }
    return () => {
      setReady(false);
    };
  }, [postData, isloading, user, data?.data?.user?.name]);
  return (
    <div className="overflow-x-hidden ">
      <Head>
        <title>troddit · a web app for Reddit </title>
        <meta
          name="description"
          content="Browse Reddit better with Troddit. Grid views, single column mode, galleries, and a number of post styles. Login with Reddit to see your own subs, vote, and comment. Open source."
        ></meta>
      </Head>
      <main>
        {ready && <Feed initialData={initialData} />}
      </main>
    </div>
  );
};
//can't use getServerSide Props because inner app navigation break...
index.getInitialProps = async ({ req, query, res }) => {
  if (req) {
    const session = await getSession({ req });
    let data: any = {};
    if (!session && req.cookies?.localSubs !== "true" && res) {
      let localSubs = new Array() as [string];
      if (
        req.cookies.localSubs !== "false" &&
        req.cookies.localSubs?.length > 0
      ) {
        localSubs = req.cookies.localSubs?.split(",") as [string];
      } else {
        res.setHeader(
          "Cache-Control",
          "max-age=0, s-maxage=1200, stale-while-revalidate=30"
        );
      }
      data = await loadFront(
        false,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        localSubs
      );
    } else if (session) {
      const token: any = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
      });
      let tokenData = {
        accessToken: token.reddit.accessToken,
        refreshToken: token.reddit.refreshToken,
        expires: token.expires,
      };
      data = await loadFront(
        true,
        tokenData,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        true
      );
    }
    if (data?.children && data?.after) {
      return {
        user: session?.user?.name ?? "",
        query: query,
        postData: {
          children: [...data.children.slice(0, 6)], //only send the first n posts to limit page size
        },
      };
    }
    return { query: query, postData: {}, user: "" };
  }
  return { query };
};

export default index;
