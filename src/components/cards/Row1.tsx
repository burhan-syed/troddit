import { useMainContext } from "../../MainContext";
import Link from "next/link";
import { BiComment } from "react-icons/bi";
import { numToString, secondsToTime } from "../../../lib/utils";
import Image from "next/legacy/image";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import { BsBoxArrowInUpRight, BsCardText } from "react-icons/bs";
import { AiOutlineLink } from "react-icons/ai";
import { CgArrowsExpandDownRight, CgArrowsExpandUpLeft } from "react-icons/cg";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "../MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import SaveButton from "../SaveButton";
import HideButton from "../HideButton";
import PostOptButton from "../PostOptButton";
import { GoRepoForked } from "react-icons/go";
import { useWindowSize } from "@react-hook/window-size";
import PostBody from "../PostBody";
const Row1 = ({
  post,
  columns,
  hasMedia,
  hideNSFW,
  forceMute,
  postNum,
  read,
  handleClick,
  origCommentCount,
  checkCardHeight,
  mediaDimensions = [0, 0] as [number, number],
  initHeight,
  newPost = false,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const expandoRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);
  const context: any = useMainContext();
  const [windowWidth, windowHeight] = useWindowSize();
  const [expand, setexpand] = useState<boolean | undefined>();
  const [minHeight, setMinHeight] = useState(() => initHeight ?? 0);
  useEffect(() => {
    if (expand === undefined) {
      const cHeight = cardRef.current?.getBoundingClientRect()?.height ?? 0;
      const hHeight = headRef.current?.getBoundingClientRect()?.height ?? 0;
      const eHeight = expandoRef.current?.getBoundingClientRect()?.height ?? 0;
      // console.log("H??", { initHeight, cHeight, hHeight, eHeight });

      if (
        initHeight &&
        hHeight &&
        initHeight > hHeight + 10 //accounting for border-t, padding..
        // && (!hasMedia ||
        //   (mediaDimensions?.[1] &&
        //     Math.abs(initHeight - mediaDimensions[1]) <
        //       Math.abs(initHeight - cHeight)))
      ) {
        // console.log("EXPAND?", { initHeight, cHeight, hHeight, eHeight });
        setexpand(true);
      }
    }
  }, [initHeight, expand, mediaDimensions, hasMedia]);
  useEffect(() => {
    //if (expand === false) recomputeSize();
    const hHeight = headRef.current?.getBoundingClientRect()?.height ?? 0;

    if (expand === false) {
      setMinHeight(0);
    }
    if (checkCardHeight && expand === false) {
      checkCardHeight(hHeight);
    }
  }, [expand, checkCardHeight]);
  const voteScore = useMemo(() => {
    let x = post?.score ?? 0;
    if (x < 1000) {
      return x.toString() + (x === 1 ? " pt" : " pts");
    } else {
      let y = Math.floor(x / 1000);
      let z = (x / 1000).toFixed(1);
      return z.toString() + "k pts";
    }
  }, [post?.score]);


  return (
    <>
      <div
        ref={cardRef}
        onClick={(e) => handleClick(e)}
        className={
          (postNum === 0 ? " border-t rounded-t-md " : " ") +
          "text-sm bg-th-post2 hover:bg-th-postHover group border-l border-r border-transparent hover:border-th-borderHighlight2   "
        }
        style={minHeight ? { minHeight: `${minHeight}px` } : {}}
      >
        <div
          ref={headRef}
          className={
            "flex flex-row-reverse items-start py-1 sm:flex-row gap-x-1 sm:gap-x-0 " +
            (expand ? " pb-0 " : " pb-2 ")
          }
        >
          {/* Votes */}
          <div
            className={
              (post?.link_flair_richtext?.length > 0 ? "mt-2" : "") +
              " flex flex-row items-center justify-center "
            }
          >
            <div className="flex flex-row items-center justify-center">
              <div className="flex-col items-center self-start justify-start flex-none hidden h-full pt-1 w-14 sm:flex">
                <Vote
                  likes={post?.likes}
                  score={post?.score ?? 0}
                  name={post?.name}
                  archived={post?.archived}
                  postTime={post?.created_utc}
                />
              </div>
            </div>
            {/* Thumbnail */}
            <a
              href={
                `${post?.url?.replace("reddit.com", "troddit.com")}` ??
                `https://troddit.com${post?.permalink}`
              }
              target={"_blank"}
              rel="noreferrer"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleClick(e, { toMedia: true });
              }}
              className="mr-1 sm:mr-0"
            >
              <div
                className={
                  "relative flex items-center justify-center flex-none w-24 h-16 mt-2 rounded-md overflow-hidden" +
                  (post?.thumbnail == "self" ||
                  post?.thumbnail == "default" ||
                  post?.thumbnail == "nsfw" ||
                  post?.thumbnail == "spoiler"
                    ? " border rounded-md"
                    : " border border-transparent ") +
                  (hideNSFW && " overflow-hidden")
                }
              >
                {post?.thumbnail !== "self" &&
                post?.thumbnail !== "default" &&
                post?.thumbnail &&
                post?.thumbnail !== "nsfw" &&
                post?.thumbnail !== "spoiler" ? (
                  <div>
                    <Image
                      src={post?.thumbnail}
                      alt=""
                      layout={"intrinsic"}
                      priority={true}
                      height={post?.thumbnail_height}
                      width={post?.thumbnail_width}
                      unoptimized={true}
                      className={"rounded-md " + (hideNSFW ? " blur" : "")}
                    ></Image>
                  </div>
                ) : post?.thumbnail == "self" ? (
                  <BsCardText className="w-6 h-6" />
                ) : (
                  <AiOutlineLink className="w-6 h-6" />
                )}
              </div>
            </a>
          </div>
          <div className="flex flex-col flex-grow pr-2 mt-2 ml-2">
            {/* Title */}
            <div>
              <h1
                className={
                  " text-base leading-none cursor-pointer select-auto flex flex-row items-center gap-2 flex-wrap"
                }
              >
                <span>
                  {(post?.link_flair_text?.length > 0 ||
                    post?.link_flair_richtext?.length > 0) && (
                    <span className="mr-2 text-xs font-medium">
                      <TitleFlair post={post} />
                    </span>
                  )}
                  <Link
                    href={post?.permalink}
                    onClick={(e) => e.preventDefault()}
                  >
                    <span
                      className={
                        " group-hover:underline font-normal text-base " +
                        (post?.distinguished == "moderator" || post?.stickied
                          ? " text-th-green "
                          : " ") +
                        (read && context.dimRead ? " opacity-50" : "") +
                        (newPost ? " pr-2 " : "")
                      }
                      style={{
                        wordBreak: "break-word",
                      }}
                    >{`${post?.title ?? ""}`}</span>
                  </Link>
                  {newPost && (
                    <span className="text-xs italic font-light text-th-textLight">{`(new)`}</span>
                  )}
                </span>
              </h1>
            </div>
            {/* Info */}
            <div className="flex flex-row flex-wrap items-center pt-1 text-xs truncate text-th-textLight ">
              <Link legacyBehavior href={`/r/${post?.subreddit}`}>
                <a
                  className={"mr-1 "}
                  onClick={(e) => {
                    e.stopPropagation();
                    windowWidth < 640 && e.preventDefault();
                  }}
                >
                  <h2 className="cursor-default sm:hover:underline sm:cursor-pointer">
                    r/{post?.subreddit ?? "ERR"}
                  </h2>
                </a>
              </Link>
              {post?.crosspost_parent_list?.[0] ? (
                <div className="flex flex-row gap-1">
                  <GoRepoForked className="flex-none w-4 h-4 rotate-90" />
                  <span className="italic font-semibold">crosspost by</span>
                </div>
              ) : (
                <p>•</p>
              )}
              <Link legacyBehavior href={`/u/${post?.author}`}>
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    windowWidth < 640 && e.preventDefault();
                  }}
                >
                  <h2 className="ml-1 mr-1 cursor-default sm:hover:underline sm:cursor-pointer">
                    u/{post?.author ?? ""}
                  </h2>
                </a>
              </Link>
              <p>•</p>

              <p
                className="ml-1"
                title={new Date(post?.created_utc * 1000)?.toString()}
              >
                {secondsToTime(post?.created_utc, [
                  "s ago",
                  "min ago",
                  "hr ago",
                  "dy ago",
                  "mo ago",
                  "yr ago",
                ])}
              </p>
              {post?.num_duplicates > 0 && (
                <span className="flex">
                  <p className="mx-1">•</p>
                  <p className="">
                    {post?.num_duplicates} duplicate
                    {post?.num_duplicates === 1 ? "" : "s"}
                  </p>
                </span>
              )}
              {post?.over_18 && (
                <div className="flex flex-row pl-1 space-x-1">
                  <p>•</p>
                  <span className="text-th-red">NSFW</span>
                </div>
              )}
              {post?.spoiler && (
                <div className="flex flex-row pl-1 space-x-1">
                  <p>•</p>
                  <span className="text-th-red">SPOILER</span>
                </div>
              )}
              <div className="mx-0.5"></div>
              {post?.all_awardings?.length > 0 && (
                <>
                  <div className="ml-0.5"></div>
                  <Awardings
                    all_awardings={post?.all_awardings}
                    styles="mr-0.5 -mb-0.5"
                  />
                </>
              )}
              <div className="mx-0.5"></div>

              {post?.mediaInfo?.isLink ? (
                <a
                  href={`${post.url}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className={"ml-auto  items-center gap-0.5 hidden md:flex "}
                >
                  <BsBoxArrowInUpRight className="flex-none w-3 h-3 ml-auto group-hover:scale-110 " />

                  {"("}
                  <span className="max-w-[5rem] md:max-w-[10rem]  lg:max-w-xs truncate group-hover:text-th-linkHover hover:underline">
                    {post?.domain}/
                    {post?.url
                      ?.split("?")?.[0]
                      ?.replace("https://", "")
                      ?.split("/")
                      ?.splice(1)
                      ?.join("/")}
                  </span>
                  {")"}
                </a>
              ) : (
                <span className="hidden ml-auto text-xs font-xs hover:underline md:block">
                  <a
                    title="open source"
                    href={`${post.url}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >{`(${post?.domain})`}</a>
                </span>
              )}
            </div>
            {/* Links */}
            <div>
              <div className="flex flex-row flex-wrap items-center justify-start pb-1 space-x-1 text-xs select-none text-th-text">
                <button
                  aria-label="expand"
                  className={
                    "hidden sm:flex flex-row items-center h-6 px-1 space-x-1 border rounded-md border-th-border hover:border-th-borderHighlight opacity-60 " +
                    (!hasMedia && !post?.selftext_html
                      ? "opacity-0 cursor-default"
                      : "")
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    !(!hasMedia && !post?.selftext_html) &&
                      setexpand((s) => !!!s);
                  }}
                >
                  {hasMedia || post?.selftext_html ? (
                    <>
                      {expand ? (
                        <CgArrowsExpandUpLeft className="flex-none w-4 h-4" />
                      ) : (
                        <CgArrowsExpandDownRight className="flex-none w-4 h-4" />
                      )}
                    </>
                  ) : (
                    <AiOutlineLink />
                  )}
                </button>
                <span
                  className={
                    "sm:hidden text-th-textLight text-xs" +
                    (post?.likes === true || post?.likes === 1
                      ? " text-th-upvote "
                      : post?.likes === false || post?.likes === -1
                      ? " text-th-downvote "
                      : "")
                  }
                >
                  {voteScore}
                </span>
                <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                  <button
                    aria-label="open comments"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleClick(e, { toComments: true });
                    }}
                    className="flex flex-row items-center px-3 sm:px-2 py-1 h-8 sm:h-[26px] space-x-1 border border-transparent rounded-md  hover:border-th-borderHighlight opacity-60  "
                  >
                    <BiComment className="flex-none w-4 h-4 " />
                    <h1 className="">{`${
                      numToString(post?.num_comments, 1000) ?? "??"
                    }`}</h1>
                    <h1 className="hidden md:block">
                      {`${post?.num_comments === 1 ? "comment" : "comments"}`}{" "}
                    </h1>
                    {typeof origCommentCount === "number" &&
                      post?.num_comments > origCommentCount && (
                        <span className="text-xs italic font-medium">{`(${
                          post?.num_comments - origCommentCount
                        } new)`}</span>
                      )}
                  </button>
                </a>
                <div className="opacity-60">
                  <SaveButton
                    id={post?.name}
                    saved={post?.saved}
                    row={true}
                    isPortrait={false}
                  />
                </div>

                <div className="hidden sm:flex flex-row items-center px-3 sm:px-2 py-1 h-8 sm:h-[26px] border border-transparent rounded-md hover:border-th-borderHighlight opacity-60 hover:cursor-pointer ">
                  <HideButton
                    id={post?.name}
                    hidden={post?.hidden}
                    row={true}
                    isPortrait={false}
                  />
                </div>
                <a
                  href={`${post?.url}` ?? "https://troddit.com"}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="hidden sm:flex flex-row items-center px-3 sm:px-2 py-1 h-8 sm:h-[26px] space-x-1 border border-transparent rounded-md hover:border-th-borderHighlight opacity-60 ">
                    <BiExit className="flex-none w-4 h-4 " />
                    <h1 className="hidden md:block">Source</h1>
                  </div>
                </a>
                <a
                  href={`https://www.reddit.com${post?.permalink ?? ""}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden sm:block"
                >
                  <div className="flex flex-row h-[26px] items-center px-2 py-1 space-x-1 border border-transparent rounded-md hover:border-th-borderHighlight opacity-60 ">
                    <ImReddit className="flex-none w-4 h-4 mb-0.5" />
                    <h1 className="hidden md:block ">Original</h1>
                  </div>
                </a>
                <div className="relative flex justify-end flex-grow sm:flex-grow-0 text-th-textLight ">
                  <PostOptButton post={post} mode={"row"} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden Media */}
        {expand && (
          <div
            className={
              "block p-1 origin-top pb-2 " +
              (hideNSFW ? " overflow-hidden relative" : "")
            }
          >
            {post?.crosspost_parent_list?.[0] ? (
              <div className="relative block">
                <MediaWrapper
                  hideNSFW={hideNSFW}
                  post={post}
                  columns={columns}
                  forceMute={forceMute}
                  postMode={false}
                  imgFull={false}
                  handleClick={handleClick}
                  mediaDimensions={mediaDimensions}
                  checkCardHeight={checkCardHeight}
                  cardStyle={"row1"}
                  mediaOnly={false}
                />
              </div>
            ) : (
              <a
                href={post?.permalink}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClick(e, { toMedia: true });
                }}
                onMouseDown={(e) => e.preventDefault()}
                className="relative block"
              >
                <MediaWrapper
                  hideNSFW={hideNSFW}
                  post={post}
                  columns={columns}
                  forceMute={forceMute}
                  postMode={false}
                  imgFull={false}
                  handleClick={handleClick}
                  mediaDimensions={mediaDimensions}
                  checkCardHeight={checkCardHeight}
                  cardStyle={"row1"}
                  mediaOnly={false}
                />
              </a>
            )}

            {(post.crosspost_parent_list?.[0]?.selftext_html ||
              post?.selftext_html) && (
              <div
                className={
                  "relative block mx-0" +
                  (post?.mediaInfo?.hasMedia ? " mt-2" : "")
                }
              >
                <PostBody
                  mode="expando"
                  rawHTML={
                    post.crosspost_parent_list?.[0]?.selftext_html ??
                    post?.selftext_html
                  }
                  limitHeight={Math.max(windowHeight * 0.5, 224)}
                  newTabLinks={true}
                  checkCardHeight={checkCardHeight}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Row1;
