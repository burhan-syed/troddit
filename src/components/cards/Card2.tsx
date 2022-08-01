import { useMainContext } from "../../MainContext";
import Link from "next/dist/client/link";
import Media from "../Media";
import { numToString, secondsToTime } from "../../../lib/utils";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "../MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import PostOptButton from "../PostOptButton";
import { GoRepoForked } from "react-icons/go";
import React from "react";
import ExternalLink from "../ui/ExternalLink";

//og card
const Card1 = ({
  post,
  hasMedia,
  hideNSFW,
  forceMute,
  postNum,
  read,
  handleClick,
  origCommentCount,
}) => {
  const context: any = useMainContext();
  const linkMode =
    context?.compactLinkPics &&
    post?.mediaInfo?.isLink &&
    !post?.mediaInfo?.isTweet &&
    post?.mediaInfo?.imageInfo?.[0]?.url &&
    !(
      post?.mediaInfo?.isIframe &&
      (context.embedsEverywhere ||
        (context.columns === 1 && !context.disableEmbeds))
    );
  return (
    <div onClick={(e) => handleClick(e)}>
      <div
        className={
          " text-sm bg-th-post hover:bg-th-postHover group  hover:shadow-2xl transition-colors border hover:cursor-pointer border-th-border2 hover:border-th-borderHighlight2  shadow-md " +
          " rounded-lg overflow-hidden"
        }
      >
        <div className="">
          {!linkMode && (
            <a
              href={post?.permalink}
              onClick={(e) => e.preventDefault()}
              onMouseDown={(e) => e.preventDefault()}
              className="relative block"
            >
              <MediaWrapper
                hideNSFW={hideNSFW}
                post={post}
                forceMute={forceMute}
                postMode={false}
                imgFull={false}
                read={read}
                card={true}
              />
            </a>
          )}
          {true && (
            <div className="p-1 px-2 pt-1.5 select-auto">
              <div className={linkMode ? " flex justify-between gap-1  " : ""}>
                <div className={linkMode ? "flex flex-col w-2/3 " : ""}>
                {linkMode && (
                    <div className="-mt-0.5  -ml-1 overflow-hidden rounded-md">
                      <ExternalLink domain={post?.domain} url={post?.url} shorten={true} />
                    </div>
                  )}
                  <h1 className="my-auto">
                    <a
                      className=""
                      href={post?.permalink}
                      onClick={(e) => e.preventDefault()}
                    >
                      <span
                        className={
                          " hover:underline font-semibold text-base mr-2 " +
                          (post?.distinguished == "moderator" || post?.stickied
                            ? " text-th-green "
                            : " ") +
                          (read && context.dimRead ? " opacity-50" : "")
                        }
                        style={{
                          wordBreak: "break-word",
                        }}
                      >{`${post?.title ?? ""}`}</span>
                    </a>
                    {(post?.link_flair_text?.length > 0 ||
                      post?.link_flair_richtext?.length > 0) && (
                      <span className="text-xs font-medium">
                        <TitleFlair post={post} />
                      </span>
                    )}
                  </h1>
                  
                </div>

                {linkMode && (
                  <a
                    href={post?.permalink}
                    onClick={(e) => e.preventDefault()}
                    onMouseDown={(e) => e.preventDefault()}
                    className="relative flex items-center justify-center w-1/3 -mt-0.5 overflow-hidden rounded-md bg-th-base aspect-video "
                  >
                    <div className="w-full">
                      <MediaWrapper
                        hideNSFW={hideNSFW}
                        post={post}
                        forceMute={forceMute}
                        postMode={false}
                        imgFull={false}
                        read={read}
                        card={true}
                        fill={true}
                      />
                    </div>
                  </a>
                )}
              </div>

              <div className="flex flex-row items-start py-1 pb-1 text-xs truncate text-th-textLight text-gray ">
                <div className="flex flex-row flex-wrap items-start ">
                  <Link href={`/r/${post?.subreddit}`}>
                    <a
                      className="mr-1"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <h2 className="font-semibold text-th-text hover:underline ">
                        r/{post?.subreddit ?? ""}
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

                  <p
                    className="ml-1"
                    title={new Date(post?.created_utc * 1000)?.toString()}
                  >
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
                    <Awardings all_awardings={post?.all_awardings} />
                  )}
                </div>

                <div
                  className={
                    "flex flex-row ml-auto " + (linkMode ? "hidden" : "")
                  }
                >
                  <a
                    title="open source"
                    href={`${post.url}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <p className="hover:underline">{`(${post?.domain})`}</p>
                  </a>
                </div>
              </div>
              <div className="flex flex-row flex-wrap items-center py-1 pt-1 text-sm select-none">
                <div className="flex flex-row items-center space-x-1 font-semibold">
                  <Vote
                    name={post?.name}
                    score={post?.score}
                    likes={post?.likes}
                    size={5}
                    postindex={postNum}
                    archived={post?.archived}
                    postTime={post?.created_utc}
                  />
                </div>
                <div className="flex flex-row items-center gap-2 ml-auto mr-6">
                  <a
                    href={post?.permalink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClick(e, true);
                    }}
                  >
                    <h1
                      className={
                        "cursor-pointer hover:underline font-semibold " +
                        " text-th-textLight group-hover:text-th-text   "
                      }
                    >
                      {`${numToString(post.num_comments, 1000)} ${
                        post.num_comments === 1 ? "comment" : "comments"
                      }`}{" "}
                      {typeof origCommentCount === "number" &&
                        post?.num_comments > origCommentCount && (
                          <span className="text-xs italic font-medium">{`(${
                            post?.num_comments - origCommentCount
                          } new)`}</span>
                        )}
                    </h1>
                  </a>
                </div>
                <div className="absolute right-3">
                  <PostOptButton post={post} postNum={postNum} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card1;
