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
} from "masonic";
import {
  getUserMultiPosts,
  loadFront,
  loadSubFlairPosts,
  loadSubreddits,
  loadUserPosts,
} from "../RedditAPI";
import Post from "./Post";
// import * as gtag from "../../lib/gtag";
import { useMainContext } from "../MainContext";
import { CgEnter } from "react-icons/cg";
import { usePlausible } from "next-plausible";
import { findMediaInfo } from "../../lib/utils";
import { useRouter } from "next/router";

const randInt = (min = 200, max = 500) =>
  Math.floor(Math.random() * (max - min)) + min;
// const getFakeItems = (cur = 0) => {
//   const fakeItems = [];
//   for (let i = 5000 * cur; i < cur * 5000 + 5000; i++)
//     fakeItems.push({ id: i, height: randInt() });
//   return fakeItems;
// };

const getFakeItems = (start = 0, end = 32) => {
  const fakeItems = [];
  for (let i = start; i < end + 10; i++)
    fakeItems.push({ id: i, height: randInt() });
  return fakeItems;
};

const getFakeItemsPromise = (start, end) =>
  Promise.resolve(getFakeItems(start, end));

let allowload = false;
let lastload = "";
let loadonce = 0;
interface ColumnContext {
  columns: number;
  setColumns: Function;
}

