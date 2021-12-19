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

import { useWindowSize } from "@react-hook/window-size";
import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import { BsReply } from "react-icons/bs";
import ReactDOM from "react-dom";
import React, { useRef } from "react";
import { useSession } from "next-auth/client";
import { useMainContext } from "../MainContext";
import CommentSort from "./CommentSort";
import CommentReply from "./CommentReply";
import { secondsToTime } from "../../lib/utils";
import TitleFlair from "./TitleFlair";
import { findMediaInfo } from "../../lib/utils";
import { useKeyPress } from "../hooks/KeyPress";
import { usePlausible } from "next-plausible";
import Vote from "./Vote";

const PostModal = ({
  setSelect,
  returnRoute,
  permalink,
  postData = {},
  postNum = 0,
  portrait = false,
}) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [wait, setWait] = useState(true);
  const [usePortrait, setUsePortrait] = useState(false);
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [sort, setSort] = useState("top");
  const [myReplies, setmyReplies] = useState([]);
  const [score, setScore] = useState("");
  const [vote, setVote] = useState(0);
  const [openReply, setopenReply] = useState(false);
  const [session, loading] = useSession();
  const context: any = useMainContext();
  const [imgFull, setimgFull] = useState(true);
  const [windowWidth, windowHeight] = useWindowSize();
  const [error, setError] = useState(false);

  const plausible = usePlausible();

  const nextPress = useKeyPress("ArrowRight");
  const backPress = useKeyPress("ArrowLeft");
  const escapePress = useKeyPress("Escape");

  useEffect(() => {
    if (nextPress) {
      changePost(1);
    } else if (backPress) {
      changePost(-1);
    } else if (escapePress) {
      handleBack();
    }
    return () => {};
  }, [nextPress, backPress, escapePress]);

  useEffect(() => {
    const checkPortrait = async () => {
      let check = await findMediaInfo(apost);
      //console.log("check", check);
      check && setUsePortrait(true);
      setWait(false);
    };
    if (apost?.id) {
      //console.log(windowWidth, windowHeight);
      if (windowWidth > 1300) {
        if (portrait) {
          setUsePortrait(true);
          setWait(false);
        } else {
          checkPortrait();
        }
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

  const castVote = async (e, v) => {
    e.stopPropagation();
    plausible("castVote");
    if (session) {
      v === vote ? (v = 0) : undefined;
      //getUserVotes();
      let res = await postVote(v, apost?.name);
      res ? setVote(v) : undefined;
    } else {
      context.toggleLoginModal();
    }
  };
  const divRef = useRef<HTMLDivElement>(null);

  const updateMyReplies = (html) => {
    const newreply = {
      myreply: true,
      kind: "t1",
      data: {
        author: session?.user?.name,
        body_html: html,
        created_utc: Math.floor(Date.now() / 1000),
        depth: 0,
        parent_id: apost?.name,
        score: 1,
      },
    };
    setmyReplies((replies) => [newreply, ...myReplies]);
    setopenReply(false);
  };

  const [hideNSFW, setHideNSFW] = useState(false);
  useEffect(() => {
    context.nsfw === "false" && apost?.over_18
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
    const fetchPost = async () => {
      if (Object.keys(postData).length > 0) {
        setPost(postData);
        setLoadingPost(false);
      }
      const { post, comments } = await loadPost(permalink, sort);
      if (Object.keys(postData).length === 0) {
        console.log("post", post);
        if (post?.id) {
          setPost(post);
          setLoadingPost(false);
        } else {
          setError(true);
        }
      }

      setComments(comments);
      setLoadingComments(false);
    };
    fetchPost();
    return () => {
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
    const newcomments = await loadComments(permalink, sort);
    setComments(newcomments);
    setLoadingComments(false);
  };

  useEffect(() => {
    setScore(calculateScore(apost?.score ? apost?.score + vote : 0));

    return () => {};
  }, [apost, vote]);

  const calculateScore = (x: number) => {
    if (x < 10000) {
      return x.toString();
    } else {
      let y = Math.floor(x / 1000);
      let z = (x / 1000).toFixed(1);
      return z.toString() + "k";
    }
  };

  const roundedToDigits = (input, digits) => {
    let rounded = Math.pow(10, digits);
    return (Math.round(input * rounded) / rounded).toFixed(digits);
  };

  const scrollComments = () => {
    const element = document.getElementById("anchor-name");
    //let node = ReactDOM.findDOMNode(divRef.current) as Element;
    element.scrollIntoView({ block: "start", behavior: "smooth" });
    //window.scrollBy(0, -10); // Adjust scrolling with a negative value here
  };

  const handleBack = () => {
    setSelect(false);
    //console.log("Clicked back");
    //for handling returning to [frontsort] routes, only clicking in the app works... browser back button kicks to front page
    if (returnRoute) {
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

  const updateComments = async (newlink) => {
    setLoadingComments(true);
    const { post, comments } = await loadPost(newlink, sort);
    // if (Object.keys(postData).length === 0) {
    //   setPost(post);
    //   setLoadingPost(false);
    // }

    setComments(comments);
    setLoadingComments(false);
  };

  const changePost = (move) => {
    if (move === 1) {
      //console.log(postNum, context.postNum, context.posts.length);
      if (context.posts?.[context.postNum + 1]?.data) {
        //console.log("movenext");
        setPost(context.posts[context.postNum + 1].data);
        updateComments(context.posts[context.postNum + 1]?.data?.permalink);
        // router.push("", context.posts[context.postNum + 1]?.data?.permalink, {
        //   shallow: true,
        // });
        context.setPostNum((p) => p + 1);
        setVote(0);
      }
    } else if (move === -1 && (context.postNum > 0 || postNum > 0)) {
      if (context.posts?.[context.postNum - 1]?.data) {
        //console.log("moveback");
        setPost(context.posts[context.postNum - 1].data);
        updateComments(context.posts[context.postNum - 1]?.data?.permalink);
        // router.push("", context.posts[context.postNum - 1]?.data?.permalink, {
        //   shallow: true,
        // });

        context.setPostNum((p) => p - 1);
        setVote(0);
      }
    }
    plausible("postChange");
  };

  if (wait) {
    return (
      <div className="absolute top-0 w-screen h-16 bg-blue-700 animate-pulse"></div>
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
    <div className="fixed inset-0 z-20 w-screen min-w-full min-h-screen overflow-y-auto overscroll-y-contain">
      {/* <div
          
          className="left-0 bg-black lg:w-1/12 opacity-80 "
        ></div> */}
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black backdrop-filter backdrop-blur-lg opacity-80 overscroll-none"
      ></div>
      {context.posts?.[context.postNum - 1]?.data && (
        <div
          onClick={(e) => changePost(-1)}
          className="fixed p-2 text-gray-400 cursor-pointer left-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineLeft className="w-10 h-10" />
        </div>
      )}
      {!wait && (
        <>
          <div className="flex flex-row justify-center h-full">
            {/* Portrait Media */}
            {usePortrait && (
              <div className="relative z-10 flex items-center justify-center mt-16 mr-3 overflow-y-auto bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG md:w-6/12 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800">
                <div className={"flex-grow " + (!imgFull && " my-auto")}>
                  <div
                    className={
                      "block relative   " + (hideNSFW && " overflow-hidden")
                    }
                  >
                    <div className={(hideNSFW && "blur-3xl ") + " block "}>
                      <Media
                        post={apost}
                        allowIFrame={true}
                        imgFull={imgFull}
                        portraitMode={true}
                        postMode={true}
                      />
                    </div>
                    {hideNSFW && (
                      <div className="absolute flex flex-row justify-center w-full opacity-50 text-lightText top-1/2">
                        hidden
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Main Card */}
            <div
              className={
                (!usePortrait ? "w-full md:w-10/12 lg:w-3/4 " : " md:w-4/12 ") +
                " z-10 pt-2  md:flex md:flex-col md:items-center "
              }
            >
              <div className="absolute md:fixed left-4 top-16">
                <RiArrowGoBackLine
                  onClick={() => handleBack()}
                  className="w-8 h-8 mt-1 text-gray-400 cursor-pointer hover:text-gray-300"
                />
              </div>
              {/* Content container */}
              <div
                className="flex flex-col w-full mt-24 overflow-y-auto border-t border-transparent rounded-lg md:mt-14 dark:border-darkBorder md:pt-0 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800"
                onClick={(e) => e.stopPropagation()}
              >
                {/* LOADING POST CARD */}
                {loadingPost ? (
                  // Loading Media Card
                  <div className="w-full mb-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                    {/* Flex container */}
                    <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
                      {/* Upvote column */}
                      <div className="flex-col flex-none items-center self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex animate-pulse ">
                        <BiUpvote
                          className={
                            (vote === 1 && "text-upvote ") +
                            " flex-none cursor-pointer w-7 h-7 hover:text-upvote hover:scale-110 "
                          }
                        />
                        <div className="flex-grow w-full h-4 py-1.5 bg-gray-300 rounded dark:bg-gray-800 text-transparent">
                          0000
                        </div>
                        <BiDownvote
                          className={
                            (vote === -1 && "text-downvote ") +
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
                              href={`https://www.reddit.com/${
                                apost?.permalink ?? ""
                              }`}
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
                ) : (
                  // Loaded Media Card
                  <div className="w-full mb-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                    {/* Flex container */}
                    <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
                      {/* Upvote column */}
                      <div className="flex-col items-center self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex ">
                        <Vote
                          likes={apost?.likes}
                          name={apost?.name}
                          score={apost?.score}
                          size={7}
                        />
                      </div>
                      {/* Main Media Column */}
                      <div className="flex-grow border-gray-100 md:border-l dark:border-darkHighlight">
                        {/* Title etc*/}
                        <div className="flex flex-row flex-none pt-1.5 text-sm md:pl-3">
                          <Link href={`/u/${apost?.author}`}>
                            <a
                              onClick={(e) => {
                                e.stopPropagation();
                              }}
                            >
                              <h2 className="ml-1 mr-1 font-semibold hover:underline">
                                u/
                                {apost?.author ?? ""}
                              </h2>
                            </a>
                          </Link>
                          <Link href={`/r/${apost?.subreddit}`}>
                            <a
                              className="mr-1"
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

                          <p className="">
                            {secondsToTime(apost?.created_utc)}
                          </p>
                          {apost?.over_18 && (
                            <div className="flex flex-row pl-1 space-x-1">
                              <p>•</p>
                              <span className="text-red-400 text-color dark:text-red-700">
                                NSFW
                              </span>
                            </div>
                          )}
                          <div className="flex flex-row ml-auto">
                            <p className="ml-1">{`(${apost?.domain})`}</p>
                          </div>
                        </div>
                        <h1 className="flex items-center justify-start py-2 md:pl-3">
                          <a
                            className={
                              (apost?.distinguished == "moderator" ||
                                (apost?.stickied &&
                                  " text-green-500 dark:text-green-700")) +
                              " text-xl font-semibold"
                            }
                            href={`https://www.reddit.com${
                              apost?.permalink ?? ""
                            }`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {apost?.title ?? ""}
                          </a>
                          {apost?.link_flair_richtext?.length > 0 && (
                            <span className="ml-1 text-xs">
                              {"  "}
                              <TitleFlair post={apost} />
                            </span>
                          )}
                        </h1>

                        {/* Image/Video/Text Body */}
                        {!usePortrait && (
                          <>
                            <div
                              className={
                                "block relative md:ml-4" +
                                (hideNSFW && " overflow-hidden")
                              }
                            >
                              <div className={hideNSFW && "blur-3xl"}>
                                <Media
                                  post={apost}
                                  allowIFrame={true}
                                  imgFull={imgFull}
                                  postMode={true}
                                />
                              </div>
                              {hideNSFW && (
                                <div className="absolute flex flex-row justify-center w-full opacity-50 text-lightText top-1/2">
                                  hidden
                                </div>
                              )}
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
                                    className={
                                      "flex-none  " +
                                      (usePortrait
                                        ? " w-6 h-6 "
                                        : " w-5 h-5 m-0.5")
                                    }
                                  />
                                </button>
                              </>
                            )}

                            <button
                              onClick={(e) => setimgFull((p) => !p)}
                              className="flex-row items-center hidden p-2 border rounded-md sm:flex border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight "
                            >
                              {imgFull ? (
                                <>
                                  <h1
                                    className={
                                      "hidden " + (!usePortrait && " md:block ")
                                    }
                                  >
                                    Size
                                  </h1>
                                  <BiExpand
                                    className={
                                      "flex-none w-6 h-6 " +
                                      (!usePortrait && " md:pl-2")
                                    }
                                  />
                                </>
                              ) : (
                                <>
                                  <h1
                                    className={
                                      "hidden " + (!usePortrait && " md:block ")
                                    }
                                  >
                                    Size
                                  </h1>
                                  <BiCollapse
                                    className={
                                      "flex-none w-6 h-6 " +
                                      (!usePortrait && " md:pl-2")
                                    }
                                  />
                                </>
                              )}
                            </button>
                          </div>
                          <div className="flex flex-row items-center justify-end space-x-1">
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
                                    "flex-none w-6 h-6 scale-x-[-1] " +
                                    (!usePortrait && " md:pr-2")
                                  }
                                />
                                <h1
                                  className={
                                    "hidden " + (!usePortrait && " md:block ")
                                  }
                                >
                                  Reply
                                </h1>
                              </button>
                            </div>
                            <a
                              href={`${apost?.url}` ?? "https://reddit.com"}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                                <BiExit
                                  className={
                                    "flex-none w-6 h-6 " +
                                    (!usePortrait && " md:pr-2")
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
                                    "flex-none w-6 h-6 " +
                                    (!usePortrait && " md:pr-2")
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
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* post reply */}

                <div
                  className={
                    (openReply ? "block " : "hidden ") +
                    "bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG p-2 mb-3"
                  }
                >
                  <CommentReply
                    parent={apost?.name}
                    getHtml={updateMyReplies}
                  />
                </div>

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
                  <div className="flex flex-row justify-between h-10 px-2 mt-2 ">
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
                    <div className="z-10 flex-none">
                      <CommentSort updateSort={updateSort} sortBy={sort} />
                    </div>
                  </div>
                  {/* Loading Comments */}
                  {loadingComments ? (
                    // Comment Loader

                    <div className="mx-2 my-1 border rounded-md border-lightBorder dark:border-darkBorder h-80">
                      <div className={"flex flex-row"}>
                        {/* Left column */}
                        <div
                          className={
                            "h-80 w-1  md:w-4 flex-none  cursor-pointer group animate-pulse"
                          }
                        >
                          <div className="flex-none w-1 min-h-full bg-blue-600 hover:bg-blue-800 group-hover:bg-blue-800 dark:bg-red-700 rounded-l-md dark:hover:bg-red-600 dark:group-hover:bg-red-600"></div>
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
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                          <div className="w-full h-5 bg-gray-300 rounded-md dark:bg-gray-800"></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Loaded Comment
                    <div
                      ref={divRef}
                      className="flex flex-col items-center justify-center w-full mb-5 overflow-x-hidden"
                    >
                      <h1 className="">
                        {post_comments?.[0] ? "" : "no comments :("}
                      </h1>
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

      {/* <div
          onClick={() => handleBack()}
          className="right-0 bg-black lg:w-1/12 opacity-80 "
        ></div> */}
      {context.posts?.length > 0 && (
        <div
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
