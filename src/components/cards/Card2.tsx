import { useMainContext } from "../../MainContext";
import Link from "next/link";
import Media from "../Media";
import { numToString, secondsToTime } from "../../../lib/utils";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "../MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import PostOptButton from "../PostOptButton";
import { GoRepoForked } from "react-icons/go";
import { BiComment } from "react-icons/bi";
import React, { useEffect, useMemo, useState } from "react";
import { useWindowWidth } from "@react-hook/window-size";
import ExternalLink from "../ui/ExternalLink";

const VoteFilledUp = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.781,2.375C12.4,1.9,11.6,1.9,11.219,2.375l-8,10c-0.24,0.301-0.286,0.712-0.12,1.059C3.266,13.779,3.615,14,4,14h2h2 v3v4c0,0.553,0.447,1,1,1h6c0.553,0,1-0.447,1-1v-5v-2h2h2c0.385,0,0.734-0.221,0.901-0.566c0.166-0.347,0.12-0.758-0.12-1.059 L12.781,2.375z"></path>
  </svg>
);

const Card2 = ({
  post,
  columns,
  hasMedia,
  hideNSFW,
  forceMute,
  postNum,
  read,
  handleClick,
  origCommentCount,
  mediaDimensions = [0, 0] as [number, number],
  checkCardHeight = () => {},
  inView = true,
  newPost = false,
}) => {
  const context: any = useMainContext();
  const windowWidth = useWindowWidth();
  const [mounted, setMounted] = useState(false);
  const voteScore = useMemo(() => {
    let x = post?.score ?? 0;
    if (x < 1000) {
      return x.toString(); // + (x === 1 ? " pt" : " pts");
    } else {
      let y = Math.floor(x / 1000);
      let z = (x / 1000).toFixed(1);
      return z.toString() + "k";
    }
  }, [post?.score]);
  const linkMode =
    context?.compactLinkPics &&
    post?.mediaInfo?.isLink &&
    !post?.mediaInfo?.isTweet &&
    // post?.mediaInfo?.imageInfo?.[0]?.url &&
    !(
      post?.mediaInfo?.isIframe &&
      (context.embedsEverywhere || (columns === 1 && !context.disableEmbeds))
    );
  useEffect(() => {
    setMounted(true); 
  }, [])
  
  return (
    <div onClick={(e) => handleClick(e)}>
      <div
        className={
          " text-sm bg-th-post hover:bg-th-postHover group  hover:shadow-2xl transition-colors ring-1 hover:cursor-pointer ring-th-border2 hover:ring-th-borderHighlight2  shadow-md " +
          " rounded-lg overflow-hidden"
        }
      >
        <div className="">
          {!linkMode && (
            <>
              {post?.crosspost_parent_list?.[0] ? (
                <div className={"relative block"}>
                  <MediaWrapper
                    hideNSFW={hideNSFW}
                    post={post}
                    forceMute={forceMute}
                    postMode={false}
                    imgFull={false}
                    read={read}
                    card={true}
                    handleClick={handleClick}
                    inView={inView}
                    columns={columns}
                    mediaDimensions={mediaDimensions}
                    cardStyle={"card2"}
                    mediaOnly={false}
                    checkCardHeight={checkCardHeight}
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
                  className={"relative block"}
                >
                  <MediaWrapper
                    hideNSFW={hideNSFW}
                    post={post}
                    forceMute={forceMute}
                    postMode={false}
                    imgFull={false}
                    read={read}
                    card={true}
                    handleClick={handleClick}
                    inView={inView}
                    columns={columns}
                    mediaDimensions={mediaDimensions}
                    cardStyle={"card2"}
                    mediaOnly={false}
                    checkCardHeight={checkCardHeight}
                  />
                </a>
              )}
            </>
          )}
          {true && (
            <div className="p-1 px-2 pt-1.5 select-auto">
              <div className={linkMode ? " flex justify-between gap-1  " : ""}>
                <div className={linkMode ? "flex flex-col w-2/3 " : ""}>
                  {linkMode && (
                    <div className="-mt-0.5  -ml-1 overflow-hidden rounded-md">
                      <ExternalLink
                        domain={post?.domain}
                        url={post?.url}
                        shorten={true}
                      />
                    </div>
                  )}
                  <h1 className="my-auto">
                    <Link
                      className=""
                      href={post?.permalink}
                      onClick={(e) => e.preventDefault()}
                    >
                      <span
                        className={
                          " hover:underline font-normal text-sm sm:text-base mr-2 " +
                          (post?.distinguished == "moderator" || post?.stickied
                            ? " text-th-green "
                            : " ") +
                          (read && context.dimRead ? " opacity-50" : "")
                        }
                        style={{
                          wordBreak: "break-word",
                        }}
                      >{`${post?.title ?? ""}`}</span>
                    </Link>
                    {(post?.link_flair_text?.length > 0 ||
                      post?.link_flair_richtext?.length > 0) && (
                      <span className="mr-2 text-xs font-medium">
                        <TitleFlair
                          post={post}
                          padding={
                            columns > 1 && windowWidth < 640
                              ? " px-1 "
                              : "p-0.5 px-1 "
                          }
                        />
                      </span>
                    )}
                    {newPost && (
                      <span className="text-xs italic font-light text-th-textLight">{`(new)`}</span>
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
                        columns={columns}
                        cardStyle={"card2"}
                        mediaOnly={false}
                      />
                    </div>
                  </a>
                )}
              </div>

              <div className="flex flex-row items-start py-1 pb-1 text-xs font-light truncate sm:font-normal text-th-textLight text-gray ">
                <div className="flex flex-row flex-wrap items-start">
                  <Link legacyBehavior href={`/r/${post?.subreddit}`}>
                    <a
                      className={"mr-1 "}
                      onClick={(e) => {
                        e.stopPropagation();
                        windowWidth < 640 && e.preventDefault();
                      }}
                    >
                      <h2 className="sm:font-semibold text-th-text sm:hover:underline ">
                        r/{post?.subreddit ?? ""}
                      </h2>
                    </a>
                  </Link>
                  {post?.crosspost_parent_list?.[0] ? (
                    <div className="flex flex-row ">
                      <GoRepoForked className="flex-none w-4 h-4 mr-1 rotate-90" />
                      <span
                        className={
                          (columns > 1 ? " hidden sm:block " : " ") +
                          " italic font-semibold"
                        }
                      >
                        crosspost by
                      </span>
                    </div>
                  ) : (
                    <p className="mr-1">•</p>
                  )}
                  <Link legacyBehavior href={`/u/${post?.author}`}>
                    <a
                      onClick={(e) => {
                        e.stopPropagation();
                        windowWidth < 640 && e.preventDefault();
                      }}
                      className={"flex "}
                    >
                      <h2 className={"mr-1 ml-1 sm:hover:underline"}>
                        u/{post?.author ?? ""}
                      </h2>
                      <p className={columns > 1 ? " hidden sm:block " : "  "}>
                        •
                      </p>
                    </a>
                  </Link>

                  <p
                    className={
                      (columns > 1 ? " hidden sm:block " : " ") + " ml-1"
                    }
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
                    <div
                      className={
                        (columns > 1 ? " hidden sm:flex " : "flex ") +
                        " pl-1 space-x-1"
                      }
                    >
                      <p>•</p>
                      <span className="text-th-red">NSFW</span>
                    </div>
                  )}
                  {post?.spoiler && (
                    <div
                      className={
                        (columns > 1 ? " hidden sm:flex " : "flex ") +
                        " pl-1 space-x-1"
                      }
                    >
                      <p>•</p>
                      <span className="text-th-red">SPOILER</span>
                    </div>
                  )}
                  <div className="mx-0.5"></div>
                  {post?.all_awardings?.length > 0 &&
                    !(columns > 1 && windowWidth < 640 && mounted) && (
                      <Awardings all_awardings={post?.all_awardings} />
                    )}
                </div>
                <div
                  className={
                    (columns > 1
                      ? " hidden sm:flex sm:ml-auto "
                      : "flex ml-auto ") + " "
                  }
                >
                  <a
                    className={
                      context.clickCount > 10 && Math.random() > 0.3
                        ? " click-zone "
                        : ""
                    }
                    title="open source"
                    href={`${post.url}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => {
                      e.stopPropagation();
                      windowWidth < 640 && e.preventDefault();
                    }}
                  >
                    <p className="hover:underline">{`(${post?.domain})`}</p>
                  </a>
                </div>
              </div>
              <div className="flex flex-row flex-wrap items-center py-1 pt-1 text-sm select-none">
                <div
                  className={
                    " items-center space-x-1 font-semibold " +
                    (columns > 1 ? " hidden sm:flex " : " flex")
                  }
                >
                  <Vote
                    name={post?.name}
                    score={post?.score}
                    likes={post?.likes}
                    size={5}
                    archived={post?.archived}
                    postTime={post?.created_utc}
                  />
                </div>
                <span
                  className={
                    (columns > 1 ? " sm:hidden " : " hidden ") +
                    " text-th-textLight text-xs flex items-center gap-0.5 " +
                    (post?.likes === true || post?.likes === 1
                      ? " text-th-upvote "
                      : post?.likes === false || post?.likes === -1
                      ? " text-th-downvote "
                      : "")
                  }
                >
                  <span className="flex-none w-4 h-4">{VoteFilledUp}</span>
                  {voteScore}
                </span>
                <div
                  className={
                    (columns > 1 ? " ml-2 sm:ml-auto " : " ml-auto ") +
                    "flex  flex-row items-center gap-2  mr-6"
                  }
                >
                  <a
                    className={
                      context.clickCount > 10 && Math.random() > 0.3
                        ? " click-zone "
                        : ""
                    }
                    href={post?.permalink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleClick(e, { toComments: true });
                    }}
                  >
                    <h2
                      className={
                        (columns > 1 ? " hidden sm:block " : " ") +
                        "cursor-pointer hover:underline font-semibold  " +
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
                    </h2>
                    <span
                      className={
                        (columns > 1 ? " flex sm:hidden " : " hidden ") +
                        " items-center text-xs text-th-textLight gap-0.5 mr-1"
                      }
                    >
                      <BiComment className="flex-none w-4 h-4" />
                      {numToString(post.num_comments, 1000)}
                    </span>
                  </a>
                </div>
                <div className="absolute right-3">
                  <PostOptButton post={post} mode={"card2"} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Card2;
