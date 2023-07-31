import React, { useCallback, useEffect, useMemo, useState } from "react";
import { UseInfiniteQueryResult } from "@tanstack/react-query";

import {
  MasonryScroller,
  useContainerPosition,
  usePositioner,
  useResizeObserver,
  useInfiniteLoader,
  useScrollToIndex,
} from "masonic";
import { useWindowSize } from "@react-hook/window-size";
import { localSeen, useMainContext } from "../MainContext";

import PostModal from "./PostModal";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { InView } from "react-intersection-observer";
import Post from "./Post";
import { findGreatestsImages } from "../../lib/utils";
import useFeedPosts from "../hooks/useFeedPosts";
import useHeightMap from "../hooks/useHeightMap";
import useGlobalState from "../hooks/useGlobalState";
import Spinner from "./ui/Spinner";

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

const FeedMasonry = ({ initItems, feed, curKey }: MyMasonicProps) => {
  const [masonicKey, setMasonicKey] = useState(curKey);
  const [cols, setCols] = useState<number>();
  const [uniformMediaMode, setUniformMediaMode] = useState(false);

  const router = useRouter();
  // const { data: session, status } = useSession();
  const context: any = useMainContext();
  const containerRef = React.useRef(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const { flatPosts } = useFeedPosts({
    feed,
    askToUpdateFeed: context.askToUpdateFeed,
    setKey: setMasonicKey,
  });

  useEffect(() => {
    if (cols && context.mediaOnly && cols > 1 && context.uniformHeights) {
      setUniformMediaMode(true);
    } else if (cols) {
      setUniformMediaMode(false);
    }
  }, [cols, context.mediaOnly, context.uniformHeights]);
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight,
  ]);
  const gutter =
    context.cardStyle === "row1"
      ? 0
      : cols === 1
      ? 8
      : cols && cols > 1 && windowWidth < 640 //sm
      ? cols === 2
        ? 8
        : 0
      : cols && cols > 3 && windowWidth < 1280 //xl
      ? 4
      : cols && cols > 3 && windowWidth > 1280 //xl
      ? 8
      : 8;
  const colWidth =
    context.cardStyle === "row1"
      ? width
      : (width - (cols ?? 0 > 1 ? gutter * (cols ? cols : 1) : 0)) /
        (cols ? cols : 1);
  const positioner = usePositioner({
    width,
    columnGutter: gutter,
    columnWidth: colWidth,
  });
  const scrollToIndex = useScrollToIndex(positioner, {
    height: windowHeight,
    offset,
    align: "center",
  });

  const resizeObserver = useResizeObserver(positioner);
  const maybeLoadMore = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      if (
        context?.infiniteLoading &&
        !feed.isFetching &&
        !feed.isLoading &&
        feed.hasNextPage &&
        currentItems.length - 1 <= stopIndex
      ) {
        await feed.fetchNextPage();
      }
    },
    {
      isItemLoaded: (index, items) => !!items[index],
    }
  );

  const [lastRoute, setLastRoute] = useState("");
  const [selectedPost, setSelectedPost] = useState<any>();
  const openPost = (post, postNum, nav, lastRoute) => {
    context.setPauseAll(true);
    setSelectedPost({
      post: post,
      postNum: postNum,
      nav: nav,
      lastRoute: lastRoute,
    });
  };
  useEffect(() => {
    if (context.cardStyle === "row1") {
      setCols(1);
    } else if (context?.columnOverride !== 0) {
      setCols(context.columnOverride);
    } else if (windowWidth > 1920) {
      setCols(5);
    } else if (windowWidth > 1400) {
      setCols(4);
    } else if (windowWidth > 1000) {
      setCols(3);
    } else if (windowWidth > 767) {
      setCols(2);
    } else {
      setCols(1);
    }

    return () => {};
  }, [windowWidth, context.columnOverride, context.cardStyle]);
  useEffect(() => {
    context.setColumns(cols);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cols]);
  useEffect(() => {
    if (!selectedPost?.lastRoute || selectedPost?.lastRoute === router.asPath) {
      setSelectedPost(undefined);
      context.setMediaMode(false);
      context.setPauseAll(false);
    }
    //don't add lastRoute to the array, breaks things
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  const { getGlobalData, setGlobalData } = useGlobalState(
    curKey?.length > 1 ? ["lastScrollTop", curKey] : [""]
  );

  const postClick = (a, b) => {
    setGlobalData("lastClicked", a);
    setGlobalData("lastScroll", undefined);
  };
  const [scrolled, setScrolled] = useState<boolean | number>(false);
  useEffect(() => {
    if (flatPosts.length > 0 && curKey.length > 1 && !scrolled) {
      const g = getGlobalData();
      if (g) {
        const lastPostClick = g?.get("lastClicked");
        const lastPostScroll = g?.get("lastScroll");
        const lastPost = lastPostClick ?? lastPostScroll;
        const lastPostIndex = flatPosts.findIndex(
          (p) => lastPost && p?.data?.name === lastPost
        );
        setScrolled(lastPostIndex);
        if (lastPostIndex > 0) {
          scrollToIndex(lastPostIndex);
        }
      }
    }
  }, [curKey, flatPosts, scrollToIndex, scrolled]);

  useEffect(() => {
    if (curKey?.[0] === "") {
      setScrolled(false);
    }
  }, [curKey]);

  const { setHeight, getHeights } = useHeightMap({
    columnWidth:
      context.cardStyle === "row1"
        ? width
        : Math.round(width / ((cols ? cols : 1) + 1)),
    cardStyle: context.cardStyle,
    mediaOnly: context.mediaOnly,
    compactLinkPics: context.compactLinkPics,
    uniformMediaMode: !!uniformMediaMode,
    windowHeight,
  });
  const handleSizeChange = useCallback(
    (postName, height) => {
      //console.log("setheight?", height);
      height && setHeight(postName, { height: height });
    },
    [setHeight]
  );

  const handleIntersectChange = useCallback(
    (inView: boolean, entry: IntersectionObserverEntry, post) => {
      if (
        entry.intersectionRect?.x === 0 &&
        !inView &&
        entry.boundingClientRect.top < 0 &&
        Math.abs(entry?.boundingClientRect?.bottom) < (windowHeight * 1) / 2
      ) {
        setGlobalData("lastScroll", post?.name);
        setGlobalData("lastClick", undefined);
        if(context?.autoSeen){
          localSeen.setItem(post?.name, { time: new Date() });
        } 
          
      }
      //context.cardStyle === "row1" && setGlobalData("lastTop", window.scrollY);
    },
    []
  );

  const RenderCard = useCallback(
    (props) => {
      const { width } = props;

      let mediaWidth = props.width;
      if (
        (context.cardStyle === "card1" || context.cardStyle === "default") &&
        !context.mediaOnly
      ) {
        mediaWidth -= 24; //padding width
      }
      if (context.cardStyle === "row1") {
        mediaWidth = width - 8; //padding width
      }
      const post = props.data?.data;
      const knownHeight = getHeights()?.get(post?.name)?.height;
      let windowHeightToUse = windowHeight;

      //for mobile
      if (windowWidth < 525) {
        windowHeightToUse = window.screen.height;
      }

      const linkMode =
        context?.compactLinkPics &&
        !context.mediaOnly &&
        post?.mediaInfo?.isLink &&
        !post?.mediaInfo?.isTweet &&
        // post?.mediaInfo?.imageInfo?.[0]?.src &&
        !(
          post?.mediaInfo?.isIframe &&
          (context.embedsEverywhere || (cols === 1 && !context.disableEmbeds))
        );
      const maxHeight =
        cols === 1 ? windowHeightToUse * 0.75 : windowHeightToUse * 0.9;
      let mediaHeight = Math.min(
        post?.mediaInfo?.dimensions?.[1]
          ? (mediaWidth / post?.mediaInfo?.dimensions?.[0]) *
              post?.mediaInfo?.dimensions?.[1]
          : 0,
        maxHeight
      );

      if (post?.data?.mediaInfo?.isGallery) {
        const { tallest, widest, ratio, fImages } = findGreatestsImages(
          post.data.mediaInfo.gallery,
          cols === 1 ? windowHeightToUse * 0.75 : windowHeightToUse * 1
        );
        if (cols === 1) {
          mediaHeight = Math.min(
            windowHeightToUse * 0.75,
            ratio?.height * (width / ratio?.width)
          );
        } else {
          mediaHeight = tallest?.height * (width / widest?.width);
        }
      }

      if (post.mediaInfo?.isYTVid) {
        mediaHeight = (mediaWidth * 9) / 16;
      }

      if (
        uniformMediaMode ||
        (post.mediaInfo.isSelf && !post.mediaInfo.isDual)
      ) {
        mediaHeight = 0;
      }

      const scrolledTo = scrolled === props.index;

      return (
        <InView
          role={"gridcell"}
          threshold={0}
          onChange={(inView, entry) =>
            handleIntersectChange(inView, entry, post)
          }
        >
          {({ inView, ref }) => (
            <div
              ref={ref}
              className={
                "relative " +
                (scrolledTo
                  ? `${
                      context.cardStyle !== "row1"
                        ? " ring rounded-lg"
                        : " ring-1 "
                    } ring-th-accent z-10 `
                  : "")
              }
              style={
                uniformMediaMode
                  ? {
                      height: `${(mediaWidth * 16) / 9}px`,
                    }
                  : knownHeight && context.cardStyle !== "row1"
                  ? {
                      minHeight: `${knownHeight}px`,
                    }
                  : mediaHeight > 0 && context.cardStyle !== "row1" && !linkMode
                  ? {
                      minHeight: `${mediaHeight}px`,
                    }
                  : {
                      minHeight: `${80}px`,
                    }
              }
            >
              <Post
                inView={inView}
                post={props.data}
                postNum={props.data?.index ?? props.index}
                postClick={postClick}
                uniformMediaMode={uniformMediaMode}
                openPost={openPost}
                mediaDimensions={[mediaWidth, mediaHeight]}
                showNSFW={context.nsfw}
                cardStyle={context.cardStyle}
                columns={cols}
                handleSizeChange={handleSizeChange}
                initHeight={knownHeight ?? 0}
              />
            </div>
          )}
        </InView>
      );
    },
    [
      scrolled,
      width,
      context.nsfw,
      context.cardStyle,
      context.mediaOnly,
      cols,
      uniformMediaMode,
      context?.compactLinkPics,
      context.disableEmbeds,
      context.embedsEverywhere,
    ]
  );

  const feedLoading =
    feed.isFetching && !feed.isError && context.infiniteLoading;

  const loadInfo = (
    <>
      {!feed.isFetching &&
        !feed.hasNextPage &&
        feed.isFetched &&
        !feed.error && flatPosts?.length > 0 && (
          <div className="flex flex-row items-center justify-center my-6 text-sm font-light">
            <p>
              Loaded {flatPosts?.length} post
              {flatPosts?.length === 1 ? "" : "s"} on {feed.data?.pages?.length}{" "}
              page
              {feed.data?.pages?.length === 1 ? "" : "s"}.{" "}
            </p>
          </div>
        )}
    </>
  );

  return (
    <>
      {selectedPost && (
        <PostModal
          permalink={selectedPost?.data?.permalink}
          setSelect={setSelectedPost}
          returnRoute={
            router.query?.slug?.[1]?.toUpperCase() === "M"
              ? "multimode"
              : selectedPost.lastRoute
          }
          postData={selectedPost?.post?.data}
          postNum={selectedPost?.postNum}
          commentMode={selectedPost?.kind === "t1"}
          commentsDirect={selectedPost?.nav?.toComments}
          mediaMode={selectedPost?.nav?.toMedia}
          curKey={curKey}
          fetchMore={feed.fetchNextPage}
          feedLoading={feed.isFetchingNextPage}
          flattenedPosts={flatPosts}
        />
      )}
      <div className={"min-h-screen w-full"}>
        <MasonryScroller
          itemKey={(data, index) => {
            return data?.data?.name ?? index;
          }}
          key={masonicKey}
          positioner={positioner}
          // The distance in px between the top of the document and the top of the
          // masonry grid container
          offset={offset}
          // The height of the virtualization window
          height={windowHeight}
          // Forwards the ref to the masonry container element
          containerRef={containerRef}
          items={flatPosts}
          overscanBy={4}
          render={RenderCard}
          resizeObserver={resizeObserver}
          onRender={maybeLoadMore}
        />
        <div className="flex items-center justify-center h-20">
          {!context?.infiniteLoading && feed.hasNextPage && (
            <div className="flex items-center justify-center">
              <button
                aria-label="load more"
                disabled={feed.isLoading || feed.isFetchingNextPage}
                onClick={() => {
                  feed.fetchNextPage();
                }}
                className={
                  (feed.isLoading || feed.isFetchingNextPage
                    ? " animate-pulse "
                    : " cursor-pointer hover:bg-th-postHover hover:border-th-borderHighlight shadow-2xl  ") +
                  "flex items-center justify-center px-4 py-2 border rounded-md  h-9 border-th-border bg-th-post "
                }
              >
                <span>Load Page {(feed?.data?.pages?.length ?? 1) + 1}</span>
              </button>
            </div>
          )}
          {feedLoading && (
            <div className="flex flex-col items-center justify-center w-full gap-2 text-center">
              <span>Loading page {(feed?.data?.pages?.length ?? 0) + 1} </span>
              <div className="opacity-80 text-th-accent">
                <Spinner size={20} />
              </div>
            </div>
          )}

          {loadInfo}
        </div>
      </div>
    </>
  );
};

export default FeedMasonry;
