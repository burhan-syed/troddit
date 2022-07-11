import { useEffect, useState } from "react";
import {
  loadFront,
  loadPost,
  loadSubreddits,
  loadUserPosts,
  loadSubInfo,
  getUserMultiPosts,
  getRedditSearch,
  loadSubFlairPosts,
  loadUserSelf,
} from "../RedditAPI";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { useSession } from "next-auth/react";
import PostModal from "./PostModal";
import LoginModal from "./LoginModal";

import MyMasonic from "./MyMasonic";
import { filterPosts, findMediaInfo } from "../../lib/utils";
import { ErrorBoundary } from "react-error-boundary";
import type { Session } from "next-auth/core/types";
import useFeed from "../hooks/useFeed";
import useRefresh from "../hooks/useRefresh";
import { IoMdRefresh } from "react-icons/io";
import ErrMessage from "./ErrMessage";
import useLocation from "../hooks/useLocation";

const Feed = ({ initialData = {} as any }) => {
  const { mode, subreddits } = useLocation();
  const { key, feed } = useFeed({
    initialPosts: initialData,
  });
  const { invalidateAll, invalidateKey, refreshCurrent, fetchingCount } =
    useRefresh();

  const context: any = useMainContext();
  const router = useRouter();

  useEffect(() => {
    if (
      router.asPath?.substring(0, 3) === "/r/" &&
      router.asPath.includes("/comments")
    ) {
      router.replace(router.asPath, undefined, { shallow: true });
    }
  }, []);

  if (feed.error && (mode === "USER" || mode === "SUBREDDIT") && subreddits) {
    router.replace(`/search?q=${subreddits}`);
  }
  return (
    <main>
      <LoginModal />
      {feed.error && (
        <div className="fixed z-50 max-w-lg p-2 mx-auto -translate-x-1/2 -translate-y-1/2 border rounded-lg top-1/2 left-1/2 bg-th-post border-th-border2">
          <p className="mb-2 text-center">
            {"Oops something went wrong :("}
          </p>

          <ErrMessage />
        </div>
      )}
      <div className="flex flex-col items-center flex-none w-screen">
        <div
          className={
            "w-full " +
            (context.columnOverride === 1 &&
            context.cardStyle !== "row1" &&
            !context.wideUI
              ? " max-w-2xl "
              : " md:w-11/12 ") +
            (context.cardStyle === "row1"
              ? " bg-th-post2 border-th-border2 rounded-t-md rounded-b-md border shadow-2xl min-h-screen "
              : " ")
          }
        >
          {" "}
          {/* + (context?.maximize ? " " : " md:w-5/6") */}
          {!feed.isLoading && (
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              onReset={invalidateAll} //context.setForceRefresh((i) => i + 1)}
            >
              <MyMasonic
                initItems={[]}
                feed={feed}
                curKey={key}
                key={`${key}_${context.fastRefresh}_${context.progressKey}`}
              />
              <div className="relative w-full"></div>
            </ErrorBoundary>
          )}
        </div>
      </div>
      <button
        disabled={feed.isFetching}
        onClick={() => {
          refreshCurrent();
        }}
        className={"hidden md:block fixed bottom-0 left-0"}
      >
        <IoMdRefresh
          className={
            (feed.isFetching && !feed.isFetchingNextPage
              ? "animate-spin "
              : " hover:scale-110 opacity-20 hover:opacity-100 ") + " w-6 h-6 "
          }
        />
      </button>
    </main>
  );
};

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div
      className="flex flex-col items-center justify-center mb-auto"
      role="alert"
    >
      <p className="text-center">Something went wrong</p>
      <button
        className="p-2 mb-2 border rounded-lg border-th-accent hover:bg-th-highlight"
        onClick={resetErrorBoundary}
      >
        Try again
      </button>
    </div>
  );
}

export default Feed;
