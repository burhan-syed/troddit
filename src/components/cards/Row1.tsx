import { useMainContext } from "../../MainContext";
import Link from "next/dist/client/link";
import { BiComment } from "react-icons/bi";
import { numToString, secondsToTime } from "../../../lib/utils";
import Image from "next/dist/client/image";
import { useState } from "react";

import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import { BsCardText } from "react-icons/bs";
import { AiOutlineLink } from "react-icons/ai";
import { CgArrowsExpandDownRight, CgArrowsExpandUpLeft } from "react-icons/cg";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "../MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import SaveButton from "../SaveButton";
import { hideLink } from "../../RedditAPI";
import HideButton from "../HideButton";
import PostOptButton from "../PostOptButton";
const Row1 = ({ post, hasMedia, hideNSFW, forceMute, postNum }) => {
  const [expand, setexpand] = useState(false);

  return (
    <div
      className={
        (postNum === 0 ? " border-t rounded-t-md " : " ") +
        "flex flex-row items-start py-1 pb-2 text-sm bg-lightPost dark:bg-[#212121] dark:hover:bg-darkPostHover group hover:bg-lightPostHover hover:border-l hover:border-r border-gray-300  dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-500  "
      }
    >
      {/* Votes */}
      <div
        className={
          (post?.link_flair_richtext?.length > 0 && "mt-2") +
          " flex flex-row items-center justify-center "
        }
      >
        <div className="flex flex-row items-center justify-center">
          <div className="flex-col items-center self-start justify-start flex-none hidden h-full pt-1 w-14 md:flex">
            <Vote
              likes={post?.likes}
              score={post?.score ?? 0}
              name={post?.name}
              postindex={postNum}
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
            // e.stopPropagation();
            e.preventDefault();
          }}
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
              <div className={hideNSFW && ""}>
                <Image
                  src={post?.thumbnail}
                  alt=""
                  layout={"intrinsic"}
                  priority={true}
                  height={post?.thumbnail_height}
                  width={post?.thumbnail_width}
                  unoptimized={true}
                  className={"rounded-md " + (hideNSFW && " blur")}
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
            <h1>
              {(post?.link_flair_text?.length > 0 ||
                post?.link_flair_richtext?.length > 0) && (
                <span className="mr-2 text-xs font-medium">
                  <TitleFlair post={post} />
                </span>
              )}
              <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                <span
                  className={
                    " group-hover:underline font-semibold text-base " +
                    (post?.distinguished == "moderator" || post?.stickied
                      ? " text-lightGreen dark:text-darkGreen "
                      : " ")
                  }
                >{`${post?.title ?? ""}`}</span>
              </a>
            </h1>

            {/* <a
              href={post?.permalink}
              onClick={(e) => e.preventDefault()}
              className={" font-semibold"}
            >
              <PostTitle post={post} />
            </a> */}
          </h1>
        </div>
        {/* Info */}
        <div className="flex flex-row flex-wrap items-center pt-1 text-xs text-gray-400 truncate dark:text-gray-500">
          <Link href={`/r/${post?.subreddit}`}>
            <a
              className="mr-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h2 className="hover:underline">r/{post?.subreddit ?? "ERR"}</h2>
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
              "min ago",
              "hr ago",
              "dy ago",
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
          <span className="ml-auto text-xs font-xs hover:underline">
            <a
              title="open source"
              href={`${post.url}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >{`(${post?.domain})`}</a>
          </span>
        </div>
        {/* Links */}
        <div>
          <div className="flex flex-row flex-wrap items-center justify-start pb-1 space-x-1 text-xs text-gray-400 select-none dark:text-gray-500">
            <button
              className={
                "flex flex-row items-center h-6 px-1 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight " +
                (!hasMedia &&
                  !post?.selftext_html &&
                  "opacity-0 cursor-default")
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                !(!hasMedia && !post?.selftext_html) && setexpand((s) => !s);
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

            <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
              <button className="flex flex-row items-center px-2 py-1 h-[26px] space-x-1 border border-transparent rounded-md hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                <BiComment className="flex-none w-4 h-4 " />
                <h1 className="">{`${
                  numToString(post?.num_comments, 1000) ?? "??"
                }`}</h1>
                <h1 className="hidden md:block">{`${
                  post?.num_comments === 1 ? "comment" : "comments"
                }`}</h1>
              </button>
            </a>
            <div className="flex flex-row items-center px-2 h-[26px] py-1 border border-transparent rounded-md hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight hover:cursor-pointer ">
              <SaveButton
                id={post?.name}
                saved={post?.saved}
                row={true}
                isPortrait={false}
                postindex={postNum}
              />
            </div>
            <div className="flex flex-row items-center px-2 h-[26px] py-1 border border-transparent rounded-md hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight hover:cursor-pointer ">
              <HideButton
                id={post?.name}
                hidden={post?.hidden}
                row={true}
                isPortrait={false}
                postindex={postNum}
              />
            </div>
            <a
              href={`${post?.url}` ?? "https://troddit.com"}
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex flex-row h-[26px] items-center px-2 py-1 space-x-1 border border-transparent rounded-md hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                <BiExit className="flex-none w-4 h-4 " />
                <h1 className="hidden md:block">Source</h1>
              </div>
            </a>
            <a
              href={`https://www.reddit.com${post?.permalink ?? ""}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="flex flex-row h-[26px] items-center px-2 py-1 space-x-1 border border-transparent rounded-md hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                <ImReddit className="flex-none w-4 h-4 mb-0.5" />
                <h1 className="hidden md:block ">Original</h1>
              </div>
            </a>
            <PostOptButton post={post} postNum={postNum} mode={"row"} />
          </div>
        </div>
        {/* Hidden Media */}

        {expand && (
          <div
            className={
              "block p-1 border-gray-100 md:border-l origin-top dark:border-darkHighlight " +
              (hideNSFW && " overflow-hidden relative")
            }
          >
            <a
              href={post?.permalink}
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
            >
              <MediaWrapper
                hideNSFW={hideNSFW}
                post={post}
                forceMute={forceMute}
                allowIFrame={expand}
                postMode={false}
                imgFull={false}
              />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Row1;
