import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { loadComments, loadPost, postVote, getUserVotes } from "../RedditAPI";
import Media from "./Media";
import { BiDownvote, BiUpvote, BiExpand, BiCollapse } from "react-icons/bi";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { BiComment } from "react-icons/bi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { BsBookmarks } from "react-icons/bs";

import { useWindowSize } from "@react-hook/window-size";
import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import { BsReply } from "react-icons/bs";
import ReactDOM from "react-dom";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useMainContext } from "../MainContext";
import CommentSort from "./CommentSort";
import CommentReply from "./CommentReply";
import { secondsToTime } from "../../lib/utils";
import TitleFlair from "./TitleFlair";
import { findMediaInfo } from "../../lib/utils";
import { useKeyPress } from "../hooks/KeyPress";
// import { usePlausible } from "next-plausible";
import Vote from "./Vote";
import MediaWrapper from "./MediaWrapper";
import Awardings from "./Awardings";
import PostTitle from "./PostTitle";
import SaveButton from "./SaveButton";
import UserFlair from "./UserFlair";
import PostOptButton from "./PostOptButton";
import { GoRepoForked } from "react-icons/go";
import SubIcon from "./SubIcon";

const PostModal = ({
  setSelect,
  returnRoute,
  permalink,
  postData = {},
  postNum = 0,
  direct = false,
  commentsDirect = false,
  commentMode = false,
}) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [sr_detail, setSR_Detail] = useState({});
  const [wait, setWait] = useState(true);
  const [usePortrait, setUsePortrait] = useState(false);
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [sort, setSort] = useState("top");
  const [myReplies, setmyReplies] = useState([]);
  const [openReply, setopenReply] = useState(false);
  const { data: session, status } = useSession();
  const context: any = useMainContext();
  const [imgFull, setimgFull] = useState(false);
  const [windowWidth, windowHeight] = useWindowSize();
  const [error, setError] = useState(false);
  const commentsRef = useRef<HTMLDivElement>(null);
  const executeScroll = () => {
    commentsRef.current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // const plausible = usePlausible();

  const nextPress = useKeyPress("ArrowRight");
  const backPress = useKeyPress("ArrowLeft");
  const escapePress = useKeyPress("Escape");

  useEffect(() => {
    if (!context.replyFocus) {
      if (nextPress) {
        changePost(1);
      } else if (backPress) {
        changePost(-1);
      } else if (escapePress) {
        handleBack();
      }
    }

    return () => {};
  }, [nextPress, backPress, escapePress, context.replyFocus]);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const [touchEndY, setTouchEndY] = useState(0);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
    setTouchEndY(e.targetTouches[0].clientY);
  };
  const handleTouchEnd = (e) => {
    //console.log(Math.abs(touchStartY - touchEndY));
    if (touchStart - touchEnd > 100) {
      //changePost(1);
      //console.log("right");
    } else if (
      touchStart - touchEnd < -100 &&
      Math.abs(touchStartY - touchEndY) < 20
    ) {
      handleBack();
      //console.log("left");
    }
  };

  const [mediaInfo, setMediaInfo] = useState<any>();
  useEffect(() => {
    const checkPortrait = async () => {
      if (
        apost?.mediaInfo?.isPortrait === true ||
        apost?.mediaInfo?.isPortrait === false
      ) {
        setMediaInfo(apost.mediaInfo);
        setUsePortrait(apost?.mediaInfo?.isPortrait);
        //setimgFull(apost?.mediaInfo?.isPortrait);
      } else {
        let check = await findMediaInfo(apost);
        setMediaInfo(check);
        check?.isPortrait ? setUsePortrait(true) : undefined;
      }

      setWait(false);
    };
    if (apost?.id) {
      //console.log(windowWidth, windowHeight);
      if (
        windowWidth > 1300 &&
        windowHeight < windowWidth &&
        context.postWideUI
      ) {
        checkPortrait();
      } else {
        setUsePortrait(false);
        setWait(false);
      }
    }

    return () => {
      setUsePortrait(false);
      setWait(true);
    };
  }, [apost, windowWidth]);
  useEffect(() => {
    if (commentsRef?.current && commentsDirect) {
      executeScroll();
    }
  }, [commentsRef?.current, commentsDirect]);

  const updateMyReplies = (resdata) => {
    const newreply = {
      myreply: true,
      kind: "t1",
      data: resdata,
    };
    setmyReplies((replies) => [newreply, ...replies]);
    setopenReply(false);
  };

  const [hideNSFW, setHideNSFW] = useState(false);
  useEffect(() => {
    context.nsfw === false && apost?.over_18
      ? setHideNSFW(true)
      : apost?.spoiler
      ? setHideNSFW(true)
      : setHideNSFW(false);
    return () => {
      setHideNSFW(false);
    };
  }, [apost, context]);

  //prevent scrolling on main body when open
  useEffect(() => {
    if (true) {
      const width = document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.width = `${width}px`;
    } else {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    }

    return () => {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    };
  }, []);

  useEffect(() => {
    context.setPostOpen(true);
  
    return () => {
      context.setPostOpen(false);
    }
  }, [])
  

  useEffect(() => {
    let asynccheck = true;
    const fetchPost = async () => {
      if (Object.keys(postData).length > 0 && !commentMode) {
        setPost(postData);
        setLoadingPost(false);
      }
      const { post, comments, token } = await loadPost(
        permalink,
        sort,
        session ? true : false,
        context?.token
      );
      token && context.setToken(token);
      if (asynccheck) {
        if (Object.keys(postData).length === 0 || commentMode) {
          if (post?.id) {
            setPost(post);
            setLoadingPost(false);
          } else {
            setError(true);
          }
        }
        post?.sr_detail && setSR_Detail(post.sr_detail);
        setComments(comments);
        setLoadingComments(false);
      }
    };
    fetchPost();
    return () => {
      asynccheck = false;
      setPost({});
      setComments([]);
      setError(false);
      setLoadingComments(true);
      setLoadingPost(true);
    };
  }, [permalink]);

  const updateSort = async (e, sort) => {
    e.preventDefault();
    setLoadingComments(true);
    setSort(sort);
    const { token, post, comments } = await loadPost(
      permalink,
      sort,
      session ? true : false,
      context?.token
    );
    setComments(comments);
    token && context.setToken(token);
    setLoadingComments(false);
  };

  const scrollComments = () => {
    const element = document.getElementById("anchor-name");
    //let node = ReactDOM.findDOMNode(divRef.current) as Element;
    element.scrollIntoView({ block: "start", behavior: "smooth" });
    //window.scrollBy(0, -10); // Adjust scrolling with a negative value here
  };

  const handleBack = () => {
    setSelect(false);
    if (returnRoute === "multimode") {
      //do nothing
    } else if (returnRoute) {
      //console.log("last route", returnRoute);
      router.push(returnRoute);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    context.setPostNum(postNum);
    return () => {
      context.setPostNum(0);
    };
  }, [postNum]);

  useEffect(() => {
    context.addReadPost(apost?.name);
  }, [apost]);

  const [newLink, setNewLink] = useState("");
  useEffect(() => {
    let asyncheck = true;
    const updateComments = async (newlink) => {
      setLoadingComments(true);
      const { token, post, comments } = await loadPost(
        newlink,
        sort,
        session ? true : false,
        context?.token
      );
      if (asyncheck) {
        setComments(comments);
        setLoadingComments(false);
        post?.sr_detail ? setSR_Detail(post.sr_detail) : setSR_Detail({});
        token && context.setToken(token);
      }
    };
    if (newLink && newLink !== "") {
      updateComments(newLink);
    }
    return () => {
      asyncheck = false;
    };
  }, [newLink]);

  const changePost = (move) => {
    if (move === 1) {
      //console.log(postNum, context.postNum, context.posts.length);
      if (context.posts?.[context.postNum + 1]?.data) {
        //console.log(router, returnRoute);
        apost?.subreddit !==
          context.posts[context.postNum + 1].data?.subreddit &&
          setSR_Detail({});

        setPost(context.posts[context.postNum + 1].data);
        setNewLink(context.posts[context.postNum + 1]?.data?.permalink);
        if (
          !(
            router.route === "/u/[...slug]" &&
            router.query?.slug?.[1]?.toUpperCase() === "M"
          )
        ) {
          router.replace(
            "",
            router.query?.frontsort
              ? context.posts[context.postNum + 1]?.data?.id
              : router.route === "/u/[...slug]" &&
                session?.user?.name?.toUpperCase() ===
                  router?.query?.slug?.[0]?.toUpperCase()
              ? `/u/${router.query?.slug?.[0]}/${
                  router?.query?.slug?.[1]
                    ? `${router?.query?.slug?.[1]}/`
                    : `p/`
                }${context.posts[context.postNum + 1]?.data?.id}`
              : router.route === "/u/[...slug]"
              ? `/u/${context.posts[context.postNum + 1]?.data?.author}/p/${
                  context.posts[context.postNum + 1]?.data?.id
                }`
              : context.posts[context.postNum + 1]?.data?.permalink,
            {
              shallow: true,
            }
          );
        }
        context.setPostNum((p) => p + 1);
      }
    } else if (move === -1 && (context.postNum > 0 || postNum > 0)) {
      if (context.posts?.[context.postNum - 1]?.data) {
        //console.log("moveback");
        apost?.subreddit !==
          context.posts[context.postNum - 1].data?.subreddit && setSR_Detail({});
        setPost(context.posts[context.postNum - 1].data);
        setNewLink(context.posts[context.postNum - 1]?.data?.permalink);
        if (
          !(
            router.route === "/u/[...slug]" &&
            router.query?.slug?.[1]?.toUpperCase() === "M"
          )
        ) {
          router.replace(
            "",
            router.query?.frontsort
              ? context.posts[context.postNum - 1]?.data?.id
              : router.route === "/u/[...slug]" &&
                session?.user?.name?.toUpperCase() ===
                  router?.query?.slug?.[0]?.toUpperCase()
              ? `/u/${router.query?.slug?.[0]}/${
                  router?.query?.slug?.[1]
                    ? `${router?.query?.slug?.[1]}/`
                    : `p/`
                }${context.posts[context.postNum - 1]?.data?.id}`
              : router.route === "/u/[...slug]"
              ? `/u/${context.posts[context.postNum - 1]?.data?.author}/p/${
                  context.posts[context.postNum - 1]?.data?.id
                }`
              : context.posts[context.postNum - 1]?.data?.permalink,
            {
              shallow: true,
            }
          );
        }

        context.setPostNum((p) => p - 1);
      }
    }
  };

  const portraitDivRef = useRef(null);
  const [pHeight, setpHeight] = useState();
  const [pWidth, setpWidth] = useState();
  useEffect(() => {
    if (!wait && usePortrait) {
      setpHeight(portraitDivRef?.current?.clientHeight);
      setpWidth(portraitDivRef?.current?.clientWidth);
    }
  }, [wait, usePortrait]);

  const commentPlaceHolder = (
    <div className="mx-2 my-1 border rounded-md h-44 border-lightBorder dark:border-darkBorder">
      <div className={"flex flex-row"}>
        {/* Left column */}
        <div
          className={
            "h-44 w-1 rounded-l-md  md:w-4 flex-none  cursor-pointer group animate-pulse"
          }
        >
          <div className="flex-none w-0.5 min-h-full bg-blue-600 hover:bg-blue-800 group-hover:bg-blue-800 dark:bg-red-700 rounded-l-md dark:hover:bg-red-600 dark:group-hover:bg-red-600"></div>
        </div>
        {/* Comment Body */}
        <div
          className={
            "flex-grow flex-col mt-3 pt-2 space-y-2 animate-pulse ml-2 mr-4"
          }
        >
          {/* Author */}
          <div className="flex flex-row justify-start w-2/5 h-4 pl-3 space-x-1 text-base text-gray-400 bg-gray-300 rounded md:pl-0 dark:text-gray-500 dark:bg-gray-800 "></div>
          {/* Main Comment Body */}
          <div className="w-full h-4 bg-gray-300 rounded-md dark:bg-gray-800"></div>
          <div className="w-full h-4 bg-gray-300 rounded-md dark:bg-gray-800"></div>
          <div className="w-full h-4 bg-gray-300 rounded-md dark:bg-gray-800"></div>
          <div className="w-full h-4 bg-gray-300 rounded-md dark:bg-gray-800"></div>
          <div className="w-full h-4 bg-gray-300 rounded-md dark:bg-gray-800"></div>
        </div>
      </div>
    </div>
  );

  const postPlaceHolder = (
    <div className="w-full mb-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
      {/* Flex container */}
      <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
        {/* Upvote column */}
        <div className="flex-col flex-none items-center self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex animate-pulse ">
          <BiUpvote
            className={
              " flex-none cursor-pointer w-7 h-7 hover:text-upvote hover:scale-110 "
            }
          />
          <div className="flex-grow w-full h-4 py-1.5 bg-gray-300 rounded dark:bg-gray-800 text-transparent">
            0000
          </div>
          <BiDownvote
            className={
              " flex-none cursor-pointer w-7 h-7 hover:text-downvote hover:scale-110 "
            }
          />
        </div>
        <div className="flex flex-col flex-grow space-y-2 animate-pulse pt-1.5 md:pl-3 border-gray-100 md:border-l dark:border-darkHighlight">
          <div className="w-1/4 h-4 bg-gray-300 rounded dark:bg-gray-800"></div>
          <div className="w-full bg-gray-300 rounded dark:bg-gray-800"></div>
          <div className="w-3/4 h-6 bg-gray-300 rounded dark:bg-gray-800"></div>
          <div className="w-5/6 h-6 bg-gray-300 rounded dark:bg-gray-800 place-self-center"></div>
          <div className="w-5/6 h-6 bg-gray-300 rounded dark:bg-gray-800 place-self-center"></div>
          <div className="w-5/6 bg-gray-300 rounded h-96 dark:bg-gray-800 place-self-center"></div>
          <div className="flex flex-row items-center justify-between mt-2 space-x-2 select-none">
            {/* Vote buttons for mobiles */}
            <div className="flex flex-row items-center self-center justify-start h-full py-1 space-x-2 md:hidden">
              <Vote
                likes={apost?.likes}
                name={apost?.name}
                score={apost?.score}
                size={7}
                postindex={context.postNum}
              />
            </div>
            <div></div>
            <div className="flex flex-row items-center justify-end space-x-1">
              <div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight "
                >
                  <BsReply className="flex-none w-6 h-6 md:pr-2 scale-x-[-1]" />
                  <h1 className="hidden md:block">Reply</h1>
                </button>
              </div>
              <a
                href={`${apost?.url}` ?? "https://reddit.com"}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                  <BiExit className="flex-none w-6 h-6 md:pr-2" />
                  <h1 className="hidden md:block">Source</h1>
                </div>
              </a>
              <a
                href={`https://www.reddit.com/${apost?.permalink ?? ""}`}
                target="_blank"
                rel="noreferrer"
              >
                <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                  <ImReddit className="flex-none w-6 h-6 md:pr-2" />
                  <h1 className="hidden md:block ">Original</h1>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (wait && direct) {
    return (
      <div className="fixed left-0 z-30 w-screen h-2 bg-blue-700 top-[56px] animate-pulse"></div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center mt-28">
        {"page not found"}
      </div>
    );
  }

  return (
    <div
      className={
        "fixed inset-0 z-20 w-screen min-w-full min-h-screen overflow-y-auto overscroll-y-contain"
      }
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchMove={(e) => handleTouchMove(e)}
      onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black backdrop-filter backdrop-blur-lg opacity-80 overscroll-none"
      ></div>
      {context.posts?.[context.postNum - 1]?.data && (
        <div
          title={`previous post (left arrow)`}
          onClick={(e) => changePost(-1)}
          className="fixed p-2 text-gray-400 cursor-pointer left-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineLeft className="w-10 h-10" />
        </div>
      )}
      {!wait && (
        <>
          <div className={"flex flex-row justify-center h-full"}>
            {/* Portrait Media */}
            {usePortrait && (
              <div
                ref={portraitDivRef}
                className="relative z-10 flex items-center justify-center mt-16 mr-3 overflow-y-auto bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG md:w-6/12 scrollbar-thin scrollbar-thumb-lightScroll scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-darkScroll"
              >
                {pHeight && pWidth && (
                  <div className={"flex-grow " + (imgFull ? " my-auto" : "")}>
                    <div className={"block relative   "}>
                      <MediaWrapper
                        hideNSFW={hideNSFW}
                        post={apost}
                        forceMute={false}
                        allowIFrame={true}
                        imgFull={imgFull}
                        postMode={true}
                        containerDims={[pWidth, pHeight]}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Main Card */}
            <div
              className={
                (!context?.postWideUI && !usePortrait && windowWidth > 768
                  ? " max-w-3xl w-[768px]"
                  : !usePortrait
                  ? "w-full md:w-10/12 lg:w-3/4 "
                  : " md:w-4/12 ") +
                " z-10 pt-2  md:flex md:flex-col md:items-center "
              }
            >
              <div className="absolute md:fixed left-4 top-16">
                <RiArrowGoBackLine
                  title={"back (esc)"}
                  onClick={() => handleBack()}
                  className="w-8 h-8 mt-1 text-gray-400 cursor-pointer hover:text-gray-300"
                />
              </div>
              {/* Content container */}
              <div
                className="flex flex-col w-full mt-24 overflow-y-auto border-t border-transparent rounded-lg md:mt-14 dark:border-darkBorder md:pt-0 scrollbar-thin scrollbar-thumb-lightScroll scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-darkScroll"
                onClick={(e) => e.stopPropagation()}
              >
                {/* LOADING POST CARD */}
                {loadingPost ? (
                  // Loading Media Card
                  <>{postPlaceHolder}</>
                ) : (
                  // Loaded Media Card
                  <div className="w-full mb-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                    {/* Flex container */}
                    <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
                      {/* Upvote column */}
                      <div className="flex-col items-center w-12 self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex ">
                        <Vote
                          likes={apost?.likes}
                          name={apost?.name}
                          score={apost?.score}
                          size={7}
                          postindex={context.postNum}
                          postMode={true}
                        />
                      </div>
                      {/* Main Media Column */}
                      <div className="flex-grow border-gray-100 md:border-l dark:border-darkHighlight">
                        {/* Title etc*/}
                        <div className="flex flex-row items-start  pt-1.5 text-sm md:pl-3">
                          <div className="flex flex-row flex-wrap items-start group">
                            {apost?.crosspost_parent_list?.[0] && (
                              <div className="flex flex-row items-start gap-1 ">
                                <GoRepoForked className="flex-none w-4 h-4 rotate-90" />
                                <span className="-translate-y-0.5 italic font-semibold">
                                  crosspost by
                                </span>
                              </div>
                            )}
                            <Link href={`/u/${apost?.author}`}>
                              <a
                                title={`see u/${apost?.author}'s posts`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                <h2 className="ml-1 mr-1 -translate-y-0.5 font-semibold hover:underline group">
                                  u/
                                  {apost?.author ?? ""}
                                  {apost?.author_flair_text?.length > 0 && (
                                    <span className="mx-1 text-xs">
                                      <UserFlair post={apost} />
                                    </span>
                                  )}
                                </h2>
                              </a>
                            </Link>

                            <Link href={`/r/${apost?.subreddit}`}>
                              <a
                                title={`go to r/${apost?.subreddit}`}
                                className="mr-1 -translate-y-0.5"
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                              >
                                on{" "}
                                <span className="font-semibold hover:underline">
                                  r/{apost?.subreddit ?? "unknown"}
                                </span>
                              </a>
                            </Link>

                            <p className="-translate-y-0.5">
                              {secondsToTime(apost?.created_utc)}
                            </p>
                            {apost?.over_18 && (
                              <div className="flex flex-row pl-1 space-x-1 -translate-y-0.5">
                                <p>•</p>
                                <span className="text-red-400 text-color dark:text-red-700">
                                  NSFW
                                </span>
                              </div>
                            )}
                            {apost?.spoiler && (
                              <div className="flex flex-row pl-1 space-x-1 -translate-y-0.5">
                                <p>•</p>
                                <span className="text-red-400 text-color dark:text-red-700">
                                  SPOILER
                                </span>
                              </div>
                            )}
                            <div className="mx-1"></div>
                            {apost?.all_awardings?.length > 0 && (
                              <Awardings
                                all_awardings={apost?.all_awardings}
                                truncate={false}
                                styles={"mr-0.5 mt-0.5"}
                              />
                            )}
                          </div>
                          <div className="flex flex-row justify-center flex-none ml-auto">
                            <a
                              title="open source"
                              href={`${apost.url}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <p className="text-xs text-gray-400 dark:text-gray-500 hover:underline">{`(${apost?.domain})`}</p>
                            </a>
                          </div>
                        </div>

                        <h1 className="flex flex-row flex-wrap items-center justify-start py-2 md:pl-3">
                          <a
                            className={" text-xl font-semibold mr-2"}
                            href={`https://www.reddit.com${
                              apost?.permalink ?? ""
                            }`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <PostTitle post={apost} />
                          </a>
                          <span className="text-sm font-medium ">
                            <TitleFlair post={apost} />
                          </span>
                        </h1>

                        {/* Image/Video/Text Body */}
                        {!usePortrait && (
                          <>
                            <div className={"block relative md:ml-4"}>
                              <MediaWrapper
                                hideNSFW={hideNSFW}
                                post={apost}
                                forceMute={false}
                                allowIFrame={true}
                                imgFull={imgFull}
                                postMode={true}
                              />
                            </div>
                          </>
                        )}
                        {/* Bottom Buttons */}
                        <div className="flex flex-row items-center justify-between mt-2 space-x-2 select-none">
                          {/* Vote buttons for mobiles */}
                          <div className="flex flex-row items-center self-center justify-start h-full py-1 space-x-2 md:hidden">
                            <Vote
                              likes={apost?.likes}
                              name={apost?.name}
                              score={apost?.score}
                              size={7}
                            />
                          </div>
                          <div className="flex flex-row items-center justify-start space-x-1">
                            {windowWidth > 1300 && (
                              <>
                                <button
                                  onClick={(e) => {
                                    setUsePortrait((p) => !p);
                                  }}
                                  className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight "
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
                                className="flex-row items-center hidden p-2 border rounded-md sm:flex border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight "
                              >
                                {imgFull ? (
                                  <>
                                    <BiCollapse
                                      className={"flex-none w-5 h-5 "}
                                    />
                                  </>
                                ) : (
                                  <>
                                    <BiExpand
                                      className={"flex-none w-5 h-5 "}
                                    />
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex flex-row items-center justify-end gap-1 text-sm">
                            <div>
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  session
                                    ? setopenReply((r) => !r)
                                    : context.toggleLoginModal();
                                }}
                                className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight "
                              >
                                <BsReply
                                  className={
                                    "flex-none w-5 h-5 scale-x-[-1] " +
                                    (!usePortrait && " md:mr-1")
                                  }
                                />
                                <h1
                                  className={
                                    "hidden " +
                                    (!usePortrait && " md:block pl-0.5")
                                  }
                                >
                                  Reply
                                </h1>
                              </button>
                            </div>
                            <div
                              className={
                                "flex flex-row items-center cursor-pointer p-2  border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
                              }
                            >
                              <SaveButton
                                id={apost?.name}
                                saved={apost?.saved}
                                post={true}
                                isPortrait={usePortrait}
                                postindex={postNum}
                              ></SaveButton>
                            </div>
                            <a
                              href={`${apost?.url}` ?? "https://reddit.com"}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
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
                                apost?.permalink ?? ""
                              }`}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
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
                              <PostOptButton
                                post={apost}
                                postNum={postNum}
                                mode="post"
                              />
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
                      "bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG p-2 mb-3"
                    }
                  >
                    <CommentReply
                      parent={apost?.name}
                      getResponse={updateMyReplies}
                    />
                  </div>
                )}
                {/* comments */}
                <div
                  className={
                    "flex-grow bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG"
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
                  <div
                    ref={commentsRef}
                    className="flex flex-row justify-between h-10 px-2 mt-2 "
                  >
                    <div className="flex flex-row items-center space-x-1 md:pl-2 md:space-x-2">
                      <BiComment className="flex-none w-6 h-6 " />
                      <div className="flex flex-row items-center mb-1 space-x-1">
                        <h1 className="">{`${apost?.num_comments ?? "??"}`}</h1>
                        <h1 className="hidden md:block">
                          {`${
                            apost?.num_comments === 1 ? "comment" : "comments"
                          }`}
                        </h1>
                      </div>
                    </div>
                    {!commentMode && (
                      <div className="z-10 flex-none mb-1">
                        <CommentSort updateSort={updateSort} sortBy={sort} />
                      </div>
                    )}
                  </div>
                  {/* Loading Comments */}
                  {loadingComments ? (
                    // Comment Loader
                    <>
                      {[...Array(5)].map((u, i) => (
                        <div key={i}>{commentPlaceHolder}</div>
                      ))}{" "}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full mb-5 overflow-x-hidden">
                      <h1 className="">
                        {post_comments?.[0] ? "" : "no comments :("}
                      </h1>
                      {/* Open All Comments */}
                      {commentMode && (
                        <div className="flex-grow w-full px-2 mt-1">
                          <div className="p-2 mb-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                            <Link href={apost.permalink} passHref>
                              <a className="font-semibold text-blue-700 hover:text-blue-500 dark:text-blue-400 hover:dark:text-blue-300">
                                Click to view all comments
                              </a>
                            </Link>
                          </div>
                        </div>
                      )}
                      <div className={"flex-grow  w-full px-2 "}>
                        <Comments comments={myReplies} depth={0} />
                        <Comments
                          comments={post_comments}
                          depth={0}
                          op={apost?.author}
                          portraitMode={usePortrait}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {context.posts?.length > 0 && (
        <div
          title={`next post (right arrow)`}
          onClick={(e) => changePost(1)}
          className="fixed p-2 text-gray-400 cursor-pointer right-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineRight className="w-10 h-10" />
        </div>
      )}
    </div>
  );
};

export default PostModal;
