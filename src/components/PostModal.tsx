import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { loadPost } from "../RedditAPI";
import Media from "./Media";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { BiComment } from "react-icons/bi";
import { CgCloseO } from "react-icons/cg";
import ReactDOM from "react-dom";
import React, { useRef } from "react";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [score, setScore] = useState("");
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPost = async () => {
      const { post, comments } = await loadPost(permalink);
      setScore(calculateScore(post?.score ?? 0));
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
        <div className="z-10 sm:w-full md:w-10/12 lg:w-3/4 md:flex md:flex-col md:items-center ">
          {/* Content container */}
          <div className="w-full mt-12 overflow-y-auto">
            {/* Mobile close button */}
            <div className="flex flex-row w-full md:hidden ">
              <CgCloseO className="w-12 h-12 " onClick={() => handleBack()} />
            </div>
            {/* media */}
            {loadingPost ? (
              // Loading Media Card
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
              // Media Card
              <div className="w-full mb-3 bg-white border-b rounded-b-lg dark:bg-darkBG">
                {/* Flex container */}
                <div className="flex flex-row items-center md:pr-3 md:pb-3 p-4 md:pl-0 lg:pr-4 pt-2.5 lg:pb-4">
                  {/* Upvote column */}
                  <div className="flex-col items-center self-start justify-start hidden w-20 h-full px-2 md:flex ">
                    <BiUpvote className="flex-none cursor-pointer w-7 h-7 hover:text-upvote hover:scale-110" />
                    <p className="">{score ?? "0"}</p>
                    <BiDownvote className="flex-none cursor-pointer w-7 h-7 hover:text-downvote hover:scale-110" />
                  </div>
                  {/* Main Media Column */}
                  <div className="flex-grow ">
                    {/* Title etc*/}
                    <div className="flex flex-row flex-none pt-1.5 text-xs font-light text-gray">
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
                    <h1 className="py-2">
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
                    <div className="block ">
                      <Media post={apost} allowIFrame={true} imgFull={true} />
                    </div>
                    {/* Bottom Buttons */}
                    <div className="flex flex-row items-center justify-end mt-2 select-none">
                      <div
                        onClick={() => scrollComments()}
                        className="flex flex-row items-center p-2 space-x-1 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
                      >
                        <BiComment className="flex-none w-6 h-6 pr-2" />
                        {`${apost?.num_comments} ${
                          apost?.num_comments === 1 ? "comment" : "comments"
                        }`}
                      </div>
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
              <div className="flex-grow bg-white border rounded-lg dark:bg-darkBG">
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
                  <div className="flex-grow w-full">
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
