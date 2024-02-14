import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import Comments from "./Comments";
import Link from "next/link";
import { useWindowSize } from "@react-hook/window-size";
import { useSession } from "next-auth/react";
import { BiDownvote, BiUpvote, BiExpand, BiCollapse } from "react-icons/bi";
import {
  HiOutlineDocumentDuplicate,
  HiOutlineSwitchHorizontal,
} from "react-icons/hi";
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

import { localSeen, useMainContext } from "../MainContext";

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
import useSubreddit from "../hooks/useSubreddit";
import ErrMessage from "./ErrMessage";
import { useRead } from "../hooks/useRead";

import toast from "react-hot-toast";
import ToastCustom from "./toast/ToastCustom";
import useDuplicates from "../hooks/useDuplicates";
import MiniCard from "./cards/MiniCard";
import { CgSpinnerTwo } from "react-icons/cg";
import { MdOutlineCompress, MdOutlineExpand } from "react-icons/md";
import PostBody from "./PostBody";
import { useTAuth } from "../PremiumAuthContext";
import LoaderPuff from "./ui/LoaderPuff";

const SIDEBYSIDE_THRESHOLD = 1000;

const Thread = ({
  permalink,
  sort,
  updateSort,
  initialData,
  setMediaMode,
  withContext = false,
  commentMode = false,
  commentsDirect = false,
  direct = false,
  duplicates = false,
  handleBackToThread = () => {},
  goBack = (a, b) => {},
  setCurPost,
}) => {
  const context: any = useMainContext();
  sort ??= context.defaultCommentSort;
  const { premium } = useTAuth();
  const { data: session, status } = useSession();
  const { thread } = useThread(permalink, sort, undefined, withContext);
  const [showDuplicates, setShowDuplicates] = useState(() => duplicates);
  useEffect(() => {
    setShowDuplicates(duplicates);
  }, [duplicates]);

  const { duplicateQuery, flatPosts, totalDuplicates } = useDuplicates({
    enabled: showDuplicates,
    permalink,
  });
  const [windowWidth, windowHeight] = useWindowSize();
  const containerRef = useRef<HTMLDivElement>(null);
  //initPost so later refetches will keep media (ie videos) stable
  const [initPost, setInitPost] = useState<any>(() =>
    initialData?.name?.includes("t3_") ? initialData : {}
  );
  const [post, setPost] = useState<any>(() =>
    initialData?.name?.includes("t3_") ? initialData : {}
  );
  const { read } = useRead(post?.name);
  const { sub } = useSubreddit(post?.subreddit);

  const [postComments, setPostComments] = useState<any[]>([]);
  const [commentsReady, setCommentsReady] = useState(false);
  const [origCommentCount, setOrigCommentCount] = useState<number>();
  const [origReadTime, setOrigReadTime] = useState<number>();
  const [newReadTime, setNewReadTime] = useState<number>();

  //const [prevCount, setPrevCount] = useState<number>();
  const [mediaInfo, setMediaInfo] = useState<any>();
  const [usePortrait, setUsePortrait] = useState<boolean | undefined>(
    undefined
  );
  const [imgFull, setimgFull] = useState(false);
  const [expandText, setExpandText] = useState(false);

  const portraitDivRef = useRef<any>(null);

  const [pHeight, setpHeight] = useState<number>();
  const [pWidth, setpWidth] = useState();

  useEffect(() => {
    if (thread?.data?.pages?.[0]?.post?.name) {
      //only set post if it's not already set from initialData or if it's overwriting another type of post eg. ("t1_" from direct opening a comment)
      if (!initPost?.name?.includes("t3_")) {
        setInitPost(thread?.data?.pages?.[0].post);
      }
      if (!origCommentCount) {
        setOrigCommentCount(
          thread?.data?.pages?.[0].post?.num_comments ?? undefined
        );
      }

      setNewReadTime(new Date().getTime());
      setPost(thread?.data?.pages?.[0].post);
      if (!initialData?.name) setCurPost(thread?.data?.pages?.[0].post);
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
      const domain = window?.location?.hostname ?? "www.troddit.com";
      const mInfo = await findMediaInfo(post, false, domain);
      setMediaInfo(mInfo);
    };
    if (post?.mediaInfo) {
      setMediaInfo(post?.mediaInfo);
    } else if (post) {
      getMediaInfo(post);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post]);

  useEffect(() => {
    if (read) {
      setOrigCommentCount(read?.numComments);
      !origReadTime && setOrigReadTime(read?.time);
    } else if (read === false) {
      setOrigReadTime(new Date().getTime());
    }
  }, [read]);

  //add to read on unmount
  useEffect(() => {
    return () => {
      context?.autoRead &&
        context.addReadPost({
          postId: post?.name,
          numComments: post?.num_comments,
        });

      context?.autoSeen && localSeen.setItem(post?.name, { time: new Date() });
    };
  }, []);

  useLayoutEffect(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    if (
      !context.disableSideBySide &&
      windowWidth >= SIDEBYSIDE_THRESHOLD &&
      windowHeight < windowWidth * 1.5 &&
      context?.postWideUI &&
      (mediaInfo?.hasMedia || post?.selftext_html) &&
      !direct
    ) {
      usePortrait === undefined &&
        setUsePortrait(
          mediaInfo?.isPortrait || context.preferSideBySide ? true : false
        );
    } else if (
      usePortrait === undefined
      && mediaInfo !== undefined
    ) {
      setUsePortrait(false)
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaInfo, context.preferSideBySide, context.disableSideBySide]);
  useEffect(() => {
    if (windowWidth < SIDEBYSIDE_THRESHOLD && usePortrait && !direct)
      setUsePortrait(false);
  }, [windowWidth]);

  useEffect(() => {
    if (usePortrait) {
      //setpHeight(portraitDivRef?.current?.clientHeight);
      setpWidth(portraitDivRef?.current?.clientWidth);
    }
  }, [usePortrait]);
  useEffect(() => {
    const doSetPHeight = () => {
      setpHeight(window.innerHeight - 48 - 2); //50=3.125rem
    };
    doSetPHeight();

    window.addEventListener("resize", doSetPHeight);
    return () => {
      window.removeEventListener("resize", doSetPHeight);
    };
  }, []);

  const commentsRef = useRef<HTMLDivElement>(null);
  const [jumped, setJumped] = useState(false);
  useEffect(() => {
    const executeScroll = () => {
      commentsRef?.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setJumped(true);
    };

    if (
      commentsRef?.current &&
      commentsDirect &&
      postComments?.length > 0 &&
      !jumped
    )
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
    toast.custom(
      (t) => (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toast.remove("feed_error");
          }}
          className="max-w-lg p-2 border rounded-lg bg-th-postHover border-th-border2"
        >
          <p className="mb-2 text-center">{"Oops something went wrong :("}</p>

          <ErrMessage />
        </button>
      ),
      { position: "bottom-center", duration: Infinity, id: "feed_error" }
    );
  }

  if (usePortrait === undefined && !direct) {
    return (
      <div className="flex items-center justify-center w-full h-[80vh]">
        <LoaderPuff />
      </div>
    );
  }

  return (
    <>
      <div
        onClick={() => goBack(false, true)}
        className={`flex flex-row flex-grow ${
          usePortrait ? "pt-0.5" : "pt-3"
        } justify-center `}
      >
        {/* Portrait Media */}
        {usePortrait && (
          <>
            <div className="top-0.5 z-10 mr-3 sticky-box md:w-6/12">
              <div
                ref={portraitDivRef}
                className={
                  " border rounded-lg border-th-border2 backdrop-blur-md bg-th-background2 " +
                  ((post?.selftext_html ||
                    post.crosspost_parent_list?.[0]?.selftext_html) &&
                  !(
                    mediaInfo?.isVideo ||
                    mediaInfo?.isIframe ||
                    mediaInfo?.isGallery ||
                    mediaInfo?.isTweet ||
                    mediaInfo?.isDual
                  )
                    ? "flex scrollbar-thin flex-col overflow-y-auto scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track "
                    : "flex items-center justify-center overflow-hidden")
                }
                style={{
                  height: `${Math.ceil(pHeight ?? 0)}px`,
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {pHeight && pWidth && (
                  <>
                    {(post?.selftext_html ||
                      post.crosspost_parent_list?.[0]?.selftext_html) &&
                    !(
                      mediaInfo?.isVideo ||
                      mediaInfo?.isIframe ||
                      mediaInfo?.isGallery ||
                      mediaInfo?.isTweet ||
                      mediaInfo?.isDual
                    ) ? (
                      <div
                        className={"flex flex-col flex-grow items-center m-3 "}
                      >
                        <PostBody
                          rawHTML={
                            post.crosspost_parent_list?.[0]?.selftext_html ??
                            post.selftext_html
                          }
                          mode="post"
                          //isPostOpen={true}
                        />
                      </div>
                    ) : (
                      <div className={"min-h-full min-w-full relative"}>
                        <MediaWrapper
                          hideNSFW={hideNSFW}
                          post={initPost}
                          forceMute={false}
                          imgFull={mediaInfo?.isSelf ? true : imgFull}
                          postMode={true}
                          containerDims={[pWidth, pHeight]}
                          showCrossPost={false}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </>
        )}

        {/* Main Card */}
        <div
          className={
            (direct
              ? `${usePortrait ? "md:w-4/12" : " w-full md:w-10/12 lg:w-3/4 "}`
              : !context?.postWideUI && !usePortrait && windowWidth > 768
              ? " max-w-3xl w-[768px]"
              : !usePortrait
              ? " w-full md:w-10/12 lg:w-3/4 "
              : " md:w-4/12 ") +
            " z-10  md:flex md:flex-col md:items-center md:justify-start "
          }
        >
          {/* Content container */}
          <div
            ref={containerRef}
            className="flex flex-col w-full rounded-lg md:pt-0 "
            onClick={(e) => e.stopPropagation()}
          >
            {/* LOADING POST CARD */}
            {!post?.name?.includes("t3_") ? (
              <>{postPlaceHolder}</>
            ) : (
              // Loaded Media Card
              <div className="z-10 w-full mb-3 border rounded-lg border-th-border2 backdrop-blur-md bg-th-background2">
                {/* Flex container */}
                <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
                  {/* Upvote column */}
                  <div className="flex-col items-center w-12 self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex ">
                    <Vote
                      likes={post?.likes}
                      name={post?.name}
                      score={post?.score}
                      size={7}
                      postMode={true}
                      archived={post?.archived === true}
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
                        <Link legacyBehavior href={`/u/${post?.author}`}>
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

                        <Link legacyBehavior href={`/r/${post?.subreddit}`}>
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

                        <p
                          className="-translate-y-0.5"
                          title={new Date(post?.created_utc * 1000)?.toString()}
                        >
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

                    <span className="flex flex-row flex-wrap items-center justify-start py-2 md:pl-3">
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
                    </span>

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
                    {usePortrait && post?.crosspost_parent_list?.[0] && (
                      <div className={"block relative md:ml-3 "}>
                        <MediaWrapper
                          hideNSFW={hideNSFW}
                          post={initPost}
                          forceMute={false}
                          imgFull={imgFull}
                          postMode={true}
                          showCrossPostMedia={false}
                        />
                      </div>
                    )}
                    {post?.selftext_html &&
                    (mediaInfo?.isVideo ||
                      mediaInfo?.isIframe ||
                      mediaInfo?.isGallery ||
                      mediaInfo?.isTweet ||
                      mediaInfo?.isDual) ? (
                      <div
                        className={
                          (usePortrait ? " " : " mt-3 ") +
                          "flex items-center md:ml-3"
                        }
                      >
                        <PostBody
                          rawHTML={post.selftext_html}
                          mode="post"
                          // isPostOpen={true}
                        />
                      </div>
                    ) : (
                      (post?.selftext_html ||
                        post.crosspost_parent_list?.[0]?.selftext_html) &&
                      !usePortrait && (
                        <div
                          className={
                            (usePortrait ? " " : " mt-3 ") +
                            "flex items-center md:ml-3"
                          }
                        >
                          <PostBody
                            rawHTML={
                              post.crosspost_parent_list?.[0]?.selftext_html ??
                              post?.selftext_html
                            }
                            mode="post"
                            limitHeight={
                              expandText
                                ? 0
                                : post.crosspost_parent_list?.[0]?.selftext_html
                                ? windowHeight * 0.5
                                : windowHeight *
                                  (windowWidth < 768 ? 0.5 : 0.75)
                            }
                            // isPostOpen={true}
                          />
                        </div>
                      )
                    )}

                    {/* Bottom Buttons */}

                    <div className="flex flex-row flex-wrap items-center justify-end gap-1 mt-2 select-none md:ml-2 md:justify-between">
                      {/* Vote buttons for mobiles */}
                      <div className="flex flex-row items-center self-center justify-start h-full py-1 mr-auto gap-x-2 md:hidden">
                        <Vote
                          likes={post?.likes}
                          name={post?.name}
                          score={post?.score}
                          size={7}
                          archived={post?.archived === true}
                        />
                      </div>
                      <div className="flex flex-row flex-wrap items-center justify-start gap-1 ">
                        {windowWidth >= SIDEBYSIDE_THRESHOLD && (
                          <>
                            <button
                              aria-label="switch comments location"
                              autoFocus={true}
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
                            title="full window mode (f)"
                            aria-label="expand media"
                            autoFocus={windowWidth < SIDEBYSIDE_THRESHOLD}
                            onClick={() => setMediaMode(true)}
                            //onClick={(e) => setimgFull((p) => !p)}
                            className="flex flex-row items-center p-2 border rounded-md border-th-border hover:border-th-borderHighlight"
                          >
                            <BiExpand className={"flex-none w-5 h-5 "} />
                          </button>
                        )}
                        {mediaInfo?.isSelf &&
                          (post?.selftext_html ||
                            post.crosspost_parent_list?.[0]?.selftext_html) &&
                          !usePortrait && (
                            <button
                              onClick={() => setExpandText((p) => !p)}
                              aria-label="expand text"
                              className="flex flex-row items-center p-2 border rounded-md border-th-border hover:border-th-borderHighlight"
                            >
                              {expandText ? (
                                <>
                                  <MdOutlineCompress
                                    className={"flex-none w-5 h-5 "}
                                  />
                                </>
                              ) : (
                                <>
                                  <MdOutlineExpand
                                    className={"flex-none w-5 h-5 "}
                                  />
                                </>
                              )}
                            </button>
                          )}
                      </div>
                      <div className="flex flex-row flex-wrap items-center justify-end gap-1 text-sm ">
                        <div>
                          <button
                            aria-label="reply"
                            disabled={
                              post?.archived === true || post?.locked === true
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              session &&
                              !(post?.archived === true) &&
                              !post?.locked
                                ? setopenReply((r) => !r)
                                : !session && context.toggleLoginModal();
                            }}
                            className={
                              "flex flex-row items-center p-2 space-x-1 border rounded-md border-th-border  " +
                              (post?.archived === true || post?.locked === true
                                ? " opacity-50"
                                : " hover:border-th-borderHighlight ")
                            }
                          >
                            {/* <BsReply
                              className={
                                "flex-none w-5 h-5 scale-x-[-1] " +
                                (!usePortrait && " md:mr-1")
                              }
                            /> */}
                            <BiComment className="flex-none w-5 h-5 " />

                            <span
                              className={
                                "hidden " + (!usePortrait && " md:block pl-0.5")
                              }
                            >
                              Reply
                            </span>
                          </button>
                        </div>
                        <div>
                          <button
                            aria-label="share"
                            onClick={async (e) => {
                              e.preventDefault();
                              const shareLink = `https://www.troddit.com/${
                                post?.permalink?.split("/")?.[4]
                              }`;
                              const shareData = {
                                title: `${post.title}`,
                                text: `${post.title}`,
                                url: `/${post?.permalink?.split("/")?.[4]}`,
                              };
                              try {
                                await navigator.share(shareData);
                              } catch (err) {
                                navigator.clipboard.writeText(shareLink);
                                toast.custom(
                                  (t) => (
                                    <ToastCustom
                                      t={t}
                                      message={`Link Copied`}
                                      mode={"success"}
                                    />
                                  ),
                                  {
                                    position: "bottom-center",
                                    duration: 1000,
                                    id: "thread_share",
                                  }
                                );
                              }
                            }}
                            className={
                              "flex flex-row items-center p-2 space-x-1 border rounded-md border-th-border  " +
                              " hover:border-th-borderHighlight "
                            }
                          >
                            <BsReply
                              className={
                                "flex-none w-5 h-5 scale-x-[-1] pb-0.5 " +
                                (!usePortrait && " md:mr-1")
                              }
                            />

                            <span
                              className={
                                "hidden " + (!usePortrait && " md:block pl-0.5")
                              }
                            >
                              Share
                            </span>
                          </button>
                        </div>
                        <div>
                          <SaveButton
                            id={post?.name}
                            saved={post?.saved}
                            post={true}
                            isPortrait={usePortrait}
                            useKeys={true}
                          />
                        </div>
                        <a
                          href={
                            `${post?.url}` ??
                            `https://www.reddit.com${post?.permalink ?? ""}`
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex-row items-center hidden p-2 space-x-1 border rounded-md md:flex border-th-border hover:border-th-borderHighlight ">
                            <BiExit
                              className={
                                "flex-none w-5 h-5 " +
                                (!usePortrait && " md:mr-2")
                              }
                            />
                            <span
                              className={
                                "hidden " + (!usePortrait && " md:block ")
                              }
                            >
                              Source
                            </span>
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
                            <span
                              className={
                                "hidden " + (!usePortrait && " md:block ")
                              }
                            >
                              Original
                            </span>
                          </div>
                        </a>
                        <div className="relative z-50 mx-1">
                          <PostOptButton post={post} mode="post" />
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
                  "backdrop-blur-md  border rounded-lg border-th-border2 p-2 mb-3 bg-th-background2"
                }
              >
                <CommentReply
                  parent={post?.name}
                  getResponse={updateMyReplies}
                  postName={post?.name}
                  onCancel={(e) => {
                    setopenReply(false);
                  }}
                />
              </div>
            )}

            {(post?.archived === true ||
              post?.removed_by_category === "moderator" ||
              post?.locked === true) && (
              <div className="w-full ">
                <div className="flex items-center gap-4 p-2 px-4 mb-3 border rounded-lg border-th-border2 backdrop-blur-md bg-th-background2">
                  <div className="flex flex-col items-center justify-center gap-4">
                    {post?.archived && <BsArchive />}
                    {post?.removed_by_category === "moderator" && <BsShieldX />}
                    {post?.locked && <BsLock />}
                  </div>

                  <p className="flex flex-col text-sm font-normal ">
                    {post?.archived === true && (
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
                    {post?.locked === true && (
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
                "border rounded-lg backdrop-blur-md border-th-border2 bg-th-background2 "
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
              {showDuplicates ? (
                <div className="p-4">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-row items-center gap-2">
                      <HiOutlineDocumentDuplicate className="flex-none w-6 h-6 " />
                      <h2 className="flex items-center gap-1">
                        {duplicateQuery.isLoading && !flatPosts && (
                          <>
                            <CgSpinnerTwo className="w-4 h-4 animate-spin" />
                          </>
                        )}
                        {`${
                          totalDuplicates === 0
                            ? 0
                            : totalDuplicates
                            ? totalDuplicates
                            : !duplicateQuery.isLoading &&
                              !(flatPosts?.length ?? 0 > 0)
                            ? 0
                            : !duplicateQuery.isLoading
                            ? "??"
                            : ""
                        } Other Discussion${totalDuplicates == 1 ? "" : "s"}`}
                      </h2>
                    </div>
                    {post.permalink && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleBackToThread();
                        }}
                      >
                        <a
                          onClick={() => setShowDuplicates(false)}
                          className="text-sm font-semibold text-th-link hover:text-th-linkHover"
                        >
                          back to thread
                        </a>
                      </button>
                    )}
                  </div>

                  {flatPosts?.map(({ data, i }) => (
                    <div
                      key={data?.name ?? i}
                      className={"bg-th-post rounded-lg my-2"}
                    >
                      <MiniCard post={data} />
                    </div>
                  ))}
                  {!flatPosts && duplicateQuery.isLoading && (
                    <>
                      {[...new Array(5)].map((i) => (
                        <div
                          key={i}
                          className="w-full h-20 my-2 rounded-lg bg-th-post animate-pulse"
                        ></div>
                      ))}
                    </>
                  )}
                  {duplicateQuery.hasNextPage && (
                    <>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          duplicateQuery.fetchNextPage();
                        }}
                        disabled={duplicateQuery.isFetchingNextPage}
                        className={
                          "flex flex-row items-center justify-center w-full gap-1 p-4 text-sm border rounded-md border-th-border  bg-th-post  " +
                          (duplicateQuery.isFetchingNextPage
                            ? ""
                            : " hover:border-th-borderHighlight hover:bg-th-postHover ")
                        }
                      >
                        Load More
                        {duplicateQuery.isFetchingNextPage && (
                          <>
                            <CgSpinnerTwo className="w-4 h-4 animate-spin" />
                          </>
                        )}
                      </button>
                    </>
                  )}
                  <div className="py-10"></div>
                </div>
              ) : (
                <>
                  <div className="flex flex-row flex-wrap justify-between px-2 mt-2 ">
                    <div
                      ref={commentsRef}
                      className="flex flex-row items-center space-x-1 md:pl-2 md:space-x-2"
                    >
                      <BiComment className="flex-none w-6 h-6 " />
                      <div className="flex flex-row items-baseline mb-1 space-x-1">
                        <span className="">{`${
                          post?.num_comments ?? "??"
                        }`}</span>
                        <span className="hidden md:block">
                          {`comment${post?.num_comments == 1 ? "" : "s"}`}
                        </span>
                        {typeof origCommentCount === "number" &&
                          post?.num_comments > origCommentCount && (
                            <h2 className="text-xs italic font-medium">{`(${
                              post?.num_comments - origCommentCount
                            } new)`}</h2>
                          )}
                      </div>
                    </div>

                    <div className="flex items-center h-full gap-2">
                      <button
                        aria-label="refresh comments"
                        disabled={thread.isFetching}
                        onClick={() => {
                          setOrigCommentCount(post?.num_comments ?? undefined);
                          setOrigReadTime(newReadTime);
                          thread.refetch();
                        }}
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
                    <span
                      className={
                        "flex justify-center w-full  text-xs text-center text-th-textLight mt-2"
                      }
                    >
                      {!(thread.data?.pages?.[0]?.comments?.length > 0) &&
                      thread.isFetched &&
                      !thread.isError ? (
                        <span className="mt-8">{"no comments :("}</span>
                      ) : null}
                    </span>
                    {/* Open All Comments */}

                    {commentMode && (
                      <div className="flex-grow w-full px-2 mt-1 text-sm">
                        <div className="p-2 mb-3 border rounded-lg bg-th-background2 border-th-border2">
                          <p className="flex flex-col mx-3 text-sm font-normal ">
                            <span>
                              You are viewing a single comment's thread
                            </span>
                            <span className="text-xs">
                              <Link
                                legacyBehavior
                                href={`/${post?.permalink}`}
                                passHref
                              >
                                <a className="font-semibold text-th-link hover:text-th-linkHover">
                                  Click to view all comments
                                </a>
                              </Link>
                              {!withContext && (
                                <Link
                                  legacyBehavior
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
                          containerRef={containerRef}
                          depth={0}
                          op={post?.author}
                          portraitMode={usePortrait}
                          sort={sort}
                          thread={thread}
                          locked={post?.locked}
                          scoreHideMins={
                            sub?.data?.data?.comment_score_hide_mins
                          }
                          setCommentsReady={setCommentsReady}
                          readTime={origReadTime}
                        />
                      )}
                    </div>
                    <div className="py-5"></div>
                  </div>
                </>
              )}
            </div>
            <div
              onClick={() => goBack(false, true)}
              className="my-10 sm:my-0"
            ></div>
            <div
              onClick={() => goBack(false, true)}
              className="flex-grow"
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Thread;
