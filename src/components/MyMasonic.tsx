/* eslint-disable react/no-children-prop */
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import ReactDOM from "react-dom";
import useWindowScroll from "@react-hook/window-scroll";
import { useWindowSize } from "@react-hook/window-size";
import {
  MasonryScroller,
  Masonry,
  useContainerPosition,
  usePositioner,
  useScroller,
  useScrollToIndex,
  useInfiniteLoader,
  List,
} from "masonic";
import {
  getRedditSearch,
  getUserMultiPosts,
  loadFront,
  loadSubFlairPosts,
  loadSubreddits,
  loadUserPosts,
  loadUserSelf,
} from "../RedditAPI";
import Post from "./Post";
// import * as gtag from "../../lib/gtag";
import { useMainContext } from "../MainContext";
import { CgEnter } from "react-icons/cg";
// import { usePlausible } from "next-plausible";
import { filterPosts, findMediaInfo } from "../../lib/utils";
import { useRouter } from "next/router";

let allowload = false;
let lastload = "";
let loadonce = 0;

const MyMasonic = ({
  query,
  initItems,
  initAfter,
  filterSubs,
  postCount,
  postNames,
  isUser = false,
  isMulti = false,
  isSubFlair = false,
  isSearch = false,
  filterNum = 0,
  safeSearch = false,
  userPostMode = "",
  isSelf = false,
  session,
  //page,
}) => {
  const router = useRouter();
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
  } = context;
  const [filterCount, setFilterCount] = useState(0);
  const [posts, setPosts] = useState([]);
  const [numposts, setNumPosts] = useState(0); //number of posts displayed
  const [postnames, setPostNames] = useState(postNames);
  const [after, setAfter] = useState("");
  const [pageCount, setPageCount] = useState(1);
  const [count, setCount] = useState(postCount); //all posts from reddit
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [cols, setCols] = useState(3);
  const [items, setItems] = useState([]);
  const [end, setEnd] = useState(false);
  const [itemheightestimate, setItemHeightEstimate] = useState(600);

  // const plausible = usePlausible();
  const prevAfter = useRef(null);
  const prevAfters = useRef({});
  const currAfter = useRef(null);
  const block = useRef(null);

  useEffect(() => {
    //console.log(router);
    prevAfter.current = ""; //initAfter;
    currAfter.current = initAfter;
    block.current = false;
    allowload = true;
    loadonce = 0;
    lastload = initAfter;
    setFilterCount(filterNum);
    setAfter(initAfter);
    setNumPosts(initItems.length);
    context.setPosts(initItems);
    context.setGAfter(initAfter);
    setItems(initItems);
    initItems.length < 1 && loadMoreItems(0, 10);

    setLoading(false);

    return () => {
      setError(false);
      setItems([]);
      setAfter("");
      setLoading(true);
      setPageCount(1);
    };
    //handling these in the other useeffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initItems, initAfter]);

  const getPostsPromise = (start, end) => Promise.resolve(getPosts(start, end));

  const containerRef = React.useRef(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight,
  ]);

  useEffect(() => {
    if (context.cardStyle == "row1") {
      setItemHeightEstimate(80);
      setCols(1);
    } else if (context?.columnOverride !== 0) {
      if (context?.columnOverride === 1) {
        setItemHeightEstimate(Math.floor(windowHeight * 0.8));
      } else {
        setItemHeightEstimate(Math.floor(2000 / context.columnOverride));
      }
      setCols(context.columnOverride);
      //context.setColumns(context.columnOverride);
    } else if (!context.postOpen) {
      //prevent layout shift when resize with post open
      if (windowWidth > 2560) {
        setItemHeightEstimate(500);
        setCols(4);
        //context.setColumns(4);
      } else if (windowWidth > 1280) {
        setItemHeightEstimate(600);
        setCols(3);
        //context.setColumns(3);
      } else if (windowWidth > 767) {
        setItemHeightEstimate(900);
        setCols(2);
        //context.setColumns(2);
      } else {
        setItemHeightEstimate(1200);
        setCols(1);
        //context.setColumns(1);
      }
    }
    return () => {};
  }, [
    windowWidth,
    context.columnOverride,
    context.cardStyle,
    windowHeight,
    context.postOpen,
  ]);

  useEffect(() => {
    context.setColumns(cols);
  }, [cols]);

  const loadMoreItems = async (startIndex, stopIndex) => {
    //console.log("try..", block.current, currAfter.current);
    if (
      allowload &&
      !error &&
      !block.current &&
      prevAfters.current[currAfter.current] !== 1
    ) {
      //preventing more calls prior to new page fetch
      prevAfters.current[currAfter.current] = 1;
      block.current = true;

      lastload = "";
      setLoadingMore(true);
      const { payload, lastafter } = await getPostsPromise(
        startIndex,
        stopIndex
      );
      //console.log("nextitems", nextItems, after);
      setLoadingMore(false);
      setItems((current) => {
        //console.log("after", after);
        context.setPosts([...current, ...payload]);
        context.setGAfter(lastafter);
        return [...current, ...payload];
      });
    }
  };
  const maybeLoadMorePosts = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      if (context?.infiniteLoading) {
        return await loadMoreItems(startIndex, stopIndex);
      }
    },
    {
      isItemLoaded: (index, items) => {
        //console.log("isitemloaded",index,items, !!items[index]);
        return !!items[index];
      },
      minimumBatchSize: 10,
      threshold: 10,
    }
  );

  //load posts for slideshow functionality
  useEffect(() => {
    let n = items.length - context.postNum;
    if (n > 0 && n < 10) {
      maybeLoadMorePosts(posts.length, posts.length + 10, posts);
    }
    return () => {
      //
    };
  }, [context.postNum]);

  const loadmore = async (loadafter = after) => {
    let data: any = { after: "", children: [], token: null };
    if (
      router?.route === "/" ||
      router?.query?.frontsort === "best" ||
      router?.query?.frontsort === "top" ||
      router?.query?.frontsort === "hot" ||
      router?.query?.frontsort === "new" ||
      router?.query?.frontsort === "rising"
    ) {
      data = await loadFront(
        session ? true : false,
        context?.token,
        query?.frontsort ?? "best",
        query?.t ?? "",
        loadafter,
        count,
        context?.localSubs
      );
    } else if (isSearch || router?.pathname === "/search") {
      data = await getRedditSearch(
        query,
        loadafter,
        query?.sort,
        session ? true : false,
        query?.slug?.[0] ?? undefined,
        query?.t,
        context?.token,
        safeSearch ? undefined : true
      );
    } else if (isUser || router?.pathname === "/u/[...slug]") {
      if (userPostMode !== "" && isSelf) {
        data = await loadUserSelf(
          context?.token,
          session ? true : false,
          userPostMode.toLocaleLowerCase(),
          query?.sort,
          query?.t,
          loadafter,
          session?.user?.name,
          context.userPostType === "comments" ? "comments" : "links"
        );
        //console.log(data);
      } else if (isMulti) {
        data = await getUserMultiPosts(
          query?.slug?.[0],
          query?.slug?.[2],
          query?.slug?.[3],
          query?.t,
          loadafter
        );
      } else {
        data = await loadUserPosts(
          query?.slug?.[0] ?? "",
          query?.sort ?? "hot",
          query?.t ?? "",
          loadafter,
          count,
          userPostMode
        );
      }
    } else if (isSubFlair) {
      data = await getRedditSearch(
        query,
        loadafter,
        query?.sort,
        session ? true : false,
        query.slug[0],
        query?.t,
        context?.token,
        true
      );
    } else {
      let subs = query?.slug?.[0]
        .split(" ")
        .join("+")
        .split(",")
        .join("+")
        .split("%20")
        .join("+");

      data = await loadSubreddits(
        session ? true : false,
        context?.token,
        subs ?? "",
        query?.slug?.[1] ?? "hot",
        query?.t ?? "",
        loadafter,
        count
      );
    }
    data?.token && context.setToken(data?.token);
    if (data?.children) {
      prevAfters.current[loadafter] = 1;
      setCount((c) => c + data?.children?.length);
      setPageCount((c) => c + 1);

      currAfter.current = data?.after;
      setAfter(data?.after);
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
        postnames,
        filterSubs,
        isUser ? false : true
      );
      setPostNames((prev) => ({
        ...prev,
        ...filtered.reduce((obj, post, index) => {
          obj[post?.data?.name] = 1;
          return obj;
        }, {}),
      }));
      setFilterCount((n) => n + filtercount);
      return { data: { posts: filtered, after: data?.after } };
    } else {
      setError(true);
      return { data: { posts: [], after: "" } };
    }

    //setPosts((prevposts) => [...prevposts, ...data.children]);
  };
  const getPosts = async (start = 0, end = 24) => {
    allowload = false;
    let caughtup = false;
    let n = numposts;
    let payload = [];
    let lastafter = "";
    while (payload.length < end - start && !caughtup) {
      let data = await (await loadmore(currAfter.current)).data;
      if (data?.after === "NONE") {
        //ignore
      } else {
        if (!data.after || data.after == "") {
          setEnd(true);
          caughtup = true;
          allowload = false;
          lastafter = data.after;
          if (data?.posts) {
            payload = [...payload, ...data.posts];
          }
          setNumPosts((n) => n + payload.length);
          return { payload, lastafter };
        }
        lastafter = data.after;
        payload = [...payload, ...data.posts];
      }
    }
    setNumPosts((n) => n + payload.length);
    allowload = true;
    block.current = false;
    return { payload, lastafter };
  };

  const loadInfo = (
    <>
      {end && (
        <div className="flex flex-row items-center justify-center my-6 text-sm font-light">
          <h1>
            Loaded {numposts} post{numposts === 1 ? "" : "s"} on {pageCount}{" "}
            page
            {pageCount === 1 ? "" : "s"}.{" "}
          </h1>
        </div>
      )}
    </>
  );

  return (
    <div>
      {!loading && (
        <>
          <Masonry
            onRender={maybeLoadMorePosts}
            columnGutter={0}
            columnCount={cols}
            items={items}
            itemHeightEstimate={
              context.cardStyle === "row1" ? 0 : itemheightestimate
            } //itemheightestimate makes scrollbar jumpy but setting to 0 will result in empty columns
            overscanBy={2}
            render={PostCard}
            className="outline-none"
            ssrWidth={500}
          />
          {!context?.infiniteLoading && !end && (
            <div className="flex items-center justify-center mt-6 mb-6">
              <button
                disabled={loadingMore}
                onClick={() => {
                  loadMoreItems(items.length, items.length + 20);
                }}
                className={
                  (loadingMore
                    ? " animate-pulse "
                    : " cursor-pointer hover:bg-th-postHover hover:border-th-borderHighlight shadow-2xl  ") +
                  "flex items-center justify-center px-4 py-2 border rounded-md  h-9 border-th-border bg-th-post "
                }
              >
                <h1>Load Page {pageCount + 1}</h1>
              </button>
            </div>
          )}
          {!end && loadingMore && context?.infiniteLoading && (
            <h1 className="text-center">Loading page {pageCount + 1}...</h1>
          )}
          {filterCount > 0 && (
            <div className="fixed bottom-0 left-0 flex-col text-xs select-none">
              <h1>
                {pageCount} page{pageCount === 1 ? "" : "s"}
              </h1>
              <h1>{filterCount} filtered</h1>
            </div>
          )}
        </>
      )}

      {loadInfo}
    </div>
  );
};

const PostCard = (props) => {
  return (
    <div className={""}>
      <Post post={props.data} postNum={props.index} />
    </div>
  );
};

export default MyMasonic;
