import { useMainContext } from "../../MainContext";
import ParseBodyHTML from "../ParseBodyHTML";

import { BiComment } from "react-icons/bi";
import Link from "next/link";
import { secondsToTime } from "../../../lib/utils";

const CommentCard = ({ data, postNum }) => {
  const context: any = useMainContext();

  return (
    <div
      className={
        context.cardStyle === "row1"
          ? `${
              (postNum === 0 ? " border-t rounded-t-md " : " ") +
              "flex flex-row items-start py-4 pr-4 text-sm bg-lightPost dark:bg-[#212121] dark:hover:bg-darkPostHover group hover:bg-lightPostHover hover:border-l hover:border-r border-gray-300  dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-500  "
            }`
          : `${
              (context.mediaOnly || context.cardStyle === "card2"
                ? "  "
                : " rounded-md ") +
              " text-sm bg-lightPost hover:bg-lightPostHover dark:hover:bg-darkPostHover hover:shadow-2xl transition-colors border  group hover:cursor-pointer border-gray-300 shaadow-md dark:bg-darkBG dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-400 p-3"
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
              <Link href={`/u/${data?.author}`}>
                <a
                  title={`see u/${data?.author}'s posts`}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <h2 className="pl-1 hover:underline">
                    u/{data?.author ?? ""}
                  </h2>
                </a>
              </Link>
              <span className="text-gray-400 dark:text-gray-500">
                commented on
              </span>
              <Link href={data?.permalink}>
                <a onClick={(e) => e.stopPropagation()}>
                  <h2 className="font-semibold hover:underline">{data?.link_title}</h2>
                </a>
              </Link>
              <span className="text-gray-400 dark:text-gray-500">in</span>
              <Link href={`/${data?.subreddit_name_prefixed}`}>
                <a
                  title={`go to ${data?.subreddit_name_prefixed}`}
                  className=""
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <h2 className=" hover:underline">
                    {data?.subreddit_name_prefixed ?? ""}
                  </h2>
                </a>
              </Link>
              <p className="text-gray-400 dark:text-gray-500">
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
          <div className="flex items-start justify-start pl-2 overflow-y-auto border-l select-text overscroll-auto scrollbar-thin scrollbar-thumb-lightScroll dark:scrollbar-thumb-darkScroll max-h-40">
            <ParseBodyHTML html={data?.body_html} small={true} card={true} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentCard;
