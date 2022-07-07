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

const Feed = ({
  initialData = {} as any,
  safeSearch = false,
}) => {
  const { key, feed } = useFeed({ safeSearch: safeSearch, initialPosts: initialData });
  const {invalidateAll} = useRefresh(); 


  const context: any = useMainContext();
  const router = useRouter();


  useEffect(() => {
    if (router.asPath?.substring(0,3) === "/r/" && router.asPath.includes('/comments') ){
      console.log(">>>>>>>>>REPLACING<<<<<<<<<<<<", router.asPath);
     router.replace(router.asPath, undefined, {shallow: true});
    }
  }, [])

  if (feed.error) {
    return (
      <div className="flex flex-col items-center justify-center mt-16 text-center">
        <div>{"Oops something went wrong :("}</div>
        <div>
          {"Please assure traffic from Reddit is not blocked and refresh"}
        </div>
        {/* {subreddits !== "" && (
          <div>{`Otherwise, this ${
            isUser ? "user" : "subreddit"
          } may not exist`}</div>
        )} */}
      </div>
    );
  }
  return (
    <main>    
      <LoginModal />
      <div className="flex flex-col items-center flex-none w-screen">
      
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
            </ErrorBoundary>
          )}
      </div>
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
