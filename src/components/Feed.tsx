import { useEffect, useState } from "react";
import {
  loadFront,
  loadPost,
  loadSubreddits,
  loadUserPosts,
  loadSubInfo,
  getUserMultiPosts,
  getRedditSearch,
  loadSubFlairPosts,
  loadUserSelf,
} from "../RedditAPI";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { useSession } from "next-auth/react";
import PostModal from "./PostModal";
import LoginModal from "./LoginModal";

import MyMasonic from "./MyMasonic";
import { filterPosts, findMediaInfo } from "../../lib/utils";
import { ErrorBoundary } from "react-error-boundary";
import type { Session } from "next-auth/core/types";

const Feed = ({
  query,
  initialData = {} as any,
  session = {} as Session ,
  isUser = false,
  isMulti = false,
  isSubFlair = false,
  isSearch = false,
  safeSearch = false,
  userPostMode = "",
  isSelf = false,
}) => {
  //const { data: session, status } = useSession();
  //const sessloading = status === "loading";
  const [loading, setLoading] = useState(true);
  const [nothingHere, setNothingHere] = useState(false);
  const [error, setError] = useState(false);
  const [fetchPost, setFetchPost] = useState(false);
  const context: any = useMainContext();
  let {
    readFilter,
    imgFilter,
    vidFilter,
    selfFilter,
    galFilter,
    linkFilter,
    imgPortraitFilter,
    imgLandscapeFilter,
    userPostType,
  } = context;
  const [filterCount, setFilterCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [numposts, setNumPosts] = useState(0);
  const [postnames, setPostNames] = useState({});
  const [after, setAfter] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [subsArray, setSubsArray] = useState([]);
  const [isSubreddit, setIsSubreddit] = useState(false);
  const [sort, setSort] = useState("");
  const [range, setRange] = useState("");
  const [filterSubs, setFilterSubs] = useState(false);

  const updateLoading = (b) => {
    setLoading(b);
    context.setLoading(b);
  };

  //monitors query to change sort/range
  useEffect(() => {
    if (
      (query?.slug?.[0]
        ?.split(" ")
        ?.join("+")
        ?.split(",")
        ?.join("+")
        ?.split("%20")
        ?.join("+")
        ?.split("+")?.length > 1 ||
        !query?.slug ||
        query?.slug?.[0]?.toUpperCase() == "ALL" ||
        query?.slug?.[0]?.toUpperCase() == "POPULAR") &&
      !isUser
    ) {
      setFilterSubs(true);
    }
    if (query?.slug?.[1] === "comments" && !userPostMode) {
    } else if (query?.frontsort) {
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
      }
    } else if (query?.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.sort ?? query?.slug?.[1] ?? "hot");
      setRange(query?.t ?? "");
    } else {
      setSort(query?.frontsort ?? query?.sort ?? "hot");
      setRange(query?.t ?? "");
    }

    return () => {
      setFilterSubs(false);
    };
  }, [query]);

  useEffect(() => {
    let asynccheck = true;

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
      let data: any;
      let subs = query?.slug?.[0]
        .split(" ")
        .join("+")
        .split(",")
        .join("+")
        .split("%20")
        .join("+");
      if (query?.slug?.[1] === "comments" && !userPostMode) {
      } else if (isUser) {
        if (userPostMode !== "" && isSelf) {
          data = await loadUserSelf(
            context?.token,
            session ? true : false,
            userPostMode.toLocaleLowerCase(),
            query?.sort,
            query?.t,
            "",
            session?.user?.name,
            userPostType === "comments" ? "comments" : "links"
          );
          //console.log(data);
        } else if (isMulti) {
          data = await getUserMultiPosts(
            query?.slug?.[0],
            query?.slug?.[2],
            query?.slug?.[3],
            query?.t
          );
        } else {
          data = await loadUserPosts(
            query?.slug?.[0] ?? "",
            query?.sort ?? "hot",
            query?.t ?? "",
            "",
            undefined,
            userPostMode
          );
        }
      } else if (isSubFlair) {
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
        let subArray: [string] = subs.split("+");
        setSubsArray(subArray);
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
      } else if (data) {
        setNothingHere(true);
        updateLoading(false);
      } else {
        setError(true);
        updateLoading(false);
      }
    };

    const manageData = async (data) => {
      if (asynccheck) {
        data?.token && context.setToken(data?.token);
        setAfter(data?.after);
        data?.children?.length < 1
          ? setNothingHere(true)
          : setNothingHere(false);
        setNumPosts((n) => n + data.children.length);
        let { filtered, filtercount } = await filterPosts(
          data?.children,
          {
            readFilter,
            imgFilter,
            vidFilter,
            selfFilter,
            // galFilter,
            linkFilter,
            imgPortraitFilter,
            imgLandscapeFilter,
          },
          {},
          filterSubs,
          isUser ? false : true
        );
        setPostNames(
          filtered.reduce((obj, post, index) => {
            obj[post?.data?.name] = 1;
            return obj;
          }, {})
        );
        setPosts(filtered);
        setFilterCount((n) => n + filtercount);
        updateLoading(false);
      }
    };
    if (context.ready) {
      setFilterCount(0);
      if (initialData?.children) {
        manageData(initialData);
      } else {
        if (query?.slug?.[1] === "comments" && !userPostMode) {
          setFetchPost(true);
          updateLoading(false);
        } else if (isSearch) {
          //!sessloading &&
           fetchSearch();
        } else if (query?.frontsort) {
          if (
            query?.frontsort == "" ||
            query?.frontsort?.includes("best") ||
            query?.frontsort?.includes("top") ||
            query?.frontsort?.includes("hot") ||
            query?.frontsort?.includes("new") ||
            query?.frontsort?.includes("rising")
          ) {
            //!sessloading && 
            fetchFront();
          } else {
            setFetchPost(true);
            updateLoading(false);
          }
        } else if (query?.slug) {
          //!sessloading && 
          fetchSubs();
        } else {
          //!sessloading && 
          fetchFront();
        }
      }
    }

    return () => {
      asynccheck = false;
      setPosts([]);
      setPostNames({});
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
    //sessloading,
    query?.q,
    safeSearch,
    userPostMode,
    userPostType,
    context.forceRefresh,
    context.ready,
  ]);

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
      <div className="absolute top-0 w-screen h-16 bg-th-accent animate-pulse"></div>
    );
  }
  if (fetchPost) {
    return (
      <div className="mt-10">
        <LoginModal />
        <PostModal
          permalink={
            query?.frontsort
              ? `/${query?.frontsort}`
              : "/r/" + query?.slug.join("/")
          }
          returnRoute={query?.slug?.[0] ? `/r/${query?.slug[0]}` : "/"}
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
              ? " bg-th-post2 border-th-border2 rounded-t-md rounded-b-md border shadow-2xl "
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
                postCount={numposts}
                postNames={postnames}
                filterSubs={filterSubs}
                initAfter={after}
                isUser={isUser}
                isSelf={isSelf}
                userPostMode={userPostMode}
                isMulti={isMulti}
                isSearch={isSearch}
                session={session}
                isSubFlair={isSubFlair}
                filterNum={filterCount}
                safeSearch={safeSearch}
                key={context.fastRefresh}
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
        className="p-2 mb-2 border rounded-lg border-th-accent hover:bg-th-highlight"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}

export default Feed;
