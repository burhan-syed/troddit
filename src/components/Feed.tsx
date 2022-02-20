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
  getRedditSearch,
  loadSubFlairPosts,
} from "../RedditAPI";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { getSession, useSession } from "next-auth/client";
import PostModal from "./PostModal";
import LoginModal from "./LoginModal";
import SubredditBanner from "./SubredditBanner";

import MyMasonic from "./MyMasonic";
import { findMediaInfo } from "../../lib/utils";
import { ErrorBoundary } from "react-error-boundary";

const Feed = ({
  query,
  isUser = false,
  isMulti = false,
  isSubFlair = false,
  isSearch = false,
  safeSearch = false,
}) => {
  const [session, sessloading] = useSession();
  const [loading, setLoading] = useState(true);
  const [nothingHere, setNothingHere] = useState(false);
  const [error, setError] = useState(false);
  const [fetchPost, setFetchPost] = useState(false);
  const context: any = useMainContext();
  let {
    imgFilter,
    vidFilter,
    selfFilter,
    galFilter,
    linkFilter,
    imgPortraitFilter,
    imgLandscapeFilter,
  } = context;
  const [filterCount, setFilterCount] = useState(0);
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
    //console.log(query);
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
        setSort(query?.frontsort ?? "hot");
        setRange(query?.t ?? "");
      } else {
        //fetching from post from direct url
        setFetchPost(true);
        updateLoading(false);
      }
      //fetchFront();
    } else if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.sort ?? query?.slug?.[1] ?? "hot");
      setRange(query?.t ?? "");
      //fetchSubs();
    } else {
      setSort(query?.frontsort ?? query?.sort ?? "hot");
      setRange(query?.t ?? "");

      //causing client side errors
      //!sessloading && fetchFront();
    }

    return () => {};
  }, [query, sessloading]);

  useEffect(() => {
    setFilterCount(0);
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
      updateLoading(false);
    } else if (isSearch) {
      !sessloading && fetchSearch();
    } else if (query.frontsort) {
      if (
        query?.frontsort == "" ||
        query?.frontsort?.includes("best") ||
        query?.frontsort?.includes("top") ||
        query?.frontsort?.includes("hot") ||
        query?.frontsort?.includes("new") ||
        query?.frontsort?.includes("rising")
      ) {
        // setSort(query?.frontsort ?? "best");
        // setRange(query?.t ?? "");
        !sessloading && fetchFront();
      }
    } else if (query.slug) {
      // setSubreddits(query?.slug?.[0] ?? "");
      // setSort(query?.slug?.[1] ?? "best");
      // setRange(query?.t ?? "");
      !sessloading && fetchSubs();
    } else {
      // setSort(query?.frontsort ?? "best");
      // setRange(query?.t ?? "");
      !sessloading && fetchFront();
    }
    return () => {
      setPosts([]);
      setAfter("");
      setNumPosts(0);
      setFilterCount(0);
      setFetchPost(false);
      setError(false);
      updateLoading(true);
    };
  }, [
    subreddits,
    sort,
    range,
    sessloading,
    context.forceRefresh,
    query.q,
    safeSearch,
  ]);

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
      await manageData(data);
    } else {
      updateLoading(false);
      setError(true);
    }
  };

  const fetchSearch = async () => {
    let data = await getRedditSearch(
      query,
      "",
      query?.sort,
      session ? true : false,
      undefined,
      query?.t,
      context?.token,
      safeSearch ? undefined : true
    );
    if (data?.children) {
      await manageData(data);
    } else {
      setError(true);
      updateLoading(false);
    }
  };

  const fetchSubs = async () => {
    //console.log(query);
    let data: any;
    let subs = query?.slug?.[0]
      .split(" ")
      .join("+")
      .split(",")
      .join("+")
      .split("%20")
      .join("+");
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
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
      // data = await loadSubFlairPosts(
      //   query.slug[0],
      //   query?.q,
      //   query?.sort,
      //   query?.t
      // );
      data = await getRedditSearch(
        query,
        "",
        query?.sort,
        session ? true : false,
        subs?.split("+")?.[0] ?? "all",
        query?.t,
        context?.token,
        safeSearch ? undefined : true
      );
    } else {
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
      await manageData(data);
    } else {
      setError(true);
      updateLoading(false);
    }
  };

  const manageData = async (data) => {
    data?.token && context.setToken(data?.token);
    setAfter(data?.after);
    data?.children?.length < 1 ? setNothingHere(true) : setNothingHere(false);
    if (
      !imgFilter ||
      !vidFilter ||
      !selfFilter ||
      !galFilter ||
      !linkFilter ||
      !imgPortraitFilter ||
      !imgLandscapeFilter
    ) {
      data.children = await filterChildren(data.children);
    }
    setPosts(data.children);
    setNumPosts((n) => n + data.children.length);
    updateLoading(false);
  };

  const filterChildren = async (data: Array<any>) => {
    async function filter(arr, callback) {
      const fail = Symbol();
      return (
        await Promise.all(
          arr.map(async (item) => ((await callback(item)) ? item : fail))
        )
      ).filter((i) => i !== fail);
    }

    const filterCheck = async (d) => {
      let quick = true;
      //need to get all resolution data if filtering out orientations
      if (!imgPortraitFilter || !imgLandscapeFilter) {
        quick = false;
      }
      let mediaInfo = await findMediaInfo(d, quick);
      //orientation check
      if (!imgPortraitFilter || !imgLandscapeFilter) {
        //only check on videos or images (galleries consider images)
        if (mediaInfo?.isVideo || mediaInfo?.isImage) {
          //hide portrait if they are portrait, square is considered portrait

          if (!imgPortraitFilter && mediaInfo?.isPortrait) {
            setFilterCount((n) => n + 1);

            return false;
          }
          //hide landscape if not portrait (are landscape)
          if (!imgLandscapeFilter && mediaInfo?.isPortrait === false) {
            setFilterCount((n) => n + 1);

            return false;
          }
        }
      }

      if (!vidFilter && mediaInfo.isVideo) {
        //if video is not in self post, filter out
        if (!(selfFilter && mediaInfo.isSelf)) {
          setFilterCount((n) => n + 1);
          return false;
        }
      } else if (!imgFilter && mediaInfo.isImage) {
        //if image is not in self post, filter out
        if (!(selfFilter && mediaInfo.isSelf)) {
          setFilterCount((n) => n + 1);
          return false;
        }
      } else if (!linkFilter && mediaInfo.isLink) {
        setFilterCount((n) => n + 1);
        return false;
      }
      //if self post, filter out
      else if (!selfFilter && mediaInfo.isSelf) {
        setFilterCount((n) => n + 1);
        return false;
      } else if (!galFilter && mediaInfo.isGallery) {
        setFilterCount((n) => n + 1);

        return false;
      } else {
        return true;
      }
    };

    let f = await filter(data, async (d) => {
      let r = await filterCheck(d.data);
      //console.log(d, r);
      return r;
    });
    return f;
  };

  //const [errored, setErrored] = useState(false);

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
          {"Please assure traffic from Reddit is not blocked and refresh"}
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
        <div
          className={
            "w-full " +
            (context.columnOverride === 1 &&
            context.cardStyle !== "row1" &&
            !context.wideUI
              ? " max-w-2xl "
              : " md:w-11/12 ") +
            (context.cardStyle === "row1"
              ? " bg-lightPost dark:bg-[#212121] "
              : " ")
          }
        >
          {/* + (context?.maximize ? " " : " md:w-5/6") */}
          {!loading && (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={() => context.setForceRefresh((i) => i + 1)}
            >
              <MyMasonic
                //page={`${subreddits}_${sort}_${range}_${imgFilter}_${vidFilter}_${selfFilter}_${galFilter}_${linkFilter}`}
                query={query}
                initItems={posts}
                initAfter={after}
                isUser={isUser}
                isMulti={isMulti}
                isSearch={isSearch}
                session={session}
                isSubFlair={isSubFlair}
                filterNum={filterCount}
                safeSearch={safeSearch}
              />
            </ErrorBoundary>
          )}
        </div>
      </div>
    </main>
  );
};

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div
      className="flex flex-col items-center justify-center mb-auto"
      role="alert"
    >
      <p className="text-center">Something went wrong</p>
      <button
        className="p-2 mb-2 border border-blue-700 rounded-lg hover:bg-lightHighlight dark:hover:bg-darkHighlight"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}

export default Feed;