const MyMasonic = ({
  query,
  initItems,
  initAfter,
  isUser = false,
  isMulti = false,
  isSubFlair = false,
  filterNum = 0,
  session = {},
  //page,
}) => {
  const router = useRouter();
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
  const [posts, setPosts] = useState([]);
  const [numposts, setNumPosts] = useState(0);
  const [after, setAfter] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(false);
  const [cols, setCols] = useState(3);
  const [items, setItems] = useState([]);
  const [end, setEnd] = useState(false);
  const [itemheightestimate, setItemHeightEstimate] = useState(600);
  const [sort, setSort] = useState("");
  const [range, setRange] = useState("");
  const plausible = usePlausible();
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
    if (query.frontsort) {
      setSort(query?.frontsort ?? "hot");
      setRange(query?.t ?? "");
    }
    if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "hot");
      setRange(query?.t ?? "");
    }
    lastload = initAfter;
    setFilterCount(filterNum);
    setAfter(initAfter);
    setNumPosts(initItems.length);
    context.setPosts(initItems);
    setItems(initItems);
    initItems.length < 1 && loadMoreItems(0, 10);

    setLoading(false);

    return () => {
      setError(false);
      setItems([]);
      setAfter("");
      setRange("");
      setSubreddits("");
      setLoading(true);
      setCount(0);
    };
    //handling these in the other useeffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initItems, initAfter]);

  useEffect(() => {
    if (query.frontsort) {
      setSort(query?.frontsort ?? "hot");
      setRange(query?.t ?? "");
    }
    if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "hot");
      setRange(query?.t ?? "");
    }
    return () => {
      ("");
    };
  }, [query]);

  const getPostsPromise = (start, end) => Promise.resolve(getPosts(start, end));

  const containerRef = React.useRef(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight,
  ]);
  const positioner = usePositioner(
    {
      width,
      columnGutter: 0,
      columnWidth: windowWidth / 3,
    },
    [items]
  );

  useEffect(() => {
    // const breakpointColumnsObj = {
    //   default: 4,
    //   2560: 3,
    //   1280: 2,
    //   767: 1,
    // };

    //console.log(windowWidth);
    //console.log(context.columns, context.columnOverride, context.cardStyle);

    if (context.cardStyle == "row1") {
      setItemHeightEstimate(80);
      setCols(1);
    } else if (context?.columnOverride ?? 0 !== 0) {
      setItemHeightEstimate(Math.floor(2000 / context.columnOverride));
      setCols(context.columnOverride);
      context.setColumns(context.columnOverride);
    } else {
      if (windowWidth > 2560) {
        setItemHeightEstimate(500);
        setCols(4);
        context.setColumns(4);
      } else if (windowWidth > 1280) {
        setItemHeightEstimate(600);
        setCols(3);
        context.setColumns(3);
      } else if (windowWidth > 767) {
        setItemHeightEstimate(900);
        setCols(2);
        context.setColumns(2);
      } else {
        setItemHeightEstimate(1200);
        setCols(1);
        context.setColumns(1);
      }
    }
    return () => {};
  }, [windowWidth, context]);

  // useEffect(() => {
  //   context.setColumnOverride(0);
  // }, [windowWidth])

  const maybeLoadMore = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      const nextItems = await getFakeItemsPromise(startIndex, stopIndex);
      setItems((current) => [...current, ...nextItems]);
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      minimumBatchSize: 10,
      threshold: 3,
    }
  );

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
      const nextItems = await getPostsPromise(startIndex, stopIndex);
      //console.log("nextitems", nextItems, after);
      setLoadingMore(false);
      setItems((current) => {
        //console.log("after", after);
        context.setPosts([...current, ...nextItems]);
        return [...current, ...nextItems];
      });
    }
  };

  const maybeLoadMorePosts = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      return await loadMoreItems(startIndex, stopIndex);
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

  const scrollToIndex = useScrollToIndex(positioner, {
    align: "center",
    offset: offset,
    height: windowHeight,
    element: containerRef,
  });

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
    //console.log("loadmore after:", loadafter);
    let data: any = { after: "", children: [], token: null };
    if (
      router?.route === "/" ||
      router?.asPath === "/best" ||
      router?.asPath === "/top" ||
      router?.asPath === "/hot" ||
      router?.asPath === "/new" ||
      router?.asPath === "/rising"
    ) {
      data = await loadFront(
        session ? true : false,
        context?.token,
        query?.frontsort ?? "best",
        query?.t ?? "",
        loadafter,
        undefined,
        context?.localSubs
        //items.length
      );
    } else if (isUser || router?.pathname === "/u/[...slug]") {
      if (isMulti) {
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
          query?.slug?.[1] ?? "hot",
          query?.t ?? "",
          loadafter
        );
      }
    } else if (isSubFlair) {
      data = await loadSubFlairPosts(
        query.slug[0],
        query?.q,
        query?.sort,
        query?.t,
        loadafter
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
        loadafter
        //numposts //posts.length
      );
    }
    // gtag.event({
    //   action: "infinite-scroll",
    //   category: "main-feed",
    //   label: `${subreddits ? subreddits : "home"}`,
    //   value: count,
    // });

    if (data?.after) {
      //console.log("new", data?.after, "used: ", loadafter);
      if (true) {
        //after === prevAfter.current
        prevAfters.current[loadafter] = 1;
        plausible("infinitescroll");
        data?.token && context.setToken(data?.token);
        setCount((c) => c + 1);
        currAfter.current = data?.after;
        setAfter(data?.after);
        if (
          !imgFilter ||
          !vidFilter ||
          !selfFilter ||
          !galFilter ||
          !linkFilter
        ) {
          data.children = await filterChildren(data.children);
        }
        return { data: { posts: data?.children, after: data?.after } };
      } else {
        //console.log("reject");
        return { data: { posts: [], after: "NONE" } };
      }
    } else {
      setError(true);
      return { data: { posts: [], after: "" } };
    }

    //setPosts((prevposts) => [...prevposts, ...data.children]);
  };
  const getPosts = async (start = 0, end = 24) => {
    //console.log("getpost call");

    allowload = false;
    let caughtup = false;
    let n = numposts;
    let payload = [];

    //let fastafter = after;
    while (payload.length < end - start && !caughtup) {
      //console.log("loop", after);
      //let data = await (await loadmore(after)).data;
      let data = await (await loadmore(currAfter.current)).data;
      if (data?.after === "NONE") {
        //ignore
      } else {
        if (!data.after || data.after == "") {
          setEnd(true);
          caughtup = true;
          allowload = false;
          //console.log("early return");
          return payload;
        }
        //fastafter = data?.after;
        //lastload = fastafter;
        //console.log(data.posts);
        payload = [...payload, ...data.posts];
      }
    }
    setNumPosts((n) => n + payload.length);
    allowload = true;
    block.current = false;
    return payload;
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
      if (!imgPortraitFilter || !imgLandscapeFilter) quick = false;
      let mediaInfo = await findMediaInfo(d, quick);
      //orientation check
      if (!imgPortraitFilter || !imgLandscapeFilter) {
        //only check on videos or images (galleries a subset of images)
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
        if (!(selfFilter && mediaInfo.isSelf)) {
          setFilterCount((n) => n + 1);
          return false;
        }
      } else if (!imgFilter && mediaInfo.isImage) {
        if (!(selfFilter && mediaInfo.isSelf)) {
          setFilterCount((n) => n + 1);
          return false;
        }
      } else if (!linkFilter && mediaInfo.isLink) {
        setFilterCount((n) => n + 1);
        return false;
      } else if (!selfFilter && mediaInfo.isSelf) {
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

  const getFakePosts = async (start = 0, end = 32) => {
    const fakeItems = [];
    for (let i = start; i < end + 10; i++)
      fakeItems.push({ id: i, height: randInt() });
    //return fakeItems;
    setItems(fakeItems);
  };

  // useEffect(() => {
  //   const i = fetchFront();
  //   //setItems(i);
  //   //const items = getFakeItems();
  //   //setItems(items);
  // }, []);

  return (
    <div>
      {!loading && (
        <>
          <Masonry
            onRender={maybeLoadMorePosts}
            //positioner={positioner}
            // The distance in px between the top of the document and the top of the
            // masonry grid container
            //offset={offset}
            // The height of the virtualization window
            //height={windowHeight}
            // Forwards the ref to the masonry container element
            //key={page}
            columnGutter={0} //cols == 1 ? 5 : cols < 4 ? 10 : 5}
            //columnWidth={(windowWidth*5/6 - 8*2) / 3}
            columnCount={cols}
            items={items}
            itemHeightEstimate={0} //itemheightestimate was making scrollbar jumpy
            overscanBy={2}
            render={PostCard}
            className=""
            ssrWidth={500}
          />
          {!end && loadingMore && (
            <h1 className="text-center">Loading page {count + 1}...</h1>
          )}
          {filterCount > 0 && (
            <div className="fixed bottom-0 left-0 flex-col text-xs select-none">
              <h1>{count + 1} pages</h1>
              <h1>{filterCount} filtered</h1>
            </div>
          )}
        </>
      )}

      {end && (
        <div className="flex flex-row items-center justify-center text-lg font-bold">
          <h1>
            Loaded {numposts} post{numposts > 1 ? "s" : ""} on {count + 1} page
            {count + 1 > 1 ? "s" : ""}.{" "}
          </h1>
        </div>
      )}
      {/* {error && (
        <div className="flex flex-col items-center justify-center text-center ">
        
        <div>
          {"Expect more? Please refresh and assure you're not blocking content from Reddit."}
        </div>
      </div>
      )} */}
    </div>
  );
};

const PostCard = (props) => {
  //console.log("fakecard");
  const context: any = useMainContext();
  return (
    <div className={""}>
      {/* <span children={`${props.data.id} : ${props.data?.data?.title}`} /> */}
      {/* <p>{props.data.id}</p> */}
      <Post post={props.data.data} postNum={props.index} />
    </div>
  );
};

export default MyMasonic;
