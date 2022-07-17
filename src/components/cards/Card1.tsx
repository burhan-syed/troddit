import { useMainContext } from "../../MainContext";
import React,{ useState, useEffect, useRef } from "react";
import Link from "next/dist/client/link";
import { numToString, secondsToTime } from "../../../lib/utils";
import { GoRepoForked } from "react-icons/go";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "../MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import PostOptButton from "../PostOptButton";
import SubIcon from "../SubIcon";

//og card
const Card1 = ({
  post,
  hasMedia,
  hideNSFW,
  forceMute,
  postNum,
  read,
  handleClick,
  origCommentCount
}) => {
  const context: any = useMainContext();
  const [hovered, setHovered] = useState(false);
  const [mediaInfoHeight, setMediaInfoHeight] = useState(0);
  const mediaBox = useRef(null);
  const infoBox = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (context.mediaOnly && hasMedia && infoBox.current) {
      let h = infoBox.current.clientHeight;
      if (h > 0) {
        setMediaInfoHeight(h);
      }
    }
  }, [infoBox?.current?.clientHeight, context.mediaOnly, hasMedia, hovered]);

  const handleMouseOut = (e, box, ignore) => {
    const sideout = () => {
      let elemBounding = box?.current?.getBoundingClientRect();
      let topDist = Math.abs(elemBounding.top - e.clientY);
      let botDist = Math.abs(elemBounding.bottom - e.clientY);
      let leftDist = Math.abs(elemBounding.left - e.clientX);
      let rightDist = Math.abs(elemBounding.right - e.clientX);
      let min = Math.min(topDist, botDist, leftDist, rightDist);
      //console.log(elemBounding);
      switch (min) {
        case topDist:
          return "top";
          break;
        case botDist:
          return "bot";
          break;
        case rightDist:
          return "right";
          break;
        case leftDist:
          return "left";
          break;
      }
    };
    let side = sideout();
    if (side !== ignore) {
      setHovered(false);
    }
  };

  return (
    <div
      className={
        "relative " +
        (context.mediaOnly && hasMedia && (hovered ? " z-20 " : " z-0")) +
        (context.mediaOnly && hasMedia
          ? " hover:scale-101 group hover:transition-transform transition-transform "
          : "")
      }
      onClick={(e) => {
        setHovered(false);
        handleClick(e);
      }}
    >
      <div
        className={
          (!context.mediaOnly || !hasMedia
            ? "px-3 pt-3 pb-2 bg-th-post hover:bg-th-postHover  "
            : "  ") +
          " rounded-lg    " +
          (context.mediaOnly && hasMedia
            ? " border-transparent overflow-clip "
            : " hover:border-th-borderHighlight2 border-th-border2  hover:shadow-2xl  shadow-md group bg-th-post hover:bg-th-postHover ") +
          (context.mediaOnly && hasMedia && hovered
            ? "  border-b-transparent rounded-b-none border-th-border2   "
            : " ") +
          " text-sm transition-colors border hover:cursor-pointer "
        }
      >
        <div className="">
          {(!context?.mediaOnly || !hasMedia) && (
            <div>
              <div className="flex flex-row items-center py-1 text-xs truncate select-auto text-th-textLight ">
                <div className="flex flex-row flex-wrap items-center text-xs truncate select-auto ">
                  <Link href={`/r/${post?.subreddit}`}>
                    <a
                      title={`go to r/${post?.subreddit}`}
                      className="flex flex-row items-center mr-1 font-semibold text-th-text hover:underline "
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      {/* Only getting sr_detail form api if on multis/front/all/popular/user account*/}
                      {post?.sr_detail && (
                        <div className="w-6 h-6 mr-1 rounded-full ">
                          <SubIcon subInfo={post?.sr_detail} />
                        </div>
                      )}

                      <h2 className="">r/{post?.subreddit ?? ""}</h2>
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
                      <span className="text-th-red text-color ">NSFW</span>
                    </div>
                  )}
                  {post?.spoiler && (
                    <div className="flex flex-row pl-1 space-x-1">
                      <p>•</p>
                      <span className="text-th-red text-color ">SPOILER</span>
                    </div>
                  )}
                  <div className="mx-1"></div>
                  {post?.all_awardings?.length > 0 && (
                    <Awardings
                      all_awardings={post?.all_awardings}
                      truncate={false}
                      styles={"mr-0.5 mt-0.5"}
                    />
                  )}
                </div>
                <div className="flex flex-row flex-none mt-1 mb-auto ml-auto hover:underline">
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
                    <PostTitle post={post} read={read && context.dimRead} />
                  </a>
                  <span className="text-sm ">
                    <TitleFlair post={post} />
                  </span>
                </h1>
              </div>
            </div>
          )}

          {/* Media Only */}
          {context.mediaOnly ? (
            <div
              ref={mediaBox}
              className={
                (!context.mediaOnly ? "pt-1 pb-1.5" : undefined) + " relative  "
              }
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={(e) => {
                handleMouseOut(e, mediaBox, "bot");
              }}
            >
              {hasMedia && (
                <div className={"relative group"}>
                  <MediaWrapper
                    hideNSFW={hideNSFW}
                    post={post}
                    forceMute={forceMute}
                    postMode={false}
                    imgFull={false}
                    read={read}
                    card={true}
                  />
                </div>
              )}
            </div>
          ) : (
            <a
            aria-label={post?.title}
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
                  postMode={false}
                  imgFull={false}
                  read={read}
                  card={true}
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
                  archived={post?.archived}
                  postTime={post?.created_utc}
                />
              </div>
              <div className="flex flex-row items-center justify-end gap-2 ml-auto -mr-2">
                <a
                  href={post?.permalink}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setHovered(false);
                    handleClick(e, true);
                  }}
                >
                  <h1
                    className={
                      "cursor-pointer hover:underline" +
                      " text-th-textLight group-hover:text-th-text   "
                    }
                  >
                    {`${numToString(post.num_comments, 1000)} ${
                      post.num_comments === 1 ?  "comment" : "comments"
                    }`} {((typeof origCommentCount === "number") && (post?.num_comments > origCommentCount)) && <span className="text-xs italic font-medium">{`(${post?.num_comments - origCommentCount} new)`}</span>}
                  </h1>
                </a>
                <PostOptButton post={post} postNum={postNum} mode="" />
              </div>
            </div>
          )}
        </div>
      </div>
      {context.mediaOnly && hasMedia && (
        <div
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={(e) => {
            handleMouseOut(e, infoBox, "top");
          }}
        >
          <div
            ref={infoBox}
            className={
              (hovered ? "" : " hidden ") +
              " absolute w-full mr-1 px-2 pb-1  -mt-8 rounded-b-lg border-t-0 -z-10 drop-shadow-xl bg-th-post border-th-border2 border-t-transparent border shadow-2xl"
            }
          >
            <div className="bg-transparent pt-9"></div>
            <h1 className="">
              <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                <span
                  className={
                    " hover:underline font-semibold text-base mr-2 " +
                    (post?.distinguished == "moderator" || post?.stickied
                      ? " text-th-green "
                      : " ") +
                    (read && context.dimRead ? " opacity-50 " : "")
                  }
                >{`${post?.title ?? ""}`}</span>
              </a>
              {(post?.link_flair_text?.length > 0 ||
                post?.link_flair_richtext?.length > 0) && (
                <span className="text-xs font-medium">
                  <TitleFlair post={post} />
                </span>
              )}
            </h1>

            <div className="flex flex-row items-start py-1 pb-1 text-xs truncate text-th-textLight">
              <div className="flex flex-row flex-wrap items-start ">
                <Link href={`/r/${post?.subreddit}`}>
                  <a
                    className="mr-1"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <h2 className="font-semibold text-th-text hover:underline">
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
                    <span className="text-th-red ">NSFW</span>
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
              <div className="flex flex-row ml-auto">
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
                    setHovered(false);
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
                    }`} {((typeof origCommentCount === "number") && (post?.num_comments > origCommentCount)) && <span className="text-xs italic font-medium">{`(${post?.num_comments - origCommentCount} new)`}</span>}
                  </h1>
                </a>
              </div>
            </div>
          </div>
          {hovered && (
            <div
              className="absolute right-2 "
              style={{
                bottom: `-${mediaInfoHeight - 36}px`, //36px == pt-9
              }}
            >
              <PostOptButton post={post} postNum={postNum} mode={"media"} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Card1;
