import { useMainContext } from "../../MainContext";
import ParseBodyHTML from "../ParseBodyHTML";

import { BiComment } from "react-icons/bi";
import Link from "next/link";
import { secondsToTime } from "../../../lib/utils";
import React from "react";

const CommentCard = ({ data, postNum, handleClick }) => {
  const context: any = useMainContext();

  return (
    <div
      onClick={(e) => handleClick(e)}
      className={
        context.cardStyle === "row1"
          ? `${
              (postNum === 0 ? " border-t rounded-t-md " : " ") +
              "flex flex-row items-start py-4 pr-4 text-sm bg-th-post2 hover:bg-th-postHover group  border-l border-r border-transparent hover:border-th-borderHighlight2 "
            }`
          : `${
              (context.cardStyle === "row1" ? "  " : " rounded-lg ") +
              " text-sm shadow-md bg-th-post hover:bg-th-postHover ring-th-border2 hover:ring-th-border2  hover:shadow-2xl transition-colors ring-1  group hover:cursor-pointer p-3"
            }`
      }
    >
      <div className="flex flex-col">
        <div className="flex flex-row justify-start">
          <div
            className={
              "flex flex-row justify-center flex-none mt-1  " +
              (context.cardStyle === "row1" ? " w-14 " : "w-10 -ml-1")
            }
          >
            <BiComment className="flex-none w-6 h-6" />
          </div>

          <div className="flex flex-col">
            <div className="flex flex-row flex-wrap space-x-1">
              <Link
                href={`/u/${data?.author}`}
                title={`see u/${data?.author}'s posts`}
                onClick={(e) => {
                  e.stopPropagation();
                }}>

                <h2 className="pl-1 hover:underline">
                  u/{data?.author ?? ""}
                </h2>

              </Link>
              <span className="text-th-textLight">
                commented on
              </span>
              <Link href={data?.permalink} onClick={(e) => e.stopPropagation()}>

                <h2 className="font-semibold hover:underline">
                  {data?.link_title}
                </h2>

              </Link>
              <span className="text-th-textLight">in</span>
              <Link
                href={`/${data?.subreddit_name_prefixed}`}
                title={`go to ${data?.subreddit_name_prefixed}`}
                className=""
                onClick={(e) => {
                  e.stopPropagation();
                }}>

                <h2 className=" hover:underline">
                  {data?.subreddit_name_prefixed ?? ""}
                </h2>

              </Link>
              <p className="text-th-textLight" title={new Date(data?.created_utc * 1000)?.toString()}>
                {secondsToTime(data?.created_utc, [
                  "s ago",
                  "min ago",
                  "hr ago",
                  "dy ago",
                  "mo ago",
                  "yr ago",
                ])}
              </p>
            </div>
          </div>
        </div>
        <div className="py-2"></div>
        <div className="flex flex-row items-start justify-start">
          <div
            className={
              "flex-none " + (context.cardStyle === "row1" ? " w-14 " : "w-10")
            }
          ></div>
          <div className="flex items-start justify-start pl-2 overflow-y-auto border-l select-text border-th-border overscroll-auto max-h-40 scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
            <ParseBodyHTML html={data?.body_html} small={true} card={true} comment={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
