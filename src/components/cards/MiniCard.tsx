import React from "react";
import Vote from "../Vote";
import Image from "next/legacy/image";
import { BsBoxArrowInUpRight, BsCardText } from "react-icons/bs";
import { AiOutlineLink } from "react-icons/ai";
import TitleFlair from "../TitleFlair";
import Awardings from "../Awardings";
import { secondsToTime } from "../../../lib/utils";
import Link from "next/link";

const MiniCard = ({ post }) => {
  return (
    <div className="flex items-start p-1 md:p-2 ">
      <div className="flex flex-col items-center gap-1 px-1 text-xs md:px-2">
        <Vote
          likes={post?.likes}
          score={post?.score ?? 0}
          name={post?.name}
          archived={post?.archived}
          postTime={post?.created_utc}
        />
      </div>
      <div className="relative flex-none w-16 h-16 my-auto md:w-20 md:h-20">
        {post?.thumbnail !== "self" &&
        post?.thumbnail !== "default" &&
        post?.thumbnail &&
        post?.thumbnail !== "nsfw" &&
        post?.thumbnail !== "spoiler" ? (
          <Image
            src={post?.thumbnail}
            alt=""
            layout={"intrinsic"}
            priority={true}
            height={post?.thumbnail_height}
            width={post?.thumbnail_width}
            unoptimized={true}
            className={"rounded-md  "}
          ></Image>
        ) : post?.thumbnail == "self" ? (
          <BsCardText className="w-6 h-6" />
        ) : (
          <AiOutlineLink className="w-6 h-6" />
        )}
      </div>
      <div className="flex flex-col w-full px-2 ">
        <h2 className="inline-flex flex-wrap items-baseline gap-1 text-sm">
          <Link
            href={post.permalink}
            target={"_blank"}
            className="flex-wrap font-semibold hover:underline"
            style={{
              wordBreak: "break-word",
            }}>

            {post.title}

          </Link>
          <span className="text-xs font-medium">
            <TitleFlair post={post} />
          </span>
          {post?.over_18 && (
            <div className="flex flex-row space-x-1 text-xs">
              <span className="text-th-red">NSFW</span>
            </div>
          )}
          {post?.spoiler && (
            <div className="flex flex-row space-x-1 text-xs">
              <span className="text-th-red">SPOILER</span>
            </div>
          )}

          <span className="ml-auto text-xs font-xs hover:underline text-th-textLight">
            <a
              className={""}
              title="open source"
              href={`${post.url}`}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
            >{`(${post?.domain})`}</a>
          </span>
        </h2>
        <div className="flex flex-wrap gap-1 mt-auto text-xs text-th-textLight">
          <Link
            href={`/r/${post.subreddit}`}
            target={"_blank"}
            className="text-th-text hover:underline">
            r/{post.subreddit}

          </Link>
          •
          <Link href={`/u/${post.author}`} className="hover:underline">
            u/{post.author}
          </Link>
          <span
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
          </span>
          {post?.all_awardings?.length > 0 && (
            <>
              <div className="ml-0.5"></div>
              <Awardings
                all_awardings={post?.all_awardings}
                styles="mr-0.5 -mb-0.5"
              />
            </>
          )}
          <Link
            href={`${post.permalink}`}
            target={"_blank"}
            className="ml-auto text-xs font-semibold hover:underline">

            {post?.num_comments}comments
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MiniCard;
