import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { useMainContext } from '../MainContext';

const useLocation = (params?) => {
  const [ready, setReady] = useState(false);
  const [domain, setDomain] = useState<string>(); 
  const { data: session, status } = useSession();
  const sessloading = status === "loading";
  const router = useRouter();
  const context: any = useMainContext();
  const {
    seenFilter,
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
    seenFilter: true,
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
   const domain = window?.location?.hostname ?? 'www.troddit.com'
   setDomain(domain); 
  }, [])
  

  useEffect(() => {
    if (context.ready && context.filtersApplied > 0) {
      setFilters({
        seenFilter,
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
        seenFilter : true,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
      setSubreddits(query?.slug?.[0]?.split(" ")?.join("+") ?? "");
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, sessloading]);

  //monitor keys to control query
  const [key, setKey] = useState<any[]>([""]);
  useEffect(() => {
    if (
      !sessloading &&
      context.ready &&
      sort && sort !== "wiki" &&
      mode &&
      mode !== "NONE" &&
      (subreddits || mode === "HOME" || mode === "SEARCH") &&
      (searchQuery || (mode !== "FLAIR" && mode !== "SEARCH"))
    ) {
      //console.log("SAFESEARCH?", params?.safeSearch);
      //console.log("FILTERS??", filters);
      const {
        seenFilter,
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
        seenFilter,
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

      const sessStatus = status === "authenticated" ? session.user?.name : status

      if (mode === "MULTI") {
        setKey([
          "feed",
          mode,
          subreddits,
          userMode, //refers to multi name..
          sort,
          range,
          sessStatus,
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
          sessStatus,
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
          context?.safeSearch,
          sort,
          range,
          sessStatus,
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
          sessStatus,
          filtersString,
          filters,
        ]);
      } else if (mode === "HOME") {
        setKey(["feed", mode, "", sort, range, sessStatus, filtersString, filters]);
      } else {
        setKey([
          "feed",
          mode,
          subreddits,
          sort,
          range,
          sessStatus,
          filtersString,
          filters,
        ]);
      }
      setReady(true);
    }
    return () => {
      setKey([""]);
      setReady(false);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    context.ready,
    mode,
    sort,
    range,
    subreddits,
    searchQuery,
    context?.safeSearch,
    userMode,
    sessloading,
    context.userPostType,
    filters,
  ]);

  return{
    key,
    ready,
    mode,
    sort,
    range,
    subreddits,
    userMode,
    searchQuery,
    domain
  }
}

export default useLocation