import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { loadPost } from "../RedditAPI";
import Media from "./Media";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import { CgCloseO } from "react-icons/cg";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [score, setScore] = useState("");

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
    <div className="fixed inset-0 z-20 w-screen h-screen min-h-screen border-4 border-red-500 overflow-y-none ">
      <div className="flex flex-row h-screen">
        <div
          onClick={() => handleBack()}
          className="left-0 bg-black lg:w-1/12 opacity-80 "
        ></div>
        <div className="overflow-y-auto border-4 border-green-600 lg:w-10/12 md:flex md:flex-col md:items-center overscroll-y-contain bg-coolGray-200">
          <div className="w-full mt-10">
            <div className="flex flex-row w-full lg:hidden bg-coolGray-600">
              <CgCloseO className="w-12 h-12 " onClick={() => handleBack()} />
            </div>
            {/* media */}
            {loadingPost ? (
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
              <div className="w-full bg-white border-4 border-gray-300 dark:bg-trueGray-900 dark:border-trueGray-700 ">
                <div className="flex flex-row items-center border-4 border-blue-900">
                  <div className="flex flex-col items-center self-start justify-start border border-red-500 w-14">
                    <BiUpvote className="flex-none w-7 h-7" />
                    <p className="">{score ?? "0"}</p>
                    <BiDownvote className="flex-none w-7 h-7" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex flex-row flex-none text-xs font-light text-gray">
                      <a className="ml-1 mr-1">
                        {"Posted by " + `u/${apost?.author ?? ""}`}
                      </a>
                      <p>•</p>

                      <p className="ml-1">
                        {Math.floor(
                          (Math.floor(Date.now() / 1000) - apost?.created_utc) /
                            3600
                        )}
                        hours ago
                      </p>
                      <div className="flex flex-row ml-auto">
                        <p className="ml-1">{`(${apost?.domain})`}</p>
                      </div>
                    </div>
                    <h1>
                      <a
                        className="text-xl"
                        href={`https://www.reddit.com${apost?.permalink ?? ""}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {apost?.title ?? ""}
                      </a>
                    </h1>

                    <div className="block border-2 border-blue-600">
                      <Media post={apost} allowIFrame={true} imgFull={true} />
                    </div>
                    <div className="flex flex-row items-center">
                      {`${apost?.num_comments} ${
                        apost?.num_comments === 1 ? "comment" : "comments"
                      }`}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* comments */}
            {loadingComments ? (
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
              <div>
                <div className="w-full overflow-x-hidden ">
                  <Comments comments={post_comments} depth={0} />
                </div>
              </div>
            )}
          </div>
        </div>
        <div
          onClick={() => handleBack()}
          className="right-0 bg-black lg:w-1/12 opacity-80 "
        ></div>
      </div>
    </div>
  );
};

export default PostModal;
