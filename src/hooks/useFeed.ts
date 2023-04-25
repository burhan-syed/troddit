import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { QueryFunctionContext, useInfiniteQuery } from "@tanstack/react-query";
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
import useLocation from "./useLocation";

interface Params {
  initialPosts?: any;
}

const useFeed = (params?: Params) => {
  const { data: session, status } = useSession();
  const sessloading = status === "loading";
  const context: any = useMainContext();

  const { key, ready, mode, sort, range, subreddits, userMode, searchQuery, domain } =
    useLocation(params);

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
      safeSearch: context?.safeSearch ? undefined : true,
      prevPosts: fetchParams.pageParam?.prevPosts ?? {},
      filters: fetchParams?.queryKey?.[fetchParams?.queryKey?.length - 1],
    };
    //console.log("fetchParams?", fetchParams);
    //console.log("feedParms", feedParams);

    let data;
    //short circuiting with initialData here instead of using param in infinite query hook..
    if (
      params?.initialPosts?.children?.length > 0 &&
      fetchParams?.pageParam === undefined
    ) {
      data = params?.initialPosts;
      data["after"] = "";
    } else if (feedParams.mode === "HOME") {
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
        context.token,
        feedParams.loggedIn,
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
        feedParams.mode === "USER" ? false : true,
        domain
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
      count:
        fetchParams?.pageParam === undefined
          ? 0
          : feedParams.count + data?.children?.length,
      prevPosts: {
        ...feedParams.prevPosts,
        ...filtered.reduce((obj, post, index) => {
          obj[post?.data?.name] = 1;
          return obj;
        }, {}),
      },
      filterCount : filtercount
    };

    //console.log("returnData?", returnData);

    return returnData;
  };

  const feed = useInfiniteQuery(key, fetchFeed, {
    enabled: ready && key?.[0] == "feed" && !!domain,
    refetchOnWindowFocus: context?.refreshOnFocus ?? true ? true : false,
    refetchOnMount: false,
    staleTime: 0,
    cacheTime: Infinity,
    refetchInterval: context?.autoRefreshFeed
      ? (sort === "new" || sort === "rising")
        ? context?.fastRefreshInterval ?? 10 * 1000
        : context?.slowRefreshInterval ?? 30 * 60 * 1000
      : Infinity,
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
    // setting initial data directly in fetchFeed() instead
    // initialData: () => {
    //   return formatInitialData();
    // },
  });

  return {
    key,
    feed,
  };
};

export default useFeed;
