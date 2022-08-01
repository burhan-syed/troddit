/* eslint-disable react/no-children-prop */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Masonry, useInfiniteLoader } from "masonic";

import Post from "./Post";
import { localSeen, useMainContext } from "../MainContext";
// import { usePlausible } from "next-plausible";
import { UseInfiniteQueryResult } from "react-query";

import toast, { ToastIcon } from "react-hot-toast";
import ToastCustom from "./toast/ToastCustom";
import useRefresh from "../hooks/useRefresh";
import useFeedGallery from "../hooks/useFeedGallery";
import { InView } from "react-intersection-observer";
import useHeightMap from "../hooks/useHeightMap";
import { findGreatestsImages } from "../../lib/utils";

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
  const [masonicKey, setMasonicKey] = useState(curKey);
  const [windowWidth, windowHeight] = useWindowSize();

  useEffect(() => {
    if (context.cardStyle == "row1") {
      setCols(1);
    } else if (context?.columnOverride !== 0) {
      setCols(context.columnOverride);
    } else if (!context.postOpen) {
      //prevent layout shift when resize with post open
      if (windowWidth > 2560) {
        setCols(4);
      } else if (windowWidth > 1280) {
        setCols(3);
      } else if (windowWidth > 767) {
        setCols(2);
      } else {
        setCols(1);
      }
    }
    return () => {};
  }, [windowWidth, context.columnOverride, context.cardStyle]);

  useEffect(() => {
    context.setColumns(cols);
  }, [cols]);

  const [items, setItems] = useState<any[]>([]);
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

  // const heightMap = useMemo(() => {
  //   console.log("reset map..");
  //   return new Map();
  // }, [cols, windowWidth, context.cardStyle, context.mediaOnly, context.wideUI]);
  const seenMap = useMemo(
    () => new Map(),
    [cols, windowWidth, context.cardStyle, context.mediaOnly, context.wideUI]
  );
  const { createMaps, setHeight, setSeen, getHeights, getSeen } = useHeightMap({
    columns: cols,
    cardStyle: context.cardStyle,
    mediaOnly: context.mediaOnly,
    wideUI: context.wideUI,
    windowWidth: windowWidth,
    compactLinkPics: context.compactLinkPics
  });
  useEffect(() => {
    if (
      !context.postOpen &&
      cols > 0 &&
      windowWidth > 0 &&
      context.cardStyle &&
      (context.mediaOnly === true || context.mediaOnly === false) &&
      (context.wideUI === true || context.wideUI === false)
    ) {
      createMaps();
    }
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
      //console.log(post?.data?.title)
      //setSeen(post?.data?.name, { seen: true });
      seenMap.set(post?.data?.name, { seen: true }); //using local map instead.. don't want to prerender heights if they haven't been scrolled onto the page yet
      context?.autoSeen &&
        localSeen.setItem(post?.data?.name, { time: new Date() });
    }
  };

  const handleSizeChange = (postName, height) => {
    const pHeight = getHeights()?.get(postName)?.height ?? 0;
    if (height > pHeight) {
      setHeight(postName, { height: height });
      //heightMap.set(postName, { height: height });
    }
  };

  //for when rows are collapsed
  const forceSizeChange = (postName, height) => {
    setHeight(postName, { height: height });
    //heightMap.set(postName, { height: height });
  };

  const PostCard = useCallback(
    (props) => {
      const post = props?.data;
      const seen = seenMap?.get(props?.data?.data?.name)?.seen === true; //getSeen()?.get(props?.data?.data?.name)?.seen === true;
      const knownHeight = getHeights()?.get(props?.data?.data?.name)?.height;

      let m = parseInt(margin.split("m-")?.[1] ?? 0);
      let width = props.width -2 - m * 8; //-border-margin
      if (context.cardStyle === "card1" && !context.mediaOnly) {
        width -= 24;
      }
      let minHeight =
        context.cardStyle !== "row1" &&
        !post?.data?.mediaInfo?.isSelf &&
        !(post?.data?.mediaInfo?.isLink && context?.compactLinkPics) &&
        !post?.data?.mediaInfo?.isTweet &&
        !post?.data?.mediaInfo?.isGallery &&
        post?.data?.mediaInfo?.dimensions?.[0] > 0
          ? (width / post?.data?.mediaInfo?.dimensions[0]) *
            post.data.mediaInfo.dimensions[1]
          : 0;
      let h = minHeight;
      if (post?.data?.mediaInfo?.isGallery) {
        let images = post.data.mediaInfo.gallery;
        const { tallest, widest, ratio, fImages } = findGreatestsImages(
          images,
          cols === 1 ? windowHeight * 0.75 : windowHeight * 0.95
        );
        if (cols === 1) {
          minHeight = Math.min(
            windowHeight * 0.75,
            ratio?.height * (width / ratio?.width)
          );
        } else {
          minHeight = tallest.height * (width / widest.width);
        }
      }
      if (cols === 1 && post?.data?.mediaInfo?.isVideo) {
        minHeight = Math.min(h, post?.data?.mediaInfo?.dimensions[1]);
      }
      if (cols === 1) {
        minHeight = Math.min(windowHeight * 0.75, minHeight);
      }

      return (
        <InView
          role={"gridcell"}
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
               // + " outline " //outlines for debugging..
              }
              style={
                knownHeight > 0 && seen
                  ? context.cardStyle === "row1" //rows need to grow
                    ? {
                        minHeight: `${knownHeight}px`,
                        outlineWidth: "2px",
                        outlineColor: "green",
                      }
                    : {
                        height: `${knownHeight}px`,
                        outlineWidth: "2px",
                        outlineColor: "green",
                      }
                  : minHeight > 0
                  ? {
                      minHeight: `${minHeight}px`
                    }
                  : {
                      minHeight: `${80}px`,
                    }
                // seen === true
                // ? { outlineWidth: "2px", outlineColor: "red" }
                // : knownHeight > 0
                // ? { outlineWidth: "2px", outlineColor: "blue" }
                // : { outlineWidth: "2px", outlineColor: "white" }
              }
            >
              <Post
                post={props.data}
                postNum={props.index}
                fetchNextPage={feed.fetchNextPage}
                curKey={curKey}
                handleSizeChange={handleSizeChange}
                forceSizeChange={forceSizeChange}
              />
            </div>
          )}
        </InView>
      );
    },

    [cols, windowWidth, context.cardStyle, context.wideUI, context.mediaOnly]
  );
  const filteredHeights = Array.from(getHeights()?.values() ?? [])
    .filter((m: any) => m?.height > 0)
    ?.map((m: any) => m?.height);
  const aveHeight =
    filteredHeights?.reduce((a: any, b: any) => a + b, 0) /
    filteredHeights.length;
  return (
    <div>
      <Masonry
        role="list"
        key={masonicKey}
        onRender={maybeLoadMorePosts}
        columnGutter={0}
        columnCount={cols}
        items={items}
        itemHeightEstimate={aveHeight > 0 ? aveHeight : 0}
        overscanBy={2}
        render={PostCard}
        className="outline-none"
        ssrWidth={500}
      />

      {!context?.infiniteLoading && feed.hasNextPage && (
        <div className="flex items-center justify-center mt-6 mb-6">
          <button
            aria-label="load more"
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
          Loading page {(feed?.data?.pages?.length ?? 0) + 1}...
        </h1>
      )}

      {loadInfo}
    </div>
  );
};

export default MyMasonic;
