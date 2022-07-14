/* eslint-disable react/no-children-prop */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Masonry, useInfiniteLoader } from "masonic";

import Post from "./Post";
import { useMainContext } from "../MainContext";
// import { usePlausible } from "next-plausible";
import { UseInfiniteQueryResult } from "react-query";

import toast, { ToastIcon } from "react-hot-toast";
import ToastCustom from "./toast/ToastCustom";
import useRefresh from "../hooks/useRefresh";
import useFeedGallery from "../hooks/useFeedGallery";
import { InView } from "react-intersection-observer";

interface MyMasonicProps {
  initItems: any[];
  curKey: any;
  feed: UseInfiniteQueryResult<
    {
      filtered: any;
      after: any;
      count: any;
      prevPosts: any;
    },
    unknown
  >;
}

const MyMasonic = ({ initItems, feed, curKey }: MyMasonicProps) => {
  const context: any = useMainContext();
  const { setFeedData } = useFeedGallery();

  const [cols, setCols] = useState(3);
  const [items, setItems] = useState<any[]>([]);
  const [itemheightestimate, setItemHeightEstimate] = useState(600);
  const [masonicKey, setMasonicKey] = useState(curKey);
  const [windowWidth, windowHeight] = useWindowSize();

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

  const [domain, setDomain] = useState("www.troddit.com");
  useEffect(() => {
    setDomain(window?.location?.hostname ?? "www.troddit.com");
  }, []);

  useEffect(() => {
    context.setColumns(cols);
  }, [cols]);

  const [newPosts, setNewPosts] = useState<any[]>([]);
  const [newPostsCount, setNewPostsCount] = useState(0);

  useEffect(() => {
    const tryUpdatePostsInPlace = (newPosts) => {
      setItems((pposts) => {
        let newPostCount = 0;
        let pPostMap = new Map();
        pposts.forEach((p) => pPostMap.set(p?.data?.name, p));
        newPosts.forEach((np) => {
          let prevPost = pPostMap.get(np?.data?.name);
          if (prevPost?.data?.name) {
            pPostMap.set(prevPost?.data?.name, np);
          } else {
            newPostCount += 1;
          }
        });
        setNewPostsCount(newPostCount);
        setNewPosts(() => (newPostCount > 0 ? newPosts : []));
        return Array.from(pPostMap.values());
      });
    };

    const posts = feed?.data?.pages
      ?.map((page) => page.filtered)
      ?.flat() as any[];
    if (posts?.length > 0) {
      //console.log("infinitequery?", posts);
      if (posts?.length > items?.length) {
        setItems(posts);
      } else {
        tryUpdatePostsInPlace(posts);
      }
    } else if (feed.hasNextPage) {
      //console.log("nodata.. fetching more");
      feed.fetchNextPage();
    }
  }, [feed?.data?.pages]);

  const overwritePosts = () => {
    setMasonicKey((k) => `${k}_${Math.random()}`);
    setNewPostsCount(0);
    setItems(newPosts);
  };
  useEffect(() => {
    if (newPostsCount > 0) {
      toast.remove("new_post");
      if (!context.askToUpdateFeed) {
        overwritePosts();
      } else {
        let tId = toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`${newPostsCount} new post${
                newPostsCount === 1 ? "" : "s"
              }`}
              mode={"new_posts"}
              action={overwritePosts}
              actionLabel={`Update feed?`}
            />
          ),
          { position: "bottom-right", duration: Infinity, id: "new_post" }
        );
      }
    }
    () => {
      toast.remove("new_post");
    };
  }, [newPostsCount]);
  useEffect(() => {
    return () => {
      toast.remove("new_post");
    };
  }, []);
  useEffect(() => {
    if (items) {
      setFeedData(items);
    }
    return () => {
      setFeedData([]);
    };
  }, [items]);

  const loadMoreItems = async (startIndex, stopIndex) => {
    feed?.fetchNextPage();
  };
  const maybeLoadMorePosts = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      if (
        (context?.infiniteLoading ||
          (initItems?.length < 1 && currentItems.length < 1)) &&
        !feed.isFetching &&
        !feed.isLoading &&
        feed.hasNextPage
      ) {
        return await loadMoreItems(startIndex, stopIndex);
      }
    },
    {
      isItemLoaded: (index, items) => {
        //console.log("isitemloaded",index,items, !!items[index]);
        return !!items?.[index];
      },
      minimumBatchSize: 10,
      threshold: 10,
    }
  );

  const loadInfo = (
    <>
      {!feed.isFetching && !feed.hasNextPage && feed.isFetched && !feed.error && (
        <div className="flex flex-row items-center justify-center my-6 text-sm font-light">
          <h1>
            Loaded {items?.length} post{items?.length === 1 ? "" : "s"} on{" "}
            {feed.data?.pages?.length} page
            {feed.data?.pages?.length === 1 ? "" : "s"}.{" "}
          </h1>
        </div>
      )}
    </>
  );

  const [heightMap, setHeightMap] = useState(new Map());
  const [seenMap, setSeenMap] = useState(new Map());
  // const intersectRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    setHeightMap(new Map());
    setSeenMap(new Map());
  }, [cols, windowWidth, context.cardStyle, context.mediaOnly, context.wideUI]);

  const margin = useMemo(
    () =>
      context.cardStyle === "row1"
        ? "m-0"
        : cols === 1
        ? "m-1"
        : cols > 1 && windowWidth < 640 //sm
        ? "m-0"
        : cols > 3 && windowWidth < 1280 //xl
        ? "m-0.5"
        : cols > 3 && windowWidth > 1280 //xl
        ? "m-1"
        : "m-1",
    [cols, context.cardStyle, windowWidth]
  );

  const handleIntersectChange = (
    inView: boolean,
    entry: IntersectionObserverEntry,
    post
  ) => {
    if (
      entry.intersectionRect?.x === 0 &&
      !inView &&
      entry.boundingClientRect.top < 0 &&
      Math.abs(entry?.boundingClientRect?.bottom) < (windowHeight * 1) / 2
    ) {
      console.log(
        post?.data?.title,
        heightMap.get(post?.data?.name)?.height?.toFixed()
      );
      seenMap.set(post?.data?.name, { seen: true });
    }
  };

  const handleSizeChange = (postName, height) => {
    if (
      height > (heightMap.get(postName)?.height ?? 0) &&
      context.cardStyle !== "row1" //don't set row heights, they're dynamic
    ) {
      heightMap.set(postName, { height: height });
    }
  };

  const PostCard = useCallback(
    (props) => {
      const post = props?.data;
      const seen = seenMap.get(props?.data?.data?.name)?.seen === true;
      const knownHeight = heightMap.get(props?.data?.data?.name)?.height;

      return (
        <InView
          threshold={0}
          onChange={(inView, entry) =>
            handleIntersectChange(inView, entry, post)
          }
        >
          {({ inView, ref, entry }) => (
            <div
              ref={ref}
              className={
                margin +
                (knownHeight && seen
                  ? " hover:z-50 overflow-hidden hover:overflow-visible"
                  : "")
                  + " outline "
              }
              style={
                knownHeight > 0 && seen
                  ? {
                      height: `${
                        heightMap.get(props?.data?.data?.name)?.height
                      }px`,
                      outlineWidth: "2px",
                      outlineColor: "green",
                    }
                  : seen === true
                  ? { outlineWidth: "2px", outlineColor: "red" }
                  : knownHeight > 0
                  ? { outlineWidth: "2px", outlineColor: "blue" }
                  : { outlineWidth: "2px", outlineColor: "white" }
              }
            >
              <Post
                post={props.data}
                postNum={props.index}
                fetchNextPage={feed.fetchNextPage}
                curKey={curKey}
                handleSizeChange={handleSizeChange}
              />
            </div>
          )}
        </InView>
      );
    },

    [heightMap, cols]
  );

  return (
    <div>
      <Masonry
        key={masonicKey}
        onRender={maybeLoadMorePosts}
        columnGutter={0}
        columnCount={cols}
        items={items}
        itemHeightEstimate={
          cols === 1
            ? context.cardStyle === "row1"
              ? 96
              : 0
            : itemheightestimate
        } //itemheightestimate makes scrollbar jumpy but setting to 0 will result in empty columns
        overscanBy={2}
        render={PostCard}
        className="outline-none"
        ssrWidth={500}
      />

      {!context?.infiniteLoading && feed.hasNextPage && (
        <div className="flex items-center justify-center mt-6 mb-6">
          <button
            disabled={feed.isLoading || feed.isFetchingNextPage}
            onClick={() => {
              loadMoreItems(items.length, items.length + 20);
            }}
            className={
              (feed.isLoading || feed.isFetchingNextPage
                ? " animate-pulse "
                : " cursor-pointer hover:bg-th-postHover hover:border-th-borderHighlight shadow-2xl  ") +
              "flex items-center justify-center px-4 py-2 border rounded-md  h-9 border-th-border bg-th-post "
            }
          >
            <h1>Load Page {(feed?.data?.pages?.length ?? 1) + 1}</h1>
          </button>
        </div>
      )}
      {feed.hasNextPage && feed.isFetching && context?.infiniteLoading && (
        <h1 className="text-center">
          Loading page {(feed?.data?.pages?.length ?? 1) + 1}...
        </h1>
      )}

      {loadInfo}
    </div>
  );
};

export default MyMasonic;
