import { useMainContext } from "../../MainContext";
import { useState, useEffect } from "react";
import Link from "next/dist/client/link";
import Media from "../Media";
import { numToString, secondsToTime } from "../../../lib/utils";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "./MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import PostOptButton from "../PostOptButton";

//og card
const Card1 = ({ post, hasMedia, hideNSFW, forceMute, postNum }) => {
  const context: any = useMainContext();
  const [allowIFrame, setallowIFrame] = useState(false);
  useEffect(() => {
    if (context?.columnOverride === 1) {
      setallowIFrame(true);
    } else {
      setallowIFrame(false);
    }
    return () => {};
  }, [context?.columnOverride]);
  return (
    <div>
      <div
        className={
          (!context.mediaOnly || !hasMedia ? "px-3 pt-3 pb-2 " : "  ") +
          (!context.mediaOnly && " rounded-md ") +
          " text-sm bg-lightPost hover:bg-lightPostHover dark:hover:bg-darkPostHover hover:shadow-2xl transition-colors border  group hover:cursor-pointer border-gray-300 shadow-md dark:bg-darkBG dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-400"
        }
      >
        <div className="">
          {(!context?.mediaOnly || !hasMedia) && (
            <div>
              <div className="flex flex-row items-start py-1 text-xs text-gray-400 truncate select-auto dark:text-gray-500">
                <div className="flex flex-row flex-wrap items-start text-xs text-gray-400 truncate select-auto dark:text-gray-500">
                  <Link href={`/r/${post?.subreddit}`}>
                    <a
                      title={`go to r/${post?.subreddit}`}
                      className="mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <h2 className="font-semibold text-black hover:underline dark:text-lightText ">
                        r/{post?.subreddit ?? ""}
                      </h2>
                    </a>
                  </Link>
                  <p>•</p>
                  <Link href={`/u/${post?.author}`}>
                    <a
                      title={`see u/${post?.author}'s posts`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <h2 className="ml-1 mr-1 hover:underline">
                        u/{post?.author ?? ""}
                      </h2>
                    </a>
                  </Link>
                  <p>•</p>
                  <p className="ml-1 ">
                    {secondsToTime(post?.created_utc, [
                      "s ago",
                      "m ago",
                      "h ago",
                      "d ago",
                      "mo ago",
                      "yr ago",
                    ])}
                  </p>
                  {post?.over_18 && (
                    <div className="flex flex-row pl-1 space-x-1">
                      <p>•</p>
                      <span className="text-red-400 text-color dark:text-red-700">
                        NSFW
                      </span>
                    </div>
                  )}
                  {post?.spoiler && (
                    <div className="flex flex-row pl-1 space-x-1">
                      <p>•</p>
                      <span className="text-red-400 text-color dark:text-red-700">
                        SPOILER
                      </span>
                    </div>
                  )}
                  <div className="mx-1"></div>
                  {post?.all_awardings?.length > 0 && (
                    <Awardings
                      all_awardings={post?.all_awardings}
                      truncate={false}
                    />
                  )}
                </div>
                <div className="flex flex-row flex-none ml-auto hover:underline">
                  <a
                    title="open source"
                    href={`${post.url}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="">{`(${post?.domain})`}</p>
                  </a>
                </div>
              </div>

              <div className="py-2">
                <h1
                  className={
                    " items-center text-lg font-semibold  leading-none cursor-pointer pb-2 flex flex-row flex-wrap gap-2"
                  }
                >
                  <a
                    href={post?.permalink}
                    onClick={(e) => e.preventDefault()}
                    className=""
                  >
                    <PostTitle post={post} />
                  </a>
                  <span className="text-sm ">
                    <TitleFlair post={post} />
                  </span>
                </h1>

                {/* <div className="pb-1 text-xs">
                  
                </div> */}
              </div>
            </div>
          )}

          {/* Media Only */}
          {context.mediaOnly ? (
            <div className={!context.mediaOnly ? "pt-1 pb-1.5" : undefined}>
              {hasMedia && (
                <div className={"relative group "}>
                  <MediaWrapper
                    hideNSFW={hideNSFW}
                    post={post}
                    forceMute={forceMute}
                    allowIFrame={allowIFrame}
                    postMode={false}
                    imgFull={false}
                  />
                  {context.mediaOnly && (
                    <div className="">
                      <a
                        className="top-0 hidden w-full p-2 text-lightText h-5/6 group-hover:absolute group-hover:block bg-gradient-to-b from-black"
                        href={post?.permalink}
                        onClick={(e) => e.preventDefault()}
                      ></a>
                      <div className="top-0 hidden w-full p-2 text-lightText group-hover:absolute group-hover:block ">
                        <div className="flex flex-row items-center text-xs font-light truncate ">
                          <Link href={`/r/${post?.subreddit}`}>
                            <a
                              className="mr-1"
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <h2 className="font-semibold hover:underline">
                                r/{post?.subreddit ?? "ERR"}
                              </h2>
                            </a>
                          </Link>
                          <p>•</p>
                          <Link href={`/u/${post?.author}`}>
                            <a
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <h2 className="ml-1 mr-1 hover:underline">
                                u/{post?.author ?? ""}
                              </h2>
                            </a>
                          </Link>
                          <p>•</p>

                          <p className="ml-1">
                            {secondsToTime(post?.created_utc, [
                              "s ago",
                              "m ago",
                              "h ago",
                              "d ago",
                              "mo ago",
                              "yr ago",
                            ])}
                          </p>
                          {post?.over_18 && (
                            <div className="flex flex-row pl-1 space-x-1">
                              <p>•</p>
                              <span className="text-red-400 text-color dark:text-red-700">
                                NSFW
                              </span>
                            </div>
                          )}
                          {post?.spoiler && (
                            <div className="flex flex-row pl-1 space-x-1">
                              <p>•</p>
                              <span className="text-red-400 text-color dark:text-red-700">
                                SPOILER
                              </span>
                            </div>
                          )}
                          <div className="mx-0.5"></div>
                          {post?.all_awardings?.length > 0 && (
                            <div className="flex flex-row flex-wrap items-center justify-start truncate">
                              <Awardings all_awardings={post?.all_awardings} />
                            </div>
                          )}
                          <div className="ml-auto">
                            <p className="">{`(${post?.domain})`}</p>
                          </div>
                        </div>
                        <h1 className="flex flex-row flex-wrap items-center gap-1 pb-1">
                          <a
                            href={post?.permalink}
                            onClick={(e) => e.preventDefault()}
                            className={
                              "py-1 text-lg font-medium leading-none cursor-pointer "
                            }
                          >
                            <PostTitle post={post} />
                          </a>
                          <span className="text-xs">
                            <TitleFlair post={post} />
                          </span>
                        </h1>

                        <div className="flex flex-row justify-between text-xs font-bold align-bottom select-none">
                          <div className="flex flex-row items-center space-x-1">
                            <p className="">{post?.score + " points"}</p>
                          </div>
                          <a
                            href={post?.permalink}
                            onClick={(e) => e.preventDefault()}
                          >
                            <h1 className="cursor-pointer hover:underline">
                              {`${numToString(post.num_comments, 1000)} ${
                                post.num_comments === 1 ? "comment" : "comments"
                              }`}
                            </h1>
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <a
              href={post?.permalink}
              onClick={(e) => {
                e.preventDefault();
              }}
              onMouseDown={(e) => {
                e.preventDefault();
              }}
            >
              <div className={!context.mediaOnly ? "pt-1 pb-1.5 " : undefined}>
                <MediaWrapper
                  hideNSFW={hideNSFW}
                  post={post}
                  forceMute={forceMute}
                  allowIFrame={allowIFrame}
                  postMode={false}
                  imgFull={false}
                />
              </div>
            </a>
          )}

          {(!context.mediaOnly || !hasMedia) && (
            <div className="flex flex-row flex-wrap py-1 pt-1 text-sm font-semibold align-bottom select-none">
              <div className="flex flex-row items-center space-x-1 ">
                <Vote
                  name={post?.name}
                  score={post?.score}
                  likes={post?.likes}
                  size={5}
                  postindex={postNum}
                />
              </div>
              <div className="flex flex-row items-center justify-end gap-2 ml-auto">
                <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                  <h1
                    className={
                      "cursor-pointer hover:underline" +
                      " text-gray-400 dark:text-gray-500 group-hover:text-black dark:group-hover:text-lightText  "
                    }
                  >
                    {`${numToString(post.num_comments, 1000)} ${
                      post.num_comments === 1 ? "comment" : "comments"
                    }`}
                  </h1>
                </a>
                <PostOptButton post={post} postNum={postNum} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card1;
