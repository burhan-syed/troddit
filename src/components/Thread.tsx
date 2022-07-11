import { useEffect, useState, useRef, useMemo, useLayoutEffect } from "react";
import Comments from "./Comments";
import Link from "next/dist/client/link";
import { useWindowSize } from "@react-hook/window-size";
import { useSession } from "next-auth/react";
import { BiDownvote, BiUpvote, BiExpand, BiCollapse } from "react-icons/bi";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { BiComment, BiExit } from "react-icons/bi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { ImReddit } from "react-icons/im";
import { IoMdRefresh } from "react-icons/io";
import { BsReply, BsArchive, BsShieldX, BsLock } from "react-icons/bs";
// import { usePlausible } from "next-plausible";

import { useKeyPress } from "../hooks/KeyPress";
import { secondsToTime } from "../../lib/utils";
import { findMediaInfo } from "../../lib/utils";

import { useMainContext } from "../MainContext";

import TitleFlair from "./TitleFlair";
import CommentSort from "./CommentSort";
import CommentReply from "./CommentReply";
import Vote from "./Vote";
import MediaWrapper from "./MediaWrapper";
import Awardings from "./Awardings";
import PostTitle from "./PostTitle";
import SaveButton from "./SaveButton";
import UserFlair from "./UserFlair";
import PostOptButton from "./PostOptButton";
import { GoRepoForked } from "react-icons/go";
import SubIcon from "./SubIcon";
import useThread from "../hooks/useThread";
import { QueryClient, useQueryClient } from "react-query";
import useSubreddit from "../hooks/useSubreddit";
import ErrMessage from "./ErrMessage";

