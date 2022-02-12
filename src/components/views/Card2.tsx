import { useMainContext } from "../../MainContext";
import Link from "next/dist/client/link";
import Media from "../Media";
import { secondsToTime } from "../../../lib/utils";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "./MediaWrapper";
import Awardings from "../Awardings";

//og card
const Card1 = ({
  post,
  hasMedia,
  hideNSFW,
  score,
  vote,
  castVote,
  forceMute,
  postNum,
}) => {
  const context: any = useMainContext();
  return (
    <div>
      <div
        className={
          (context?.columnOverride == 1 && "") +
          " text-sm bg-lightPost group hover:bg-lightPostHover dark:hover:bg-darkPostHover hover:shadow-2xl transition-colors border hover:cursor-pointer border-gray-300 shadow-md dark:bg-darkBG dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-400"
        }
      >
        <div className="">
          <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
            <MediaWrapper
              hideNSFW={hideNSFW}
              post={post}
              forceMute={forceMute}
              allowIFrame={false}
              postMode={false}
              imgFull={false}
            />
          </a>
          {true && (
            <div className="p-1 px-2 pt-1.5 select-auto">
              <h1
                className={
                  (post?.distinguished == "moderator " ||
                    (post?.stickied && " text-green-500 dark:text-green-700")) +
                  "  text-lg font-semibold  leading-none cursor-pointer gap-2 flex flex-row flex-wrap "
                }
              >
                <a
                  href={post?.permalink}
                  onClick={(e) => e.preventDefault()}
                  className="group-hover:underline"
                >
                  {post?.title ?? ""}
                </a>

                <span className="text-sm">
                  <TitleFlair post={post} />
                </span>
              </h1>

              <div className="flex flex-row flex-wrap items-center py-1 pb-1 text-xs truncate text-gray">
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

                <div className="flex flex-row ">
                  <p className="ml-1">{`(${post?.domain})`}</p>
                </div>
              </div>

              <div className="flex flex-row justify-between py-1 pt-1 text-sm align-bottom select-none">
                <div className="flex flex-row items-center space-x-1 font-semibold">
                  <Vote
                    name={post?.name}
                    score={post?.score}
                    likes={post?.likes}
                    size={5}
                    postindex={postNum}
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
