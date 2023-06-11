import React, { useEffect } from "react";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import LoginModal from "./LoginModal";
import { ErrorBoundary } from "react-error-boundary";
import useFeed from "../hooks/useFeed";
import useRefresh from "../hooks/useRefresh";
import { IoMdRefresh } from "react-icons/io";
import ErrMessage from "./ErrMessage";
import useLocation from "../hooks/useLocation";
import toast from "react-hot-toast";
import ToastCustom from "./toast/ToastCustom";
import FeedMasonry from "./FeedMasonry";

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

  if (
    feed.error &&
    (mode === "USER" || mode === "SUBREDDIT") &&
    subreddits &&
    !feed?.data?.pages
  ) {
    toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`We couldn't find that ${
            mode === "SUBREDDIT" ? "subreddit" : "user"
          }. ${
            mode === "SUBREDDIT" ? "It" : "They"
          } may be banned or restricted.`}
          mode={"alert"}
          action={() => {
            toast.remove("not_found");
            router.replace(`/search?q=${subreddits}`);
          }}
          actionLabel={"Search Instead?"}
        />
      ),
      { position: "bottom-center", duration: Infinity, id: "not_found" }
    );
  } else if (feed.error) {
    toast.custom(
      (t) => (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.remove("feed_error");
          }}
          className="max-w-lg p-2 border rounded-lg bg-th-postHover border-th-border2"
        >
          <p className="mb-2 text-center">{"Oops something went wrong :("}</p>

          <ErrMessage />
        </button>
      ),
      { position: "bottom-center", duration: Infinity, id: "feed_error" }
    );
  } else {
    toast.remove("not_found");
    toast.remove("feed_error");
  }
  return (
    <>
      <LoginModal />
      <div className="flex flex-col items-center flex-none w-screen pt-1">
        <div
          className={
            "w-[98%] mx-auto " +
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
          <ErrorBoundary
            FallbackComponent={ErrorFallback}
            onReset={invalidateAll} //context.setForceRefresh((i) => i + 1)}
          >
            <FeedMasonry
              initItems={[]}
              feed={feed}
              curKey={key}
              key={`${key}_${context.fastRefresh}_${context.progressKey}`}
            />
          </ErrorBoundary>
        </div>
      </div>
      <button
        aria-label="refresh"
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
    </>
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
