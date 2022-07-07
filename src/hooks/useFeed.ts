import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { QueryFunctionContext, useInfiniteQuery } from "react-query";
import { filterPosts } from "../../lib/utils";
import { useMainContext } from "../MainContext";
import {
  getRedditSearch,
  getUserMultiPosts,
  loadFront,
  loadSubreddits,
  loadUserPosts,
  loadUserSelf,
} from "../RedditAPI";

interface Params {
  initialPosts?: any;
  safeSearch?: boolean;
}

const useFeed = (params?: Params) => {
  const [ready, setReady] = useState(false);

  const { data: session, status } = useSession();
  const sessloading = status === "loading";
  const router = useRouter();
  const context: any = useMainContext();
  const {
    readFilter,
    imgFilter,
    vidFilter,
    selfFilter,
    galFilter,
    linkFilter,
    imgPortraitFilter,
    imgLandscapeFilter,
  } = context;

  const [filters, setFilters] = useState({
    readFilter: true,
    imgFilter: true,
    vidFilter: true,
    selfFilter: true,
    galFilter: true,
    linkFilter: true,
    imgPortraitFilter: true,
    imgLandscapeFilter: true,
  });
  useEffect(() => {
    if (context.ready && context.filtersApplied > 0) {
      setFilters({
        readFilter,
        imgFilter,
        vidFilter,
        selfFilter,
        galFilter,
        linkFilter,
        imgPortraitFilter,
        imgLandscapeFilter,
      });
    }
    return () => {
      setFilters({
        readFilter: true,
        imgFilter: true,
        vidFilter: true,
        selfFilter: true,
        galFilter: true,
        linkFilter: true,
        imgPortraitFilter: true,
        imgLandscapeFilter: true,
      });
    };
  }, [context.ready, context.filtersApplied]);

  //const contextForceRefresh = context.forceRefresh;

  const [sort, setSort] = useState<string>("");
  const [range, setRange] = useState<string>("");
  const [subreddits, setSubreddits] = useState("");
  const [mode, setMode] = useState<
    | "HOME"
    | "SUBREDDIT"
    | "USER"
    | "SELF"
    | "SEARCH"
    | "FLAIR"
    | "MULTI"
    | "NONE"
  >("NONE");
  const [userMode, setUserMode] = useState<
    | string
    | "overview"
    | "posts"
    | "comments"
    | "upvoted"
    | "downvoted"
    | "hidden"
    | "saved"
  >("");
  const [searchQuery, setSearchQuery] = useState("");

  //monitor route
  useEffect(() => {
    //console.log(router, router.query);
    const query = router?.query;
    if (
      // (query?.slug?.[1] === "comments" && router.pathname !== "/u/[...slug]") ||
      // (query?.slug?.[1] === "p") ||
      // (router.pathname === "/search" && router.asPath.substring(0,3) === "/r/")
      // /router.asPath?.substring(0,3) === "/r/" &&
      router.asPath?.includes("/comments/")
    ) {
      //ignore these route changes to prevent feed fetch
      //console.log("CHANGE NOTHING");
    } else if (query?.frontsort) {
      if (
        query?.frontsort == "" ||
        query?.frontsort?.includes("best") ||
        query?.frontsort?.includes("top") ||
        query?.frontsort?.includes("hot") ||
        query?.frontsort?.includes("new") ||
        query?.frontsort?.includes("rising")
      ) {
        setMode("HOME");
        setSort((query?.frontsort as string) ?? "hot");
        setRange((query?.t as string) ?? "");
      }
    } else if (query?.slug) {
      if (router.pathname == "/u/[...slug]") {
        if (query?.slug?.[1] === "m" && query?.slug?.[2]) {
          setMode("MULTI");
          setUserMode(query.slug[2]);
          setSort(query?.slug?.[3] ?? "hot");
        } else if (
          query?.slug?.[0]?.toUpperCase() == session?.user?.name?.toUpperCase()
        ) {
          setMode("SELF");
          setUserMode(query?.slug?.[1] ?? "overview");
          setSort((query?.sort as string) ?? "hot");
        } else {
          setMode("USER");
          setUserMode(query?.slug?.[1] ?? "overview");
          setSort((query?.sort as string) ?? "hot");
        }
      } else if (query?.slug?.[1] === "search") {
        setSearchQuery(query?.q as string);
        setMode("FLAIR");
        setSort((query?.sort as string) ?? "new");
      } else if (router.pathname == "/r/[...slug]") {
        setMode("SUBREDDIT");
        setSort(query?.slug?.[1] ?? "hot");
      }
      //subreddit OR username..
      setSubreddits(query?.slug?.[0] ?? "");
      setRange((query?.t as string) ?? "");
    } else {
      //console.log(router);
      if (router.pathname == "/search") {
        setSearchQuery(query?.q as string);
        setMode("SEARCH");
      } else if (router.pathname === "/") {
        setMode("HOME");
      } else {
        setMode("NONE");
      }
      setSort((query?.frontsort as string) ?? query?.sort ?? "hot");
      setRange((query?.t as string) ?? "");
    }

    return () => {
      //
    };
  }, [router, sessloading]);

  //monitor keys to control query
  const [key, setKey] = useState<string | any[]>([""]);
  useEffect(() => {
    //console.log(mode, sort, range, sessloading, sessloading);
    //console.log(mode, searchQuery)
    if (
      !sessloading &&
      context.ready &&
      sort &&
      mode &&
      mode !== "NONE" &&
      (subreddits || mode === "HOME" || mode === "SEARCH") &&
      (searchQuery || (mode !== "FLAIR" && mode !== "SEARCH"))
    ) {
      //console.log("SAFESEARCH?", params?.safeSearch);
      //console.log("FILTERS??", filters);
      const {
        readFilter,
        imgFilter,
        vidFilter,
        selfFilter,
        galFilter,
        linkFilter,
        imgPortraitFilter,
        imgLandscapeFilter,
      } = filters;
      //force unique strings on filter change.. nested objects don't do the trick with masonic
      const filtersString = [
        readFilter,
        imgFilter,
        vidFilter,
        selfFilter,
        galFilter,
        linkFilter,
        imgPortraitFilter,
        imgLandscapeFilter,
        context.filtersApplied,
      ].join(",");

      if (mode === "MULTI") {
        setKey([
          "feed",
          mode,
          subreddits,
          userMode, //refers to multi name..
          sort,
          range,
          status,
          filtersString,
          filters,
        ]);
      } else if (mode === "USER") {
        setKey([
          "feed",
          mode,
          subreddits,
          userMode,
          sort,
          range,
          status,
          filtersString,
          filters,
        ]);
      } else if (mode === "SELF") {
        setKey([
          "feed",
          mode,
          subreddits, //this would be the username
          userMode,
          context.userPostType,
          sort,
          range,
          filtersString,
          filters,
        ]);
      } else if (mode === "SEARCH") {
        setKey([
          "feed",
          mode,
          searchQuery,
          params?.safeSearch,
          sort,
          range,
          status,
          filtersString,
          filters,
        ]);
      } else if (mode === "FLAIR") {
        setKey([
          "feed",
          mode,
          subreddits,
          searchQuery,
          sort,
          range,
          status,
          filtersString,
          filters,
        ]);
      } else if (mode === "HOME") {
        setKey(["feed", mode, "", sort, range, status, filtersString, filters]);
      } else {
        setKey([
          "feed",
          mode,
          subreddits,
          sort,
          range,
          status,
          filtersString,
          filters,
        ]);
      }
      setReady(true);
    }
    return () => {
      console.log("reset");
      setKey([""]);
      setReady(false);
    };
  }, [
    context.ready,
    //contextForceRefresh,
    mode,
    sort,
    range,
    subreddits,
    searchQuery,
    params?.safeSearch,
    userMode,
    sessloading,
    context.userPostType,
    filters,
  ]);

  interface FeedParams {
    loggedIn: boolean;
    after?: string;
    count?: number;
    mode: "HOME" | "SUBREDDIT" | "USER" | "SELF" | "SEARCH" | "FLAIR" | "MULTI";
    sort: string;
    range?: string;
    subreddits: string;
    userMode?: string;
    searchQuery?: string;
    safeSearch?: boolean;
    prevPosts?: object;
    filters: object;
  }

  // feedParams: FeedParams|any = {

  //   filters:  {
  //     readFilter,
  //     imgFilter,
  //     vidFilter,
  //     selfFilter,
  //     galFilter,
  //     linkFilter,
  //     imgPortraitFilter,
  //     imgLandscapeFilter,
  //   }
  //  }

  const formatInitialData = () => {
    const initialData = params?.initialPosts;
    //console.log("INITIALDATA?", initialData);
    if (initialData?.children?.length > 0) {
      return {
        pages: [
          {
            filtered: initialData.children,
            after: "",
            count: initialData.children.length,
            prevPosts: {
              ...initialData.children.reduce((obj, post, index) => {
                obj[post?.data?.name] = 1;
                return obj;
              }, {}),
            },
          },
        ],
        pageParams: [
          {
            after: "",
            count: 0,
            prevPosts: {
              ...initialData.children.reduce((obj, post, index) => {
                obj[post?.data?.name] = 1;
                return obj;
              }, {}),
            },
          },
        ],
      };
    }
  };

  const fetchFeed = async (fetchParams: QueryFunctionContext) => {
    const feedParams = {
      loggedIn: status === "authenticated" ? true : false,
      after: fetchParams.pageParam?.after ?? "",
      count: fetchParams.pageParam?.count ?? 0,
      mode: mode,
      sort: sort,
      range: range,
      subreddits: subreddits,
      userMode: userMode,
      searchQuery: searchQuery,
      safeSearch: params?.safeSearch ? undefined : true,
      prevPosts: fetchParams.pageParam?.prevPosts ?? {},
      filters: fetchParams?.queryKey?.[fetchParams?.queryKey?.length - 1],
    };
    //console.log("fetchParams?", fetchParams);
    //console.log("feedParms", feedParams);

    let data;
    if (feedParams.mode === "HOME") {
      data = await loadFront(
        feedParams.loggedIn,
        context.token,
        feedParams.sort,
        feedParams.range,
        feedParams.after,
        feedParams.count,
        context?.localSubs //home feed is invalidated on subs change
      );
    } else if (mode === "SUBREDDIT") {
      data = await loadSubreddits(
        feedParams.loggedIn,
        context.token,
        feedParams.subreddits,
        feedParams.sort,
        feedParams.range,
        feedParams.after,
        feedParams.count,
        true
      );
    } else if (mode === "FLAIR") {
      data = await getRedditSearch(
        { q: feedParams.searchQuery },
        feedParams.after,
        feedParams.sort,
        feedParams.loggedIn,
        feedParams.subreddits,
        feedParams.range,
        context.token,
        feedParams.safeSearch
      );
    } else if (mode === "SEARCH") {
      data = await getRedditSearch(
        { q: feedParams.searchQuery },
        feedParams.after,
        feedParams.sort,
        feedParams.loggedIn,
        undefined,
        feedParams.range,
        context.token,
        feedParams.safeSearch
      );
    } else if (mode === "MULTI") {
      data = await getUserMultiPosts(
        feedParams.subreddits,
        feedParams.userMode,
        feedParams.sort,
        feedParams.range,
        feedParams.after
      );
    } else if (mode === "SELF") {
      data = await loadUserSelf(
        context.token,
        feedParams.loggedIn,
        feedParams.userMode?.toLowerCase(),
        feedParams.sort,
        feedParams.range,
        feedParams.after,
        session?.user?.name,
        context.userPostType === "comments" ? "comments" : "links"
      );
    } else if (mode === "USER") {
      data = await loadUserPosts(
        feedParams.subreddits as string,
        feedParams.sort,
        feedParams.range as string,
        feedParams.after,
        feedParams.count,
        feedParams.userMode
      );
    }

    const manageData = async (
      data: any,
      filters,
      prevPosts,
      filterSubs: boolean
    ) => {
      data?.token && context.setToken(data?.token);

      const { filtered, filtercount } = await filterPosts(
        data?.children,
        filters,
        prevPosts,
        filterSubs,
        feedParams.mode === "USER" ? false : true
      );

      return {
        filtered,
        filtercount,
      };
    };

    const filterSubs =
      mode === "HOME" ||
      feedParams.subreddits
        ?.split(" ")
        ?.join("+")
        ?.split(",")
        ?.join("+")
        ?.split("%20")
        ?.join("+")
        ?.split("+")?.length > 1 ||
      feedParams.subreddits?.toUpperCase() == "ALL" ||
      feedParams.subreddits?.toUpperCase() == "POPULAR";

    const { filtered, filtercount } = await manageData(
      data,
      feedParams.filters,
      feedParams.prevPosts,
      filterSubs
    );

    let returnData = {
      filtered,
      after: data.after,
      count: feedParams.count + data?.children?.length,
      prevPosts: {
        ...feedParams.prevPosts,
        ...filtered.reduce((obj, post, index) => {
          obj[post?.data?.name] = 1;
          return obj;
        }, {}),
      },
    };

    //console.log("returnData?", returnData);

    return returnData;
  };

  const feed = useInfiniteQuery(key, fetchFeed, {
    enabled: ready && key?.[0] == "feed",
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    refetchInterval: sort === "new" ? 60 * 1000 : 30 * 60 * 1000,
    getNextPageParam: (lastPage) => {
      //console.log('lastPage?ß', lastPage)
      if (lastPage.after || lastPage.after === "") {
        return {
          after: lastPage?.after ?? "",
          count: lastPage?.count ?? 0,
          prevPosts: lastPage?.prevPosts ?? {},
        };
      }
      return undefined;
    },
    initialData: () => {
      return formatInitialData();
    },
  });

  return {
    key,
    feed,
  };
};

export default useFeed;
