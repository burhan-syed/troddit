/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";

import { useMainContext } from "../MainContext";
import PostModal from "./PostModal";
import { useRouter } from "next/dist/client/router";
import Media from "./Media";
import { postVote } from "../RedditAPI";
import { useSession } from "next-auth/client";

const Post = ({ post }) => {
  const context: any = useMainContext();
  const [hide, setHide] = useState(false);
  const [score, setScore] = useState("");
  const [select, setSelect] = useState(false);

  const router = useRouter();
  const [session, loading] = useSession();
  //console.log(post);

  useEffect(() => {
    context.nsfw === "false" && post.over_18 ? setHide(true) : setHide(false);
    return () => {
      setHide(false);
    };
  }, [context, post]);

  const [lastRoute, setLastRoute] = useState("");
  const [returnRoute, setReturnRoute] = useState("");

  useEffect(() => {
    if (lastRoute === router.asPath) {
      //console.log("match");
      setSelect(false);
    }
    //don't add lastRoute to the array, breaks things
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  const calculateScore = (x: number) => {
    if (x < 10000) {
      return x.toString();
    } else {
      let y = Math.floor(x / 1000);
      let z = (x / 1000).toFixed(1);
      return z.toString() + "k";
    }
  };

  const handleClick = () => {
    setLastRoute(router.asPath);
    setSelect(true);
    //need to handle pushing to [frontsort].. this kinda works (browser buttons don't work, app buttons do)
    if (router.query?.frontsort) {
      // router.push("/", post.permalink);
      // console.log("FRONSORT");
      setReturnRoute(router.asPath);
    } else if (router.pathname.includes("/user/")) {
      router.push(post.permalink);
    } else {
      router.push("", post.permalink, { shallow: true });
    }
  };

  const [vote, setVote] = useState(0);

  const castVote = async (e, v) => {
    e.stopPropagation();
    if (session) {
      v === vote ? (v = 0) : undefined;
      let res = await postVote(v, post.name);
      res ? setVote(v) : undefined;
    } else {
      context.setLoginModal(true);
    }
  };
  useEffect(() => {
    setScore(calculateScore(post?.score ? post?.score + vote : 0));

    return () => {};
  }, [post, vote]);

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
        className="px-3 pt-3 pb-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm dark:bg-trueGray-900 dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-500"
      >
        <div className="">
          <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
            <h1 className="text-lg font-medium leading-none cursor-pointer">
              {post?.title ?? ""}
            </h1>
          </a>

          <div className="flex flex-row py-1 text-xs font-light truncate text-gray">
            <Link href={`/r/${post?.subreddit}`}>
              <a
                className="mr-1"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h2>r/{post?.subreddit ?? "ERR"}</h2>
              </a>
            </Link>
            <p>•</p>
            <Link href={`/user/${post?.author}`}>
              <a
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h2 className="ml-1 mr-1">u/{post?.author ?? ""}</h2>
              </a>
            </Link>
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

          <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
            <div className="py-1">
              {!hide ? (
                <Media post={post} />
              ) : (
                <div className="flex flex-row justify-center text-red-400 text-color dark:text-red-700">
                  NSFW
                </div>
              )}
            </div>
          </a>
          {/* <p>{post?.url ?? "ERR"}</p> */}

          <div className="flex flex-row justify-between py-1 text-sm align-bottom select-none">
            <div className="flex flex-row items-center space-x-1">
              <div className="flex-none hover:cursor-pointer ">
                <BiUpvote
                  className={
                    (vote === 1
                      ? "text-upvote "
                      : " text-black dark:text-white") +
                    " w-5 h-5 hover:scale-110 hover:text-upvote"
                  }
                  onClick={(e) => castVote(e, 1)}
                />
              </div>
              <p className="">{score}</p>

              <div className="flex-none hover:cursor-pointer ">
                <BiDownvote
                  className={
                    (vote === -1
                      ? " text-downvote "
                      : " text-black dark:text-white ") +
                    " w-5 h-5 hover:scale-110 hover:text-downvote"
                  }
                  onClick={(e) => castVote(e, -1)}
                />
              </div>
            </div>
            <a href={post?.permalink} onClick={(e) => e.preventDefault()}>
              <h1 className="cursor-pointer ">
                {`${post.num_comments} ${
                  post.num_comments === 1 ? "comment" : "comments"
                }`}
              </h1>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Post;
