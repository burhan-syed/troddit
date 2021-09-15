/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";

import { useMainContext } from "../MainContext";
import PostModal from "./PostModal";
import { useRouter } from "next/dist/client/router";
import Iframe from "react-iframe";
import Media from "./Media";
import { postVote } from "../RedditAPI";

const Post = ({ post }) => {
  const context: any = useMainContext();
  const [hide, setHide] = useState(false);

  const [select, setSelect] = useState(false);

  const router = useRouter();

  //console.log(post);

  useEffect(() => {
    !context.nsfw && post.over_18 ? setHide(true) : setHide(false);
    return () => {
      setHide(false);
    };
  }, [context, post]);

  const [lastRoute, setLastRoute] = useState("");
  const [returnRoute, setReturnRoute] = useState("");

  useEffect(() => {
    if (lastRoute === router.asPath) {
      console.log("match");
      setSelect(false);
    }
    //don't add lastRoute to the array, breaks things
  }, [router.asPath]);

  const handleClick = () => {
    setLastRoute(router.asPath);
    setSelect(true);
    //need to handle pushing to [frontsort].. this kinda works (browser buttons don't work, app buttons do)
    if (router.query?.frontsort) {
      // router.push("/", post.permalink);
      // console.log("FRONSORT");
      setReturnRoute(router.asPath);
    } else {
      router.push("", post.permalink, { shallow: true });
    }
  };

  const [vote, setVote] = useState(0)

  const castVote = async(e,v) => {
    e.stopPropagation();
    v === vote ?  (v = 0) : undefined;
    let res = await postVote(v,post.name);
    res ? setVote(v) : undefined
  }

  return (
    <div>
      {select && (
        <PostModal
          permalink={post?.permalink}
          setSelect={setSelect}
          returnRoute={returnRoute}
        />
      )}
      <div
        onClick={() => handleClick()}
        className="p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm dark:bg-trueGray-900 dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-500"
      >
        {!hide ? (
          <div className="p-1">
            <h1 className="text-base cursor-pointer">
                {post?.title ?? ""}
            </h1>
            <div className="flex flex-row text-xs font-light text-gray">
              <Link href={`/r/${post?.subreddit}`}>
                <a className="mr-1" onClick={(e) => {e.stopPropagation()}}>r/{post?.subreddit ?? "ERR"}</a>
              </Link>
              <p>•</p>
              <a className="ml-1 mr-1">u/{post?.author ?? ""}</a>
              <p>•</p>

              <p className="ml-1">
                {Math.floor(
                  (Math.floor(Date.now() / 1000) - post.created_utc) / 3600
                )}
                hr
              </p>
              <div className="flex flex-row ml-auto">
                <p className="ml-1">{`(${post.domain})`}</p>
              </div>
            </div>
            <div className="pt-2 pb-2">
              <Media post={post} />
            </div>
            {/* <p>{post?.url ?? "ERR"}</p> */}

            <div className="flex flex-row justify-between text-sm align-bottom select-none">
              <div className="flex flex-row items-center space-x-1">
                <div className="flex-none hover:cursor-pointer ">
                  <BiUpvote className={(vote === 1 ? "text-upvote " : " text-black dark:text-white") + " w-4 h-4 hover:scale-110 hover:text-upvote"} onClick={(e) => castVote(e,1)}/>
                </div>
                <p className="">{post?.score ? (post.score+vote) : vote}</p>

                <div className="flex-none hover:cursor-pointer ">
                  <BiDownvote className={(vote === -1 ? " text-downvote " : " text-black dark:text-white ") + " w-4 h-4 hover:scale-110 hover:text-downvote"} onClick={(e) => castVote(e,-1)}/>
                </div>
              </div>

              <h1
                className="cursor-pointer "
              >
                {`${post.num_comments} ${
                  post.num_comments === 1 ? "comment" : "comments"
                }`}
              </h1>
            </div>
          </div>
        ) : (
          "NSFW"
        )}
      </div>
    </div>
  );
};

export default Post;
