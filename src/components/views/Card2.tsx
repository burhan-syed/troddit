import { useMainContext } from "../../MainContext";
import Link from "next/dist/client/link";
import Media from "../Media";
import { secondsToTime } from "../../../lib/utils";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";

//og card
const Card1 = ({
  post,
  hasMedia,
  hideNSFW,
  score,
  vote,
  castVote,
  forceMute,
}) => {
  const context: any = useMainContext();
  return (
    <div>
      <div
        className={
          // (!context.mediaOnly || !hasMedia || hideNSFW
          //   ? "px-3 pt-3 pb-2 "
          //   : "  ") +
          // (!context.mediaOnly && " rounded-md ") +
          (context?.columnOverride == 1 && "") +
          " text-sm bg-lightPost group hover:bg-lightPostHover dark:hover:bg-darkPostHover hover:shadow-2xl transition-colors border hover:cursor-pointer border-gray-300 shadow-md dark:bg-trueGray-900 dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-400"
        }
      >
        <div className="">
          <div className={""}>
            <div
              className={"relative group" + (hideNSFW && " overflow-hidden")}
            >
              <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                <div className={hideNSFW && " blur-3xl"}>
                  <Media post={post} />
                </div>
              </a>
              {hideNSFW && (
                <div className="absolute flex flex-row justify-center w-full opacity-50 text-lightText top-1/2">
                  hidden
                </div>
              )}
            </div>
          </div>

          {/* <p>{post?.url ?? "ERR"}</p> */}
          {true && (
            <div className="p-1 px-2 pt-1.5 select-auto">
              <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                <h1
                  className={
                    (post?.distinguished == "moderator" &&
                      " text-green-500 dark:text-green-700") +
                    "  text-lg font-semibold  leading-none cursor-pointer"
                  }
                >
                  {post?.title ?? ""}
                  {post?.link_flair_richtext?.length > 0 && (
                    <span className="text-xs">
                      {"  "}
                      <TitleFlair post={post} />
                    </span>
                  )}
                </h1>
              </a>

              <div className="flex flex-row py-1 pb-1 text-xs truncate text-gray">
                <Link href={`/r/${post?.subreddit}`}>
                  <a
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <h2 className="font-semibold hover:underline">
                      r/{post?.subreddit ?? ""}
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
                    "s",
                    "min",
                    "hr",
                    "dy",
                    "mo",
                    "yr",
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

                <div className="flex flex-row ml-auto">
                  <p className="ml-1">{`(${post.domain})`}</p>
                </div>
              </div>

              <div className="flex flex-row justify-between py-1 pt-1 text-sm align-bottom select-none">
                <div className="flex flex-row items-center space-x-1 font-semibold">
                  <Vote
                    name={post?.name}
                    score={post?.score}
                    likes={post?.likes}
                    size={5}
                  />
                </div>
                <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                  <h1 className="font-sans cursor-pointer group-hover:underline">
                    {`${post.num_comments} ${
                      post.num_comments === 1 ? "comment" : "comments"
                    }`}
                  </h1>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card1;
