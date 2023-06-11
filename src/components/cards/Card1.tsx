import { useMainContext } from "../../MainContext";
import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { numToString, secondsToTime } from "../../../lib/utils";
import { GoRepoForked } from "react-icons/go";
import TitleFlair from "../TitleFlair";
import Vote from "../Vote";
import MediaWrapper from "../MediaWrapper";
import Awardings from "../Awardings";
import PostTitle from "../PostTitle";
import PostOptButton from "../PostOptButton";
import SubIcon from "../SubIcon";
import { useWindowWidth } from "@react-hook/window-size";
import { BiPlay } from "react-icons/bi";
import CardMediaOverlay from "./CardMediaOverlay";
import ExternalLink from "../ui/ExternalLink";
import PostBody from "../PostBody";

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
const MSTOLONGPRESS = 500;
//og card
const Card1 = ({
  post,
  columns,
  hasMedia,
  hideNSFW,
  forceMute,
  postNum,
  read,
  handleClick,
  origCommentCount,
  newTabLinks = false,
  uniformMediaMode = false,
  mediaDimensions = [0, 0] as [number, number],
  inView = true,
  checkCardHeight = () => {},
  newPost = false,
}) => {
  const context: any = useMainContext();
  const [touched, setTouched] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [showCardMediaOverlay, setShowCardMediaOverlay] = useState(false);
  const [mediaInfoHeight, setMediaInfoHeight] = useState(0);
  const mediaBox = useRef(null);
  const infoBox = useRef<HTMLDivElement>(null);
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
  useEffect(() => {
    setMounted(true);
  }, []);

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

  const [startLongPress, setStartLongPress] = useState(false);
  useEffect(() => {
    if (touched && windowWidth <= 640 && columns > 1) {
      setStartLongPress(true);
    } else {
      setStartLongPress(false);
    }
  }, [touched, windowWidth, columns]);
  useEffect(() => {
    let timerId;
    const onWindowScroll = () => {
      setStartLongPress(false);
      setHovered(false);
    };
    if (startLongPress) {
      window.addEventListener("scroll", onWindowScroll);
      timerId = setTimeout(() => {
        setShowCardMediaOverlay(true);
      }, MSTOLONGPRESS);
    } else {
      timerId && clearTimeout(timerId);
      window.removeEventListener("scroll", onWindowScroll);
    }

    return () => {
      timerId && clearTimeout(timerId);
      window.removeEventListener("scroll", onWindowScroll);
    };
  }, [startLongPress, showCardMediaOverlay]);

  const linkMode =
    context?.compactLinkPics &&
    !context.mediaOnly &&
    post?.mediaInfo?.isLink &&
    !post?.mediaInfo?.isTweet &&
    //post?.mediaInfo?.imageInfo?.[0]?.src &&
    !(
      post?.mediaInfo?.isIframe &&
      (context.embedsEverywhere || (columns === 1 && !context.disableEmbeds))
    );

  return (
    <>
      {showCardMediaOverlay && (
        <CardMediaOverlay
          post={post}
          voteScore={voteScore}
          setShowCardMediaOverlay={setShowCardMediaOverlay}
        />
      )}
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
          setShowCardMediaOverlay(false);
          handleClick(e);
        }}
      >
        <div
          className={
            (uniformMediaMode && !hasMedia
              ? " aspect-[9/16] flex flex-col justify-between overflow-y-auto "
              : "") +
            (!context.mediaOnly || !hasMedia
              ? "px-3 pt-3 pb-2 bg-th-post hover:bg-th-postHover  "
              : "  ") +
            (columns > 2 && context.mediaOnly && windowWidth < 640
              ? ""
              : " rounded-lg ") +
            (context.mediaOnly && hasMedia
              ? ` ring-transparent overflow-hidden ${
                  hovered ? "bg-th-post " : " "
                }  `
              : " hover:ring-th-borderHighlight2 ring-th-border2  hover:shadow-2xl  shadow-md bg-th-post hover:bg-th-postHover ") +
            (context.mediaOnly && hasMedia && hovered
              ? "  ring-b-transparent rounded-b-none ring-th-border2   "
              : " ") +
            " text-sm transition-colors ring-1 hover:cursor-pointer  "
          }
        >
          {/* <div className=""> */}
          {(!context?.mediaOnly || !hasMedia) && (
            <div>
              <div className="flex flex-row items-center py-1 text-xs truncate select-auto text-th-textLight ">
                <div
                  className={
                    "flex flex-row flex-wrap items-center text-xs truncate select-auto gap-x-1 " +
                    (linkMode ? " w-2/3 pr-2" : " ")
                  }
                >
                  <Link legacyBehavior href={`/r/${post?.subreddit}`}>
                    <a
                      title={`go to r/${post?.subreddit}`}
                      className={
                        "flex flex-row items-center mr-1 font-semibold text-th-text hover:underline "
                      }
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
                    <></>
                  )}

                  <Link legacyBehavior href={`/u/${post?.author}`}>
                    <a
                      title={`see u/${post?.author}'s posts`}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={
                        post?.crosspost_parent_list?.[0]
                          ? ""
                          : " before:content-['•'] before:pr-1 "
                      }
                    >
                      <span className="hover:underline">
                        u/{post?.author ?? ""}
                      </span>
                    </a>
                  </Link>
                  <p
                    className="before:content-['•'] before:pr-1"
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
                  {post?.num_duplicates && (
                    <span className="flex">
                      <p className="before:content-['•']">
                        {post?.num_duplicates} duplicate
                        {post?.num_duplicates === 1 ? "" : "s"}
                      </p>
                    </span>
                  )}
                  {post?.over_18 && (
                    <div className="before:content-['•'] before:pr-1">
                      <span className="text-th-red text-color ">NSFW</span>
                    </div>
                  )}
                  {post?.spoiler && (
                    <div className="before:content-['•'] before:pr-1">
                      <span className="text-th-red text-color ">SPOILER</span>
                    </div>
                  )}
                  {post?.all_awardings?.length > 0 && (
                    <>
                      <div className={"before:content-['•']"}></div>

                      <Awardings
                        all_awardings={post?.all_awardings}
                        truncate={false}
                        styles={"mt-0.5 "}
                      />
                    </>
                  )}
                </div>
                {!(columns > 1 && windowWidth / columns < 200) && mounted && (
                  <div
                    className={
                      "flex flex-row flex-none  mt-1 mb-auto ml-auto hover:underline " +
                      (linkMode ? " hidden " : " ")
                    }
                  >
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
                )}
              </div>

              <div
                className={" " + (linkMode ? " flex gap-2 pt-2 " : " py-2 ")}
              >
                <span
                  className={
                    "  text-lg font-semibold  leading-none cursor-pointer pb-2 flex flex-row flex-wrap gap-2" +
                    (linkMode
                      ? " w-2/3 flex-col-reverse items-start justify-end "
                      : " items-center ")
                  }
                >
                  <Link
                    href={post?.permalink}
                    onClick={(e) => e.preventDefault()}
                  >
                    <PostTitle
                      post={post}
                      read={read && context.dimRead}
                      newPost={newPost}
                    />
                  </Link>
                  <span className="text-sm ">
                    <TitleFlair post={post} />
                  </span>
                </span>
                {linkMode && post?.mediaInfo?.imageInfo?.[0]?.src && (
                  <>
                    {post?.crosspost_parent_list?.[0] ? (
                      <div className="relative flex items-center justify-center w-1/3 -mt-10 overflow-hidden rounded-md bg-th-base aspect-video">
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
                            cardStyle={"card1"}
                            mediaOnly={false}
                            checkCardHeight={checkCardHeight}
                          />
                        </div>
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
                        className={
                          "relative flex items-center justify-center w-1/3 -mt-10 overflow-hidden rounded-md bg-th-base aspect-video "
                        }
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
                            cardStyle={"card1"}
                            mediaOnly={false}
                            checkCardHeight={checkCardHeight}
                          />
                        </div>
                      </a>
                    )}
                  </>
                )}
              </div>
              {linkMode && (
                <div className="mt-1 -ml-1 overflow-hidden rounded-md">
                  <ExternalLink domain={post?.domain} url={post?.url} />
                </div>
              )}
            </div>
          )}

          {/* Media Only */}
          {context.mediaOnly && hasMedia ? (
            <div
              ref={mediaBox}
              className={
                (!context.mediaOnly ? "pt-1 pb-1.5" : "") + " relative  "
              }
              onMouseEnter={() => setHovered(true)}
              onMouseLeave={(e) => {
                handleMouseOut(e, mediaBox, "bot");
              }}
            >
              {hasMedia && (
                <>
                  <div
                    onContextMenuCapture={(e) => {
                      if (windowWidth < 640) {
                        e.preventDefault();
                        e.stopPropagation();
                        //columns > 1 && setShowCardMediaOverlay(true);
                      }
                    }}
                    onTouchStart={() => {
                      setTouched(true);
                      setHovered(true);
                    }}
                    onTouchEnd={() => {
                      setHovered(false);
                      setTouched(false);
                    }}
                    onTouchEndCapture={() => {
                      setTouched(false);
                      setShowCardMediaOverlay(false);
                    }}
                    className={"relative group"}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCardMediaOverlay(false);
                      handleClick(e, { toMedia: true });
                    }}
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
                      uniformMediaMode={uniformMediaMode}
                      columns={columns}
                      mediaDimensions={mediaDimensions}
                      inView={inView}
                      cardStyle={"card1"}
                      mediaOnly={true}
                      checkCardHeight={checkCardHeight}
                    />
                    {uniformMediaMode && windowWidth < 640 && mounted && (
                      <div
                        onMouseEnter={() => setHovered(true)}
                        onTouchStart={() => setHovered(true)}
                        onTouchEnd={() => setHovered(false)}
                        className={
                          "absolute bottom-0 z-20 flex flex-col justify-between w-full min-h-full " +
                          (hovered && windowWidth < 640
                            ? "bg-gradient-to-b from-black/90 via-transparent to-black/90"
                            : "bg-gradient-to-t from-black/40")
                        }
                      >
                        {post?.mediaInfo?.isVideo &&
                          mounted &&
                          (!hovered || windowWidth > 640) && (
                            <div className="absolute top-0 left-0 text-th-accent">
                              <BiPlay
                                className="flex-none w-6 h-6 md:w-10 md:h-10 "
                                style={{
                                  filter:
                                    "drop-shadow(0px 2px 2px rgba(0, 0, 0, 1))",
                                }}
                              />
                            </div>
                          )}
                        {hovered && windowWidth < 640 && mounted && (
                          <div className="p-0.5 flex flex-col gap-1">
                            <h2 className="inline-flex flex-wrap items-center gap-1 text-sm font-light ">
                              {post.title}
                              <span className="text-xs">
                                <TitleFlair
                                  post={post}
                                  padding={"py-0 px-2"}
                                  noClick={true}
                                />
                              </span>
                            </h2>
                            <span className="text-xs font-light truncate">
                              r/{post.subreddit}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between w-full mt-auto pb-0.5 gap-0.5">
                          <span className="text-xs font-light truncate md:pl-1">
                            u/{post.author}
                          </span>
                          <span
                            className={
                              " text-white text-xs font-light flex items-center gap-0.5 pr-0.5 " +
                              (post?.likes === true || post?.likes === 1
                                ? " text-th-upvote "
                                : post?.likes === false || post?.likes === -1
                                ? " text-th-downvote "
                                : "")
                            }
                          >
                            <span>{voteScore}</span>
                            <span className="flex-none w-3 h-3 mb-0.5 opacity-60">
                              {VoteFilledUp}
                            </span>
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  {!hovered && windowWidth > 640 && mounted && (
                    <>
                      {post?.mediaInfo?.isVideo &&
                        !hovered &&
                        uniformMediaMode && (
                          <div className="absolute top-0 left-0 text-th-accent">
                            <BiPlay
                              className="flex-none w-6 h-6 md:w-10 md:h-10 "
                              style={{
                                filter:
                                  "drop-shadow(0px 2px 2px rgba(0, 0, 0, 1))",
                              }}
                            />
                          </div>
                        )}
                      <div className="absolute bottom-0 w-full text-white bg-gradient-to-t from-black/20">
                        <div className="flex justify-between w-full mt-auto pb-0.5 gap-0.5">
                          <span className="text-xs font-light truncate md:pl-1">
                            u/{post.author} • r/{post.subreddit}
                          </span>
                          <span
                            className={
                              " text-white text-xs font-light flex items-center gap-0.5 pr-0.5 " +
                              (post?.likes === true || post?.likes === 1
                                ? " text-th-upvote "
                                : post?.likes === false || post?.likes === -1
                                ? " text-th-downvote "
                                : "")
                            }
                          >
                            <span>{voteScore}</span>
                            <span className="flex-none w-3 h-3 mb-0.5 opacity-60">
                              {VoteFilledUp}
                            </span>
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            !linkMode &&
            hasMedia && (
              <>
                {post?.crosspost_parent_list?.[0] ? (
                  <div className="relative block pt-1 pb-1.5 ">
                    <MediaWrapper
                      hideNSFW={hideNSFW}
                      post={post}
                      forceMute={forceMute}
                      postMode={false}
                      imgFull={false}
                      read={read}
                      card={true}
                      handleClick={handleClick}
                      columns={columns}
                      mediaDimensions={mediaDimensions}
                      inView={inView}
                      cardStyle={"card1"}
                      mediaOnly={false}
                      checkCardHeight={checkCardHeight}
                    />
                  </div>
                ) : (
                  <a
                    aria-label={post?.title}
                    href={post?.permalink}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowCardMediaOverlay(false);
                      handleClick(e, { toMedia: true });
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                    }}
                    className={"relative block pt-1 pb-1.5 "}
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
                      columns={columns}
                      mediaDimensions={mediaDimensions}
                      inView={inView}
                      cardStyle={"card1"}
                      mediaOnly={false}
                      checkCardHeight={checkCardHeight}
                    />
                  </a>
                )}
              </>
            )
          )}

          {post?.selftext_html && !context.mediaOnly && (
            <div className={"flex items-center w-full"}>
              <PostBody
                newTabLinks={newTabLinks}
                rawHTML={post.selftext_html}
                mode="card"
                limitHeight={post?.mediaInfo?.isDual ? 128 : 384}
              />
            </div>
          )}

          {(!context.mediaOnly || !hasMedia) && (
            <div className="flex flex-row flex-wrap py-1 pt-1 text-sm font-semibold align-bottom select-none">
              <div className="flex flex-row items-center space-x-1 ">
                <Vote
                  name={post?.name}
                  score={post?.score}
                  likes={post?.likes}
                  size={5}
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
                    setShowCardMediaOverlay(false);
                    handleClick(e, { toComments: true });
                  }}
                >
                  <span
                    className={
                      "cursor-pointer hover:underline" +
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
                  </span>
                </a>
                <PostOptButton post={post} mode="" />
              </div>
            </div>
          )}
        </div>
        {/* </div> */}
        {context.mediaOnly &&
          hasMedia &&
          (!uniformMediaMode || windowWidth >= 640) &&
          mounted && (
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
                <span className="">
                  <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
                    <span
                      className={
                        " hover:underline font-light text-xs md:font-semibold md:text-base mr-2 " +
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
                </span>

                <div className="flex flex-row items-start py-1 pb-1 text-xs truncate text-th-textLight">
                  <div className="flex flex-row flex-wrap items-start ">
                    <Link legacyBehavior href={`/r/${post?.subreddit}`}>
                      <a
                        className={"mr-1 "}
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
                        <span className="italic font-semibold">
                          crosspost by
                        </span>
                      </div>
                    ) : (
                      <p>•</p>
                    )}
                    <Link legacyBehavior href={`/u/${post?.author}`}>
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
                <div
                  className={
                    "flex flex-row flex-wrap items-center text-sm select-none pt-1 py-1 "
                  }
                >
                  <div className="flex flex-row items-center space-x-1 font-semibold">
                    <Vote
                      name={post?.name}
                      score={post?.score}
                      likes={post?.likes}
                      size={5}
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
                        setShowCardMediaOverlay(false);
                        handleClick(e, { toComments: true });
                      }}
                    >
                      <span
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
                      </span>
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
                  <PostOptButton post={post} mode={"media"} />
                </div>
              )}
            </div>
          )}
      </div>
    </>
  );
};

export default Card1;
