/* eslint-disable react/no-children-prop */
import React, {
  useEffect,
  useState,
  useRef,
} from "react";
import { useWindowSize } from "@react-hook/window-size";
import { Masonry, useInfiniteLoader } from "masonic";

import Post from "./Post";
import { useMainContext } from "../MainContext";
// import { usePlausible } from "next-plausible";
import { useRouter } from "next/router";
import { UseInfiniteQueryResult } from "react-query";

import toast from "react-hot-toast";
import ToastCustom from "./toast/ToastCustom";

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

const MyMasonic = ({
  initItems,
  feed,
  curKey,
}: 
MyMasonicProps) => {
  const context: any = useMainContext();


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

  useEffect(() => {
    context.setColumns(cols);
  }, [cols]);

  const [newPosts, setNewPosts] = useState<any[]>([]);
  const [newPostsCount, setNewPostsCount] = useState(0);

  useEffect(() => {
    const posts = feed?.data?.pages
      ?.map((page) => page.filtered)
      ?.flat()
      ?.map((post) => {
        return { ...post, curKey: curKey, fetchMore: feed.fetchNextPage };
      }) as any[];
    if (posts?.length > 0) {
     //console.log("infinitequery?", posts);
      if (posts?.length > items?.length) {
        setItems(posts);
      } else {
        setItems((pposts) => {
          let newPostCount = 0;
          let updatedPosts = pposts.map((post) => {
            let foundPost;
            foundPost = posts.find((p) => p?.data?.name === post?.data?.name);
            if (!foundPost) {
              newPostCount += 1;
              return post;
            }
            return foundPost;
          });
          //console.log("NEW POSTS?", newPostCount);
          setNewPostsCount(newPostCount);
          setNewPosts(() => (newPostCount > 0 ? posts : []));
          return updatedPosts;
        });
      }
    } else if (feed.hasNextPage) {
      //console.log("nodata.. fetching more");
      feed.fetchNextPage();
    }
  }, [feed?.data?.pages]);

  const [toastId, setToastId] = useState<string>();

  const overwritePosts = () => {
    toast.remove(toastId);
    setMasonicKey((k) => `${k}_${Math.random()}`);
    setNewPostsCount(0);
    setItems(newPosts);
  };
  useEffect(() => {
    if (newPostsCount > 0) {
      toast.remove(toastId);
      const tId = toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`${newPostsCount} new post${
              newPostsCount === 1 ? " is" : "s are"
            } available`}
            mode={"alert"}
            action={overwritePosts}
            actionLabel={`Update feed?`}
          />
        ),
        { position: "bottom-center", duration: 10 * 1000 }
      );
      setToastId(tId);
    }
  }, [newPostsCount]);
  useEffect(() => {
  
    return () => {
      toast.remove(toastId);
    }
  }, [])
  

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
      {!feed.isFetching && !feed.hasNextPage && feed.isFetched && (
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

  return (
    <div
      className={
        "" +
        (cols === 1 && context.cardStyle !== "row1" && !context.wideUI
          ? " w-screen  "
          : " w-screen md:w-11/12 ")
      }
    >
      {newPostsCount > 0 && (
        <button
          onClick={overwritePosts}
          className={
            (context.cardStyle === "row1" ? "" : "mx-1") +
            " group  flex min-w-full justify-between items-center flex-grow p-2 mb-2 border rounded-lg bg-th-post border-th-border2 hover:border-th-borderHighlight2"
          }
        >
          <span>
            {newPostsCount} new post{newPostsCount === 1 ? "" : "s"} available
          </span>
          <div className="p-1 px-3 text-sm border rounded-md border-th-border group-hover:border-th-borderHighlight group-hover:bg-th-highlight">
            {"Update Feed?"}
          </div>
        </button>
      )}
      <div
        className={
          context.cardStyle === "row1"
            ? " bg-th-post2 min-h-screen border-th-border2 rounded-t-md rounded-b-md border shadow-2xl "
            : `${!context.wideUI ? " max-w-2xl mx-auto" : " "}`
        }
      >
        <Masonry
          key={masonicKey}
          onRender={maybeLoadMorePosts}
          columnGutter={0}
          columnCount={cols}
          items={items}
          itemHeightEstimate={cols === 1 ? 0 : itemheightestimate} //itemheightestimate makes scrollbar jumpy but setting to 0 will result in empty columns
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
        {/* {filterCount > 0 && (
            <div className="fixed bottom-0 left-0 flex-col text-xs select-none">
              <h1>
                {pageCount} page{pageCount === 1 ? "" : "s"}
              </h1>
              <h1>{filterCount} filtered</h1>
            </div>
          )} */}
        {loadInfo}
      </div>
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
