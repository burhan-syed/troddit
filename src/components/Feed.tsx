import { useEffect, useState } from "react";
import Post from "./Post";
//import Masonry from "react-masonry-css";
import {
  loadFront,
  loadPost,
  loadSubreddits,
  loadUserPosts,
  loadSubInfo,
  getUserMultiPosts,
  loadSubFlairPosts,
} from "../RedditAPI";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { getSession, useSession } from "next-auth/client";
import PostModal from "./PostModal";
import LoginModal from "./LoginModal";
import SubredditBanner from "./SubredditBanner";

import MyMasonic from "./MyMasonic";

const Feed = ({
  query,
  isUser = false,
  isMulti = false,
  isSubFlair = false,
}) => {
  const [session, sessloading] = useSession();
  const [loading, setLoading] = useState(true);
  const [nothingHere, setNothingHere] = useState(false);
  const [error, setError] = useState(false);
  const [fetchPost, setFetchPost] = useState(false);
  const context: any = useMainContext();
  // const breakpointColumnsObj = {
  //   default: 4,
  //   2560: 3,
  //   1280: 2,
  //   767: 1,
  // };
  const [posts, setPosts] = useState([]);
  const [numposts, setNumPosts] = useState(0);
  const [after, setAfter] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [subsArray, setSubsArray] = useState([]);
  const [isSubreddit, setIsSubreddit] = useState(false);
  const [sort, setSort] = useState("");
  const [range, setRange] = useState("");

  const updateLoading = (b) => {
    setLoading(b);
    context.setLoading(b);
  };

  useEffect(() => {
    //console.log("query:", query);
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
      updateLoading(false);
    } else if (query.frontsort) {
      if (
        query?.frontsort == "" ||
        query?.frontsort?.includes("best") ||
        query?.frontsort?.includes("top") ||
        query?.frontsort?.includes("hot") ||
        query?.frontsort?.includes("new") ||
        query?.frontsort?.includes("rising")
      ) {
        setSort(query?.frontsort ?? "best");
        setRange(query?.t ?? "");
      } else {
        setFetchPost(true);
        updateLoading(false);
      }
      //fetchFront();
    } else if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "best");
      setRange(query?.t ?? "");
      //fetchSubs();
    } else {
      setSort(query?.frontsort ?? "best");
      setRange(query?.t ?? "");

      //causing client side errors
      //!sessloading && fetchFront();
    }
    return () => {};
  }, [query, sessloading]);

  useEffect(() => {
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
      updateLoading(false);
    } else if (query.frontsort) {
      if (
        query?.frontsort == "" ||
        query?.frontsort?.includes("best") ||
        query?.frontsort?.includes("top") ||
        query?.frontsort?.includes("hot") ||
        query?.frontsort?.includes("new") ||
        query?.frontsort?.includes("rising")
      ) {
        setSort(query?.frontsort ?? "best");
        setRange(query?.t ?? "");
        !sessloading && fetchFront();
      }
    } else if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "best");
      setRange(query?.t ?? "");
      !sessloading && fetchSubs();
    } else {
      setSort(query?.frontsort ?? "best");
      setRange(query?.t ?? "");
      !sessloading && fetchFront();
    }
    return () => {
      setPosts([]);
      setAfter("");
      setNumPosts(0);
      setFetchPost(false);
      setError(false);
      updateLoading(true);
    };
  }, [subreddits, sort, range, sessloading, context.forceRefresh]);

  const fetchFront = async () => {
    let data: any = await loadFront(
      session ? true : false,
      context?.token,
      query?.frontsort ?? "hot",
      query?.t ?? "",
      "",
      undefined,
      context?.localSubs
    );
    if (data?.children) {
      context.setToken(data?.token);
      updateLoading(false);

      setNumPosts((n) => n + data.children.length);
      setAfter(data?.after);
      setPosts(data.children);
      return data.children;
    } else {
      updateLoading(false);
      setError(true);
    }
  };

  const fetchSubs = async () => {
    //console.log(query);
    let data: any;
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
      updateLoading(false);
    } else if (isUser) {
      if (isMulti) {
        data = await getUserMultiPosts(
          query?.slug?.[0],
          query?.slug?.[2],
          query?.slug?.[3],
          query?.t
        );
      } else {
        data = await loadUserPosts(
          query?.slug?.[0] ?? "",
          query?.slug?.[1] ?? "hot",
          query?.t ?? ""
        );
      }
    } else if (isSubFlair) {
      data = await loadSubFlairPosts(
        query.slug[0],
        query?.q,
        query?.sort,
        query?.t
      );
    } else {
      let subs = query?.slug?.[0]
        .split(" ")
        .join("+")
        .split(",")
        .join("+")
        .split("%20")
        .join("+");
      setSubsArray(subs.split("+"));
      //console.log(subs);
      data = await loadSubreddits(
        session ? true : false,
        context?.token,
        subs ?? "",
        query?.slug?.[1] ?? "hot",
        query?.t ?? ""
      );
    }
    if (data?.children) {
      setIsSubreddit(true);
      data?.token && context.setToken(data?.token);
      setAfter(data?.after);
      setPosts(data.children);
      setNumPosts((n) => n + data.children.length);
      updateLoading(false);
      data?.children?.length < 1 ? setNothingHere(true) : setNothingHere(false);
    } else {
      updateLoading(false);
      setError(true);
    }
  };

  if (nothingHere) {
    return (
      <div className="text-center">
        {"there doesn't seem to be anything here"}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="absolute top-0 w-screen h-16 bg-blue-700 animate-pulse"></div>
    );
  }
  if (fetchPost) {
    return (
      <div className="mt-10">
        <LoginModal />
        <PostModal
          permalink={
            query?.frontsort
              ? `/${query.frontsort}`
              : "/r/" + query.slug.join("/")
          }
          returnRoute={query.slug?.[0] ? `/r/${query.slug[0]}` : "/"}
          setSelect={setFetchPost}
          direct={true}
        />
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center mt-16 text-center">
        <div>{"Oops something went wrong :("}</div>
        <div>
          {
            "Please refresh and make sure you're not blocking traffic from Reddit"
          }
        </div>
        {subreddits !== "" && (
          <div>{`Otherwise, this ${
            isUser ? "user" : "subreddit"
          } may not exist`}</div>
        )}
      </div>
    );
  }
  return (
    <main>
      <LoginModal />
      <div className="flex flex-col items-center flex-none w-screen">
        <div className={"w-full md:w-11/12"}>
          {/* + (context?.maximize ? " " : " md:w-5/6") */}
          <MyMasonic
            query={query}
            initItems={posts}
            initAfter={after}
            isUser={isUser}
            isMulti={isMulti}
            session={session}
            isSubFlair={isSubFlair}
          />
        </div>
      </div>
    </main>
  );
};

export default Feed;
