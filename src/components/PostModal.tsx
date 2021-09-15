import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { loadPost, postVote } from "../RedditAPI";
import Media from "./Media";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { BiComment } from "react-icons/bi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import ReactDOM from "react-dom";
import React, { useRef } from "react";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [score, setScore] = useState("");
  const [vote, setVote] = useState(0);

  const castVote = async (e, v) => {
    e.stopPropagation();
    v === vote ? (v = 0) : undefined;
    let res = await postVote(v, apost?.name);
    res ? setVote(v) : undefined;
  };
  const divRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    setScore(calculateScore(apost?.score ? apost?.score + vote : 0));

    return () => {
    };
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
    console.log("Clicked back");
    //for handling returning to [frontsort] routes, only clicking in the app works... browser back button kicks to front page
    if (returnRoute) {
      console.log("last route", returnRoute);
      router.push(returnRoute);
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-20 w-screen h-screen min-h-screen overflow-y-auto overscroll-y-contain">
      {/* <div
          
          className="left-0 bg-black lg:w-1/12 opacity-80 "
        ></div> */}
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black backdrop-filter backdrop-blur-lg opacity-80 overscroll-none"
      ></div>
      <div className="flex flex-row justify-center pt-2">
        {/* Main Card */}
        <div className="z-10 w-screen md:w-10/12 lg:w-3/4 md:flex md:flex-col md:items-center ">
          <div className="absolute md:fixed left-2 top-16">
            <RiArrowGoBackLine
              onClick={() => handleBack()}
              className="w-8 h-8 mt-1 text-gray-400 cursor-pointer hover:text-gray-300"
            />
          </div>
          {/* Content container */}
          <div className="w-full pt-10 mt-12 overflow-y-auto md:pt-0 ">
            {/* media */}
            {loadingPost ? (
              // Loading Media Card
              <div className="w-full mx-auto my-3 bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                <div className="flex flex-row items-center pt-2 pb-2 pr-2 md:pt-4 md:pr-4 md:pb-4">
                  <div className="flex-col items-center self-start justify-start hidden w-20 h-full md:flex animate-pulse">
                    <BiUpvote
                      className={
                        (vote === 1 && "text-upvote ") +
                        " flex-none cursor-pointer w-7 h-7 hover:text-upvote hover:scale-110"
                      }
                    />
                    <div className="w-3/4 h-4 my-1 bg-gray-300 rounded dark:bg-gray-800"></div>
                    <BiDownvote
                      className={
                        (vote === -1 && "text-downvote ") +
                        " flex-none cursor-pointer w-7 h-7 hover:text-downvote hover:scale-110"
                      }
                    />
                  </div>
                  <div className="flex-grow space-y-2 animate-pulse">
                    <div className="w-full h-10 bg-gray-300 rounded dark:bg-gray-800"></div>
                    <div className="w-3/4 h-6 bg-gray-300 rounded dark:bg-gray-800"></div>
                    <div className="w-full h-6 bg-gray-300 rounded dark:bg-gray-800 "></div>
                    <div className="w-5/6 h-6 bg-gray-300 rounded dark:bg-gray-800"></div>
                    <div className="w-5/6 bg-gray-300 rounded h-96 dark:bg-gray-800 justify-self-center "></div>
                    <div className="flex flex-row items-center justify-end mt-2 select-none">
                      <div className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight">
                        <BiComment className="flex-none w-6 h-6 pr-2" />
                        {"comments"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Media Card
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
                    <div className="flex flex-row flex-none pt-1.5 text-xs font-light text-gray md:pl-1">
                      <a className="ml-1 mr-1">
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
                    <h1 className="py-2 md:pl-1">
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
                    <div className="block md:pl-1">
                      <Media post={apost} allowIFrame={true} imgFull={true} />
                    </div>
                    {/* Bottom Buttons */}
                    <div className="flex flex-row items-center justify-end mt-2 space-x-2 select-none">
                      <div
                        onClick={() => scrollComments()}
                        className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
                      >
                        <BiComment className="flex-none w-6 h-6 pr-2" />
                        {`${apost?.num_comments} ${
                          apost?.num_comments === 1 ? "comment" : "comments"
                        }`}
                      </div>
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
            )}

            {/* comments */}
            {loadingComments ? (
              // Comment Loader
              <div className="w-full p-4 mx-auto bg-black border border-blue-300 rounded-md shadow">
                <div className="flex space-x-4 animate-pulse">
                  <div className="flex-1 py-1 space-y-4">
                    <div className="w-3/4 h-4 bg-blue-400 rounded"></div>
                    <div className="space-y-2">
                      <div className="bg-blue-400 rounded h-96"></div>
                      <div className="w-5/6 bg-blue-400 rounded h-44"></div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Loaded Comment
              <div className="flex-grow bg-white border rounded-lg border-lightBorder dark:border-darkBorder dark:bg-darkBG">
                <div
                  ref={divRef}
                  className="flex flex-col items-center justify-center w-full my-5 overflow-x-hidden"
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
                  <h1 className="">
                    {post_comments?.[0] ? "" : "no comments :("}
                  </h1>
                  <div className="flex-grow w-full px-2">
                    <Comments comments={post_comments} depth={0} />
                  </div>
                </div>
              </div>
            )}
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
