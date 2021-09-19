import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { loadComments, loadPost, postVote } from "../RedditAPI";
import Media from "./Media";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { BiComment } from "react-icons/bi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import ReactDOM from "react-dom";
import React, { useRef } from "react";
import { useSession } from "next-auth/client";
import { useMainContext } from "../MainContext";
import CommentSort from "./CommentSort";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [score, setScore] = useState("");
  const [vote, setVote] = useState(0);

  const [session, loading] = useSession();
  const context: any = useMainContext();
  const castVote = async (e, v) => {
    e.stopPropagation();
    if (session) {
      v === vote ? (v = 0) : undefined;
      let res = await postVote(v, apost?.name);
      res ? setVote(v) : undefined;
    } else {
      context.toggleLoginModal();
    }
  };
  const divRef = useRef<HTMLDivElement>(null);

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
      const { post, comments } = await loadPost(permalink);
      setPost(post);
      setLoadingPost(false);
      setComments(comments);
      setLoadingComments(false);
    };
    fetchPost();
    return () => {
      setPost({});
      setComments([]);
      setLoadingComments(true);
      setLoadingPost(true);
    };
  }, [permalink]);

  const updateSort = async (e, sort) => {
    e.preventDefault();
    setLoadingComments(true);
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

  return (
    <div className="fixed inset-0 z-20 w-screen min-w-full min-h-screen overflow-y-auto overscroll-y-contain">
      {/* <div
          
          className="left-0 bg-black lg:w-1/12 opacity-80 "
        ></div> */}
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black backdrop-filter backdrop-blur-lg opacity-80 overscroll-none"
      ></div>
      <div className="flex flex-row justify-center flex-grow w-full h-full ">
        {/* Main Card */}
        <div className="z-10 w-11/12 pt-2 md:w-10/12 lg:w-3/4 md:flex md:flex-col md:items-center ">
          <div className="absolute md:fixed left-4 top-16">
            <RiArrowGoBackLine
              onClick={() => handleBack()}
              className="w-8 h-8 mt-1 text-gray-400 cursor-pointer hover:text-gray-300"
            />
          </div>
          {/* Content container */}
          <div className="w-full pt-10 mt-12 overflow-y-auto md:pt-0 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800 ">
            {/* LOADING POST CARD */}
            {loadingPost ? (
              // Loading Media Card
              <div className="w-full my-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
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
                      <div
                        onClick={() => scrollComments()}
                        className="flex flex-row items-center p-2 ml-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
                      >
                        <BiComment className="flex-none w-6 h-6 pr-2 " />
                        {`${apost?.num_comments ?? ""} ${
                          apost?.num_comments === 1 ? "comment" : "comments"
                        }`}
                      </div>
                      <div className="flex flex-row items-center justify-end">
                        <a
                          href={`${apost?.url}` ?? "https://reddit.com"}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight ">
                            <BiExit className="flex-none w-6 h-6 pr-2" />
                            Source
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
                            <ImReddit className="flex-none w-6 h-6 pr-2" />
                            Original
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Loaded Media Card
              <div className="w-full my-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                {/* Flex container */}
                <div className="flex flex-row items-center p-3 md:pl-0 md:pt-4 md:pr-4 md:pb-4">
                  {/* Upvote column */}
                  <div className="flex-col items-center self-start justify-start hidden h-full pt-1.5 md:px-2 md:flex ">
                    <BiUpvote
                      onClick={(e) => castVote(e, 1)}
                      className={
                        (vote === 1 && "text-upvote ") +
                        " flex-none cursor-pointer w-7 h-7 hover:text-upvote hover:scale-110"
                      }
                    />
                    <p
                      className={
                        (vote === 1
                          ? "text-upvote "
                          : vote === -1
                          ? "text-downvote "
                          : " ") + " text-sm"
                      }
                    >
                      {score ?? "0"}
                    </p>
                    <BiDownvote
                      onClick={(e) => castVote(e, -1)}
                      className={
                        (vote === -1 && "text-downvote ") +
                        " flex-none cursor-pointer w-7 h-7 hover:text-downvote hover:scale-110"
                      }
                    />
                  </div>
                  {/* Main Media Column */}
                  <div className="flex-grow border-gray-100 md:border-l dark:border-darkHighlight">
                    {/* Title etc*/}
                    <div className="flex flex-row flex-none pt-1.5 text-xs font-light text-gray md:pl-3">
                      <a className="mr-1 ">
                        {"Posted by " + `u/${apost?.author ?? ""}`}
                      </a>
                      <Link href={`/r/${apost?.subreddit}`}>
                        <a
                          className="mr-1"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          on r/{apost?.subreddit ?? "unknown"}
                        </a>
                      </Link>

                      <p className="">
                        {Math.floor(
                          (Math.floor(Date.now() / 1000) - apost?.created_utc) /
                            3600
                        )}{" "}
                        hours ago
                      </p>
                      <div className="flex flex-row ml-auto">
                        <p className="ml-1">{`(${apost?.domain})`}</p>
                      </div>
                    </div>
                    <h1 className="py-2 md:pl-3">
                      <a
                        className="text-xl"
                        href={`https://www.reddit.com${apost?.permalink ?? ""}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {apost?.title ?? ""}
                      </a>
                    </h1>

                    {/* Image/Video/Text Body */}
                    <div className="block md:pl-3">
                      <Media post={apost} allowIFrame={true} imgFull={true} />
                    </div>
                    {/* Vote buttons for mobiles */}

                    {/* Bottom Buttons */}
                    <div className="flex flex-row items-center justify-between mt-2 space-x-2 select-none">
                      <div className="flex flex-row items-center self-center justify-start h-full py-1 space-x-2 md:hidden">
                        <BiUpvote
                          onClick={(e) => castVote(e, 1)}
                          className={
                            (vote === 1 && "text-upvote ") +
                            " flex-none cursor-pointer w-7 h-7 hover:text-upvote hover:scale-110 "
                          }
                        />
                        <p
                          className={
                            (vote === 1
                              ? "text-upvote "
                              : vote === -1
                              ? "text-downvote "
                              : " ") + " text-sm"
                          }
                        >
                          {score ?? "0"}
                        </p>
                        <BiDownvote
                          onClick={(e) => castVote(e, -1)}
                          className={
                            (vote === -1 && "text-downvote ") +
                            " flex-none cursor-pointer w-7 h-7 hover:text-downvote hover:scale-110"
                          }
                        />
                      </div>
                      <div></div>
                      <div className="flex flex-row items-center justify-end space-x-1">
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
            )}

            {/* comments */}
            <div className="flex-grow bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
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
                      {`${apost?.num_comments === 1 ? "comment" : "comments"}`}
                    </h1>
                  </div>
                </div>
                <div className="flex-none">
                  <CommentSort updateSort={updateSort} />
                </div>
              </div>
              {/* Loading Comments */}
              {loadingComments ? (
                // Comment Loader
                <div className="flex-grow bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG h-96">
                  <div className="mx-2 my-6 border rounded-md border-lightBorder dark:border-darkBorder h-80">
                    <div className={"flex flex-row"}>
                      {/* Left column */}
                      <div
                        className={
                          "h-80 w-1  md:w-4 flex-none  cursor-pointer group animate-pulse"
                        }
                      >
                        <div className="flex-none w-2 min-h-full bg-blue-600 hover:bg-blue-800 group-hover:bg-blue-800 dark:bg-red-700 rounded-l-md dark:hover:bg-red-600 dark:group-hover:bg-red-600"></div>
                        {/* Vote Buttons */}

                        <div
                          className={
                            "flex-col items-center justify-start flex-none pr-2 pt-4 hidden md-flex "
                          }
                        >
                          <BiUpvote
                            className={
                              " flex-none cursor-pointer w-6 h-6 hover:text-upvote hover:scale-110"
                            }
                          />
                          <BiDownvote
                            className={
                              " flex-none cursor-pointer w-6 h-6 hover:text-downvote hover:scale-110"
                            }
                          />
                        </div>
                      </div>
                      {/* Comment Body */}
                      <div
                        className={
                          "flex-grow flex-col mt-3 pt-2 space-y-2 animate-pulse ml-8 mr-4"
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
                  <div className="flex-grow w-full px-2">
                    <Comments comments={post_comments} depth={0} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* <div
          onClick={() => handleBack()}
          className="right-0 bg-black lg:w-1/12 opacity-80 "
        ></div> */}
    </div>
  );
};

export default PostModal;