const Thread = ({
  permalink,
  sort = "top",
  updateSort,
  initialData,
  withContext = false,
  commentMode = false,
  commentsDirect = false,
  goBack = () => {},
}) => {
  const context: any = useMainContext();
  const { data: session, status } = useSession();
  const { thread } = useThread(permalink, sort, undefined, withContext);
  const [windowWidth, windowHeight] = useWindowSize();

  //initPost so later refetches will keep media (ie videos) stable
  const [initPost, setInitPost] = useState<any>(() =>
    initialData?.name?.includes("t3_") ? initialData : {}
  );
  const [post, setPost] = useState<any>(() =>
    initialData?.name?.includes("t3_") ? initialData : {}
  );
  const { sub } = useSubreddit(post?.subreddit);

  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentsReady, setCommentsReady] = useState(false);
  const [prevCount, setPrevCount] = useState<number>();
  const [mediaInfo, setMediaInfo] = useState<any>();
  const [usePortrait, setUsePortrait] = useState<boolean | undefined>(
    undefined
  );
  const [imgFull, setimgFull] = useState(false);

  const portraitDivRef = useRef<any>(null);
  const [pHeight, setpHeight] = useState();
  const [pWidth, setpWidth] = useState();

  useEffect(() => {
    if (thread?.data?.pages?.[0]?.post?.name) {
      //only set post if it's not already set from initialData or if it's overwriting another type of post eg. ("t1_" from direct opening a comment)
      if (!initPost?.name?.includes("t3_")) {
        setInitPost(thread?.data?.pages?.[0].post);
      }
      setPrevCount(post?.num_comments);
      setPost(thread?.data?.pages?.[0].post);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.data?.pages]);

  useEffect(() => {
    if (thread?.data?.pages?.[0]?.comments?.length > 0) {
      let comments =
        thread.data?.pages?.map((page) => page.comments)?.flat() ?? [];
      comments = comments?.filter(
        (c, i) => c?.kind === "t1" || comments?.length - 1 === i
      );
      setPostComments(comments);
    } else if (thread?.data?.pages?.[0]) {
      setCommentsReady(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [thread.data?.pages]);

  useEffect(() => {
    const getMediaInfo = async (post) => {
      const domain = window?.location?.hostname ?? 'www.troddit.com';
      const mInfo = await findMediaInfo(post, false, domain);
      setMediaInfo(mInfo);
    };

    context?.autoRead &&
      context.addReadPost({
        postId: post?.name,
        numComments: post?.num_comments,
      });

    if (post?.mediaInfo) {
      setMediaInfo(post?.mediaInfo);
    } else if (post) {
      getMediaInfo(post);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  useLayoutEffect(() => {
    if (
      windowWidth > 1300 &&
      windowHeight < windowWidth &&
      context?.postWideUI &&
      mediaInfo
    ) {
      usePortrait === undefined &&
        setUsePortrait(mediaInfo?.isPortrait ? true : false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaInfo]);
  useEffect(() => {
    if (windowWidth < 1300 && usePortrait) setUsePortrait(false);
  }, [windowWidth]);

  useEffect(() => {
    if (usePortrait) {
      setpHeight(portraitDivRef?.current?.clientHeight);
      setpWidth(portraitDivRef?.current?.clientWidth);
    }
  }, [usePortrait]);

  const commentsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const executeScroll = () => {
      commentsRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    };

    if (commentsRef?.current && commentsDirect && postComments?.length > 0)
      executeScroll();
  }, [commentsRef, commentsDirect, postComments]);

  const [hideNSFW, setHideNSFW] = useState(false);
  useEffect(() => {
    context.nsfw === false && post?.over_18
      ? setHideNSFW(true)
      : post?.spoiler
      ? setHideNSFW(true)
      : setHideNSFW(false);
    return () => {
      setHideNSFW(false);
    };
  }, [post, context?.nsfw]);

  const [openReply, setopenReply] = useState(false);
  const updateMyReplies = () => {};

  const postPlaceHolder = useMemo(
    () => (
      <div className="w-full mb-3 border rounded-lg pointer-events-none border-th-border2 bg-th-background2">
        {/* Flex container */}
        <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
          {/* Upvote column */}
          <div className="flex-col flex-none items-center self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex animate-pulse ">
            <BiUpvote
              className={
                " flex-none cursor-pointer w-7 h-7 hover:text-th-upvote hover:scale-110 "
              }
            />
            <div className="flex-grow w-full h-4 py-1.5 rounded bg-th-border text-transparent">
              Vote
            </div>
            <BiDownvote
              className={
                " flex-none cursor-pointer w-7 h-7 hover:text-th-downvote hover:scale-110 "
              }
            />
          </div>
          <div className="flex flex-col flex-grow space-y-2 animate-pulse pt-1.5 md:pl-3 md:border-l border-th-border ">
            <div className="w-1/4 h-4 rounded bg-th-border"></div>
            <div className="w-full rounded bg-th-border"></div>
            <div className="w-3/4 h-6 rounded bg-th-border"></div>
            <div className="w-5/6 h-6 rounded bg-th-border place-self-center"></div>
            <div className="w-5/6 h-6 rounded bg-th-border place-self-center"></div>
            <div className="w-5/6 rounded h-96 bg-th-border place-self-center"></div>
            <div className="flex flex-row items-center justify-between mt-2 space-x-2 select-none">
              {/* Vote buttons for mobiles */}
              <div className="flex flex-row items-center self-center justify-start h-full py-1 space-x-2 md:hidden">
                <Vote likes={0} name={""} score={0} size={7} archived={false} />
              </div>
              <div className="my-6"></div>
            </div>
          </div>
        </div>
      </div>
    ),
    []
  );

  const commentPlaceHolder = useMemo(
    () => (
      <div className="mx-2 my-1 border rounded-md pointer-events-none h-44 border-th-border2">
        <div className={"flex flex-row"}>
          {/* Left column */}
          <div
            className={
              "h-44 w-1 rounded-l-md  md:w-4 flex-none  cursor-pointer group animate-pulse"
            }
          >
            <div className="flex-none w-0.5 min-h-full bg-th-commentRibbon hover:bg-th-commentRibbonHover"></div>
          </div>
          {/* Comment Body */}
          <div
            className={
              "flex-grow flex-col mt-3 pt-2 space-y-2 animate-pulse ml-2 mr-4"
            }
          >
            {/* Author */}
            <div className="flex flex-row justify-start w-2/5 h-4 pl-3 space-x-1 text-base rounded t md:pl-0 bg-th-border "></div>
            {/* Main Comment Body */}
            <div className="w-full h-4 rounded-md bg-th-border "></div>
            <div className="w-full h-4 rounded-md bg-th-border "></div>
            <div className="w-full h-4 rounded-md bg-th-border "></div>
            <div className="w-full h-4 rounded-md bg-th-border "></div>
            <div className="w-full h-4 rounded-md bg-th-border "></div>
          </div>
        </div>
      </div>
    ),
    []
  );

  if (thread.isError) {
    return (
      <div className="flex items-center justify-center h-screen ">
        <div
          className={
            (!context?.postWideUI && !usePortrait && windowWidth > 768
              ? " max-w-3xl w-[768px]"
              : !usePortrait
              ? " w-full md:w-10/12 lg:w-3/4 "
              : " md:w-4/12 ") +
            " z-10 flex items-center justify-center w-full h-96 border rounded-lg border-th-border2 bg-th-background2"
          }
        >
          <div className="flex flex-col gap-2 px-4">
            <h1 className="">{"unable to load post"}</h1>
            <ErrMessage />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={"flex flex-row justify-center h-full"}>
        {/* Portrait Media */}
        {usePortrait && (
          <div className="z-10 mt-16 mr-3 md:w-6/12">
            <div
              ref={portraitDivRef}
              className="flex items-center justify-center max-h-full min-h-full overflow-y-auto border rounded-lg bg-th-background2 border-th-border2 scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
            >
              {pHeight && pWidth && (
                <div
                  className={
                    "min-h-full min-w-full relative" +
                    (mediaInfo?.isSelf ? " mb-auto" : "")
                  }
                >
                  <MediaWrapper
                    hideNSFW={hideNSFW}
                    post={initPost}
                    forceMute={false}
                    imgFull={mediaInfo?.isSelf ? true : imgFull}
                    postMode={true}
                    containerDims={[pWidth, pHeight]}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Card */}
        <div
          className={
            (!context?.postWideUI && !usePortrait && windowWidth > 768
              ? " max-w-3xl w-[768px]"
              : !usePortrait
              ? " w-full md:w-10/12 lg:w-3/4 "
              : " md:w-4/12 ") +
            " z-10 pt-2  md:flex md:flex-col md:items-center md:justify-start  "
          }
        >
          {/* Content container */}
          <div
            className="flex flex-col w-full h-screen overflow-x-hidden overflow-y-auto break-words border-t rounded-lg border-th-border2 mt-14 md:pt-0 scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full "
            onClick={(e) => e.stopPropagation()}
          >
            {/* LOADING POST CARD */}
            {!post?.name?.includes("t3_") ? (
              <>{postPlaceHolder}</>
            ) : (
              // Loaded Media Card
              <div className="w-full mb-3 border rounded-lg bg-th-background2 border-th-border2">
                {/* Flex container */}
                <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
                  {/* Upvote column */}
                  <div className="flex-col items-center w-12 self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex ">
                    <Vote
                      likes={post?.likes}
                      name={post?.name}
                      score={post?.score}
                      size={7}
                      postindex={context.postNum}
                      postMode={true}
                      archived={post?.archived}
                      //scoreHideMins={sub?.data?.data?.comment_score_hide_mins} //only hide score for comments.. not posts
                      //postTime={post?.created_utc}
                    />
                  </div>
                  {/* Main Media Column */}
                  <div className="w-full border-th-border2 md:border-l">
                    {/* Title etc*/}
                    <div className="flex flex-row items-start  pt-1.5 text-sm md:pl-3">
                      <div className="flex flex-row flex-wrap items-start group">
                        {post?.crosspost_parent_list?.[0] && (
                          <div className="flex flex-row items-start gap-1 ">
                            <GoRepoForked className="flex-none w-4 h-4 rotate-90" />
                            <span className="italic font-semibold -translate-y-0.5">
                              crosspost by
                            </span>
                          </div>
                        )}
                        <Link href={`/u/${post?.author}`}>
                          <a
                            title={`see u/${post?.author}'s posts`}
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            <h2 className="ml-1 mr-1 font-semibold -translate-y-0.5 hover:underline group">
                              u/
                              {post?.author ?? ""}
                              {post?.author_flair_text?.length > 0 &&
                                context.showUserFlairs && (
                                  <span className="mx-1 text-xs">
                                    <UserFlair post={post} />
                                  </span>
                                )}
                            </h2>
                          </a>
                        </Link>

                        <Link href={`/r/${post?.subreddit}`}>
                          <a
                            title={`go to r/${post?.subreddit}`}
                            className="mr-1 -translate-y-0.5"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                          >
                            on{" "}
                            <span className="font-semibold hover:underline">
                              r/{post?.subreddit ?? "unknown"}
                            </span>
                          </a>
                        </Link>

                        <p className="-translate-y-0.5">
                          {secondsToTime(post?.created_utc)}
                        </p>
                        <p className="-translate-y-0.5 mx-1">•</p>

                        <p className="text-xs translate-y-[0.05rem] text-th-textLight select-none  ">
                          {post?.upvote_ratio * 100}% upvoted
                        </p>
                        {post?.over_18 && (
                          <div className="flex flex-row pl-1 space-x-1 -translate-y-0.5">
                            <p>•</p>
                            <span className="text-th-red">NSFW</span>
                          </div>
                        )}
                        {post?.spoiler && (
                          <div className="flex flex-row pl-1 space-x-1 -translate-y-0.5">
                            <p>•</p>
                            <span className="text-th-red">SPOILER</span>
                          </div>
                        )}
                        <div className="mx-1"></div>
                        {post?.all_awardings?.length > 0 && (
                          <Awardings
                            all_awardings={post?.all_awardings}
                            truncate={false}
                            styles={"mr-0.5 "}
                          />
                        )}
                      </div>
                      <div className="flex flex-col items-end justify-center flex-none ml-auto text-xs text-th-textLight">
                        <a
                          title="open source"
                          href={`${post?.url}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <p className=" hover:underline">{`(${post?.domain})`}</p>
                        </a>
                      </div>
                    </div>

                    <h1 className="flex flex-row flex-wrap items-center justify-start py-2 md:pl-3">
                      <a
                        className={" text-xl font-semibold mr-2"}
                        href={
                          `${post?.url}` ??
                          `https://www.reddit.com${post?.permalink ?? ""}`
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <PostTitle post={post} />
                      </a>
                      <span className="text-sm font-medium ">
                        <TitleFlair post={post} />
                      </span>
                    </h1>

                    {/* Image/Video/Text Body */}
                    {!usePortrait && (
                      <>
                        <div className={"block relative md:ml-3 "}>
                          <MediaWrapper
                            hideNSFW={hideNSFW}
                            post={initPost}
                            forceMute={false}
                            imgFull={imgFull}
                            postMode={true}
                          />
                        </div>
                      </>
                    )}
                    {/* Bottom Buttons */}

                    <div className="flex flex-row flex-wrap items-center justify-between mt-2 space-x-2 select-none">
                      {/* Vote buttons for mobiles */}
                      <div className="flex flex-row items-center self-center justify-start h-full py-1 space-x-2 md:hidden">
                        <Vote
                          likes={post?.likes}
                          name={post?.name}
                          score={post?.score}
                          size={7}
                          archived={post?.archived}
                          // scoreHideMins={
                          //   sub?.data?.data?.comment_score_hide_mins
                          // }
                          // postTime={post?.created_utc}
                        />
                      </div>
                      <div className="flex flex-row flex-wrap items-center justify-start space-x-1">
                        {windowWidth > 1300 && (
                          <>
                            <button
                              onClick={(e) => {
                                setUsePortrait((p) => !p);
                              }}
                              className="flex flex-row items-center p-2 space-x-1 border rounded-md border-th-border hover:border-th-borderHighlight "
                            >
                              <HiOutlineSwitchHorizontal
                                className={"flex-none w-5 h-5  "}
                              />
                            </button>
                          </>
                        )}
                        {true && (
                          <button
                            autoFocus
                            onClick={(e) => setimgFull((p) => !p)}
                            className="flex-row items-center hidden p-2 border rounded-md md:flex border-th-border hover:border-th-borderHighlight"
                          >
                            {imgFull ? (
                              <>
                                <BiCollapse className={"flex-none w-5 h-5 "} />
                              </>
                            ) : (
                              <>
                                <BiExpand className={"flex-none w-5 h-5 "} />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-row flex-wrap items-center justify-end gap-1 text-sm">
                        <div>
                          <button
                            disabled={post?.archived || post?.locked}
                            onClick={(e) => {
                              e.preventDefault();
                              session && !post?.archived && !post?.locked
                                ? setopenReply((r) => !r)
                                : !session && context.toggleLoginModal();
                            }}
                            className={
                              "flex flex-row items-center p-2 space-x-1 border rounded-md border-th-border  " +
                              (post?.archived || post?.locked
                                ? " opacity-50"
                                : " hover:border-th-borderHighlight ")
                            }
                          >
                            <BsReply
                              className={
                                "flex-none w-5 h-5 scale-x-[-1] " +
                                (!usePortrait && " md:mr-1")
                              }
                            />
                            <h1
                              className={
                                "hidden " + (!usePortrait && " md:block pl-0.5")
                              }
                            >
                              Reply
                            </h1>
                          </button>
                        </div>
                        <div
                          className={
                            "flex flex-row flex-wrap items-center cursor-pointer p-2  border rounded-md border-th-border hover:border-th-borderHighlight"
                          }
                        >
                          <SaveButton
                            id={post?.name}
                            saved={post?.saved}
                            post={true}
                            isPortrait={usePortrait}
                            postindex={context.postNum}
                          ></SaveButton>
                        </div>
                        <a
                          href={
                            `${post?.url}` ??
                            `https://www.reddit.com${post?.permalink ?? ""}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-th-border hover:border-th-borderHighlight ">
                            <BiExit
                              className={
                                "flex-none w-5 h-5 " +
                                (!usePortrait && " md:mr-2")
                              }
                            />
                            <h1
                              className={
                                "hidden " + (!usePortrait && " md:block ")
                              }
                            >
                              Source
                            </h1>
                          </div>
                        </a>
                        <a
                          href={`https://www.reddit.com${
                            post?.permalink ?? ""
                          }`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-th-border hover:border-th-borderHighlight ">
                            <ImReddit
                              className={
                                "flex-none w-5 h-5 " +
                                (!usePortrait && " md:mr-2")
                              }
                            />
                            <h1
                              className={
                                "hidden " + (!usePortrait && " md:block ")
                              }
                            >
                              Original
                            </h1>
                          </div>
                        </a>
                        <div className="ml-0.5">
                          <PostOptButton post={post} postNum={0} mode="post" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* post reply */}
            {openReply && (
              <div
                className={
                  (openReply ? "block " : "hidden ") +
                  "bg-th-background2  border rounded-lg border-th-border2 p-2 mb-3"
                }
              >
                <CommentReply
                  parent={post?.name}
                  getResponse={updateMyReplies}
                  postName={post?.name}
                />
              </div>
            )}

            {(post?.archived ||
              post?.removed_by_category === "moderator" ||
              post?.locked) && (
              <div className="w-full ">
                <div className="flex items-center gap-4 p-2 px-4 mb-3 border rounded-lg border-th-border2 bg-th-background2 ">
                  {post?.archived && <BsArchive />}
                  {post?.removed_by_category === "moderator" && <BsShieldX />}
                  {post?.locked && <BsLock />}
                  <p className="flex flex-col text-sm font-normal ">
                    {post?.archived && (
                      <>
                        <span>This is an archived post.</span>
                        <span className="text-xs">
                          New comments cannot be posted and votes cannot be cast
                        </span>
                      </>
                    )}
                    {post?.removed_by_category === "moderator" && (
                      <>
                        <span>
                          This post has been removed by the moderators.
                        </span>
                        <span className="text-xs">
                          It won't show up in the subreddit anymore. Just mods
                          doing mod things.
                        </span>
                      </>
                    )}
                    {post?.locked && (
                      <>
                        <span>This post is locked.</span>
                        <span className="text-xs">
                          New comments cannot be posted
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            )}

            {/* comments */}
            <div
              className={
                "border rounded-lg bg-th-background2 border-th-border2 "
              }
            >
              <div
                id="anchor-name"
                //className="border-4 border-red-500"
                style={{
                  position: "absolute",
                  top: "-3.5rem",
                  left: 0,
                }}
              ></div>
              <div className="flex flex-row flex-wrap justify-between px-2 mt-2 ">
                <div
                  ref={commentsRef}
                  className="flex flex-row items-center space-x-1 md:pl-2 md:space-x-2"
                >
                  <BiComment className="flex-none w-6 h-6 " />
                  <div className="flex flex-row items-baseline mb-1 space-x-1">
                    <h1 className="">{`${post?.num_comments ?? "??"}`}</h1>
                    <h1 className="hidden md:block">
                      {`comment${post?.num_comments == 1 ? "" : "s"}`}
                    </h1>
                    {prevCount &&
                    post?.num_comments &&
                    post.num_comments - prevCount > 0 ? (
                      <h2 className="text-xs italic text-th-textLight">{`(${
                        post.num_comments - prevCount
                      } new)`}</h2>
                    ) : (
                      <></>
                    )}
                  </div>
                </div>
                <div className="flex items-center h-full gap-2">
                  <button
                    disabled={thread.isFetching}
                    onClick={() => thread.refetch()}
                  >
                    <IoMdRefresh
                      className={
                        (thread.isFetching ? "animate-spin" : " ") +
                        " w-5 h-5 flex-none"
                      }
                    />
                  </button>
                  {!commentMode && (
                    <div className="z-10 flex-none mb-1 h-9">
                      <CommentSort updateSort={updateSort} sortBy={sort} />
                    </div>
                  )}
                </div>
              </div>
              {/* Loading Comments */}
              {!commentsReady && (
                // Comment Loader
                <>
                  {[
                    ...Array(
                      parseInt(post?.num_comments) < 5
                        ? parseInt(post?.num_comments)
                        : 5
                    ),
                  ].map((u, i) => (
                    <div key={i}>{commentPlaceHolder}</div>
                  ))}{" "}
                </>
              )}

              <div className="w-full mb-5 ">
                <h1 className="text-center">
                  {!(thread.data?.pages?.[0]?.comments?.length > 0) &&
                  thread.isFetched
                    ? "no comments :("
                    : ""}
                </h1>
                {/* Open All Comments */}

                {commentMode && (
                  <div className="flex-grow w-full px-2 mt-1 text-sm">
                    <div className="p-2 mb-3 border rounded-lg bg-th-background2 border-th-border2">
                      <p className="flex flex-col mx-3 text-sm font-normal ">
                        <span>You are viewing a single comment's thread</span>
                        <span className="text-xs">
                          <Link href={`/${post?.permalink}`} passHref>
                            <a className="font-semibold text-th-link hover:text-th-linkHover">
                              Click to view all comments
                            </a>
                          </Link>
                          {!withContext && (
                            <Link
                              href={`${postComments?.[0]?.data?.permalink}?context=10000`}
                              passHref
                            >
                              <a className="ml-2 font-semibold text-th-link hover:text-th-linkHover">
                                view context
                              </a>
                            </Link>
                          )}
                        </span>
                      </p>
                    </div>
                  </div>
                )}

                <div className={"w-full px-2  "}>
                  {postComments?.length > 0 && (
                    <Comments
                      comments={postComments}
                      depth={0}
                      op={post?.author}
                      portraitMode={usePortrait}
                      sort={sort}
                      thread={thread}
                      locked={post?.locked}
                      scoreHideMins={sub?.data?.data?.comment_score_hide_mins}
                      setCommentsReady={setCommentsReady}
                    />
                  )}
                </div>
              </div>
            </div>
            <div onClick={goBack} className="flex-grow"></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Thread;
