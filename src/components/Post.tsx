/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";

import { useMainContext } from "../MainContext";
import PostModal from "./PostModal";
import { useRouter } from "next/dist/client/router";
import Media from "./Media";
import { postVote } from "../RedditAPI";
import { useSession } from "next-auth/client";
import { secondsToTime } from "../../lib/utils";

const Post = ({ post }) => {
  const context: any = useMainContext();
  const [hideNSFW, setHideNSFW] = useState(false);
  const [score, setScore] = useState("");
  const [select, setSelect] = useState(false);
  const [forceMute, setforceMute] = useState(0);
  const router = useRouter();
  const [session, loading] = useSession();
  const [hasMedia, setHasMedia] = useState(false);
  //console.log(post);

  useEffect(() => {
    context.nsfw === "false" && post.over_18
      ? setHideNSFW(true)
      : setHideNSFW(false);
    findMedia();
    return () => {
      setHideNSFW(false);
    };
  }, [context, post]);

  const [lastRoute, setLastRoute] = useState("");
  const [returnRoute, setReturnRoute] = useState("");

  useEffect(() => {
    if (lastRoute === router.asPath) {
      //console.log("match");
      setSelect(false);
      context.setPauseAll(false);
    }
    //don't add lastRoute to the array, breaks things
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  const calculateScore = (x: number) => {
    if (x < 10000) {
      return x.toString();
    } else {
      let y = Math.floor(x / 1000);
      let z = (x / 1000).toFixed(1);
      return z.toString() + "k";
    }
  };

  const handleClick = () => {
    setLastRoute(router.asPath);
    context.setPauseAll(true);
    setSelect(true);
    //need to handle pushing to [frontsort].. this kinda works (browser buttons don't work, app buttons do)
    if (router.query?.frontsort) {
      // router.push("/", post.permalink);
      // console.log("FRONSORT");
      setReturnRoute(router.asPath);
    } else if (router.pathname.includes("/user/")) {
      router.push(post.permalink);
    } else {
      router.push("", post.permalink, { shallow: true });
    }
  };

  const findMedia = () => {
    if (post?.preview?.reddit_video_preview) {
      setHasMedia(true);
    } else if (post?.media?.reddit_video) {
      setHasMedia(true);
    } else if (post?.media_metadata) {
      setHasMedia(true);
    } else if (post?.preview?.images?.[0]) {
      setHasMedia(true);
    } else if (post?.url) {
      if (
        post.url.includes(".jpg") ||
        post.url.includes(".png") ||
        post.url.includes(".gif")
      ) {
        setHasMedia(true);
      }
    } else {
      setHasMedia(false);
    }
  };

  const [vote, setVote] = useState(0);

  const castVote = async (e, v) => {
    e.stopPropagation();
    if (session) {
      v === vote ? (v = 0) : undefined;
      let res = await postVote(v, post.name);
      res ? setVote(v) : undefined;
    } else {
      context.setLoginModal(true);
    }
  };
  useEffect(() => {
    setScore(calculateScore(post?.score ? post?.score + vote : 0));

    return () => {};
  }, [post, vote]);

  return (
    <div>
      {select && (
        <PostModal
          permalink={post?.permalink}
          setSelect={setSelect}
          returnRoute={returnRoute}
        />
      )}

      <div
        onClick={() => handleClick()}
        className={
          ((!context.mediaOnly || !hasMedia || hideNSFW) ?
            "px-3 pt-3 pb-2 " : "  "  )+ (!context.mediaOnly && " rounded-md ") + 
          " text-sm bg-white border  border-gray-300 shadow-sm dark:bg-trueGray-900 dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-500"
        }
      >
        <div className="">
          {(!context?.mediaOnly || !hasMedia || hideNSFW) && (
            <>
              <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                <h1 className="text-lg font-medium leading-none cursor-pointer">
                  {post?.title ?? ""}
                </h1>
              </a>

              <div className="flex flex-row py-1 pb-1 text-xs font-light truncate text-gray">
                <Link href={`/r/${post?.subreddit}`}>
                  <a
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <h2>r/{post?.subreddit ?? "ERR"}</h2>
                  </a>
                </Link>
                <p>•</p>
                <Link href={`/user/${post?.author}`}>
                  <a
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <h2 className="ml-1 mr-1">u/{post?.author ?? ""}</h2>
                  </a>
                </Link>
                <p>•</p>

                <p className="ml-1">
                  {secondsToTime(post?.created_utc, ['sec', 'min', 'hr','day','mth','yr'])}
                </p>
                <div className="flex flex-row ml-auto">
                  <p className="ml-1">{`(${post.domain})`}</p>
                </div>
              </div>
            </>
          )}

          {context.mediaOnly ? (
            <div className={!context.mediaOnly && "pt-1 pb-1.5"}>
              {!hideNSFW ? (
                <div className="relative group">
                  <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                    <Media post={post} />
                  </a>
                  {context.mediaOnly && (
                    <div className="">
                      <a className="top-0 hidden w-full p-2 text-white h-5/6 group-hover:absolute group-hover:block bg-gradient-to-b from-black" href={post?.permalink} onClick={(e) => e.preventDefault()}></a>
                      <div className="top-0 hidden w-full p-2 text-white group-hover:absolute group-hover:block ">
                        <div className="flex flex-row text-xs font-light truncate text-gray">
                          <Link href={`/r/${post?.subreddit}`}>
                            <a
                              className="mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <h2>r/{post?.subreddit ?? "ERR"}</h2>
                            </a>
                          </Link>
                          <p>•</p>
                          <Link href={`/user/${post?.author}`}>
                            <a
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <h2 className="ml-1 mr-1">
                                u/{post?.author ?? ""}
                              </h2>
                            </a>
                          </Link>
                          <p>•</p>

                          <p className="ml-1">
                          {secondsToTime(post?.created_utc, ['sec', 'min', 'hr','day','mth','yr'])}
                          </p>
                          <div className="flex flex-row ml-auto">
                            <p className="ml-1">{`(${post.domain})`}</p>
                          </div>
                        </div>
                        <a
                          href={post?.permalink}
                          onClick={(e) => e.preventDefault()}
                        >
                          <h1 className="py-1 text-lg font-medium leading-none cursor-pointer">
                            {post?.title ?? ""}
                          </h1>
                        </a>
                        <div className="flex flex-row justify-between text-sm align-bottom select-none">
                          <div className="flex flex-row items-center space-x-1">
                            <p className="">{score + " points"}</p>
                          </div>
                          <a
                            href={post?.permalink}
                            onClick={(e) => e.preventDefault()}
                          >
                            <h1 className="cursor-pointer ">
                              {`${post.num_comments} ${
                                post.num_comments === 1 ? "comment" : "comments"
                              }`}
                            </h1>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-row justify-center text-red-400 text-color dark:text-red-700">
                  NSFW
                </div>
              )}
            </div>
          ) : (
            <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
              <div className={!context.mediaOnly && "pt-1 pb-1.5"}>
                {!hideNSFW ? (
                  <div className="relative group">
                    <Media post={post} forceMute={forceMute}/>
                  </div>
                ) : (
                  <div className="flex flex-row justify-center text-red-400 text-color dark:text-red-700">
                    NSFW
                  </div>
                )}
              </div>
            </a>
          )}

          {/* <p>{post?.url ?? "ERR"}</p> */}

          {(!context.mediaOnly || !hasMedia) && (
            <div className="flex flex-row justify-between py-1 pt-1 text-sm align-bottom select-none">
              <div className="flex flex-row items-center space-x-1">
                <div className="flex-none hover:cursor-pointer ">
                  <BiUpvote
                    className={
                      (vote === 1
                        ? "text-upvote "
                        : " text-black dark:text-white") +
                      " w-5 h-5 hover:scale-110 hover:text-upvote"
                    }
                    onClick={(e) => castVote(e, 1)}
                  />
                </div>
                <p className="">{score}</p>

                <div className="flex-none hover:cursor-pointer ">
                  <BiDownvote
                    className={
                      (vote === -1
                        ? " text-downvote "
                        : " text-black dark:text-white ") +
                      " w-5 h-5 hover:scale-110 hover:text-downvote"
                    }
                    onClick={(e) => castVote(e, -1)}
                  />
                </div>
              </div>
              <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                <h1 className="cursor-pointer ">
                  {`${post.num_comments} ${
                    post.num_comments === 1 ? "comment" : "comments"
                  }`}
                </h1>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Post;
