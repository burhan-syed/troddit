import { useSession } from "next-auth/react";
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
import { useTAuth } from "../PremiumAuthContext";
import { toast } from "react-hot-toast";

interface Params {
  initialPosts?: any;
}

const useFeed = (params?: Params) => {
  const { data: session, status } = useSession();
  const { isLoaded, premium } = useTAuth();
  const sessloading = status === "loading";
  const context: any = useMainContext();

  const {
    key,
    ready,
    mode,
    sort,
    range,
    subreddits,
    userMode,
    searchQuery,
    domain,
  } = useLocation(params);

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
    try {
      if (
        params?.initialPosts?.children?.length > 0 &&
        fetchParams?.pageParam === undefined
      ) {
        data = params?.initialPosts;
        data["after"] = "";
      } else if (feedParams.mode === "HOME") {
        data = await loadFront({
          after: feedParams.after,
          range: feedParams.range,
          count: feedParams.count,
          sort: feedParams.sort,
          localSubs: context?.localSubs, //home feed is invalidated on subs change
          token: context?.token,
          loggedIn: feedParams.loggedIn,
          isPremium: premium?.isPremium,
        });
      } else if (mode === "SUBREDDIT") {
        data = await loadSubreddits({
          after: feedParams.after,
          range: feedParams.range,
          count: feedParams.count,
          sort: feedParams.sort,
          subreddits: feedParams.subreddits,
          token: context?.token,
          loggedIn: feedParams.loggedIn,
          sr_detail: true,
          isPremium: premium?.isPremium,
        });
      } else if (mode === "FLAIR") {
        data = await getRedditSearch({
          after: feedParams.after,
          range: feedParams.range,
          count: feedParams.count,
          sort: feedParams.sort,
          params: { q: feedParams.searchQuery },
          include_over_18: feedParams.safeSearch,
          subreddit: feedParams.subreddits,
          token: context?.token,
          loggedIn: feedParams.loggedIn,
          isPremium: premium?.isPremium,
        });
      } else if (mode === "SEARCH") {
        data = await getRedditSearch({
          after: feedParams.after,
          range: feedParams.range,
          count: feedParams.count,
          sort: feedParams.sort,
          params: { q: feedParams.searchQuery },
          include_over_18: feedParams.safeSearch,
          subreddit: undefined,
          token: context?.token,
          loggedIn: feedParams.loggedIn,
          isPremium: premium?.isPremium,
        });
      } else if (mode === "MULTI") {
        data = await getUserMultiPosts({
          after: feedParams.after,
          range: feedParams.range,
          sort: feedParams.sort,
          multiname: feedParams.userMode,
          user: feedParams.subreddits,
          isPremium: premium?.isPremium,
        });
      } else if (mode === "SELF") {
        data = await loadUserSelf({
          after: feedParams.after,
          range: feedParams.range,
          count: feedParams.count,
          sort: feedParams.sort,
          username: session?.user?.name ?? "",
          type: context.userPostType === "comments" ? "comments" : "links",
          where: feedParams.userMode?.toLowerCase(),
          token: context?.token,
          loggedIn: feedParams.loggedIn,
          isPremium: premium?.isPremium,
        });
      } else if (mode === "USER") {
        data = await loadUserPosts({
          after: feedParams.after,
          range: feedParams.range,
          count: feedParams.count,
          sort: feedParams.sort,
          username: feedParams.subreddits as string,
          type: feedParams.userMode,
          isPremium: premium?.isPremium,
        });
      }
      
    } catch (error) {
      if (error?.message === "PREMIUM REQUIRED") {
        context.setPremiumModal(true);
        return {
          filtered: [],
          after: null,
          count: feedParams.count,
          prevPosts: feedParams.prevPosts,
          filterCount: 0,
        };
      } else if (error?.["response"]?.["status"] === 429 || true) {
        //rate limited
        const timeout = parseInt(
          error?.["response"]?.["headers"]?.["x-ratelimit-reset"] ?? "300"
        );
        context.setRateLimitModal({
          show: true, 
          timeout,
          start: new Date()
        });
        await new Promise((resolve) =>
          setTimeout(() => resolve("foo"), timeout * 1000)
        );
        return {
          filtered: [],
          after: feedParams.after,
          count: feedParams.count,
          prevPosts: feedParams.prevPosts,
          filterCount: 0,
        };
      }
      throw error;
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
      filterCount: filtercount,
    };

    //console.log("returnData?", returnData);

    return returnData;
  };

  const feed = useInfiniteQuery(key, fetchFeed, {
    enabled: isLoaded && ready && key?.[0] == "feed" && !!domain,
    refetchOnWindowFocus:
      (premium?.isPremium && context?.refreshOnFocus) ?? true ? true : false,
    refetchOnMount: false,
    staleTime: 0,
    cacheTime: Infinity,
    refetchInterval: premium?.isPremium
      ? Infinity
      : context?.autoRefreshFeed
      ? sort === "new" || sort === "rising"
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
