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
import { secondsToTime } from "../../lib/utils";
import Card1 from "./views/Card1";
import Card2 from "./views/Card2";
import Row1 from "./views/Row1";

const Post = ({ post, postNum = 0 }) => {
  const context: any = useMainContext();
  const [hideNSFW, setHideNSFW] = useState(false);
  const [score, setScore] = useState("");
  const [select, setSelect] = useState(false);
  const [forceMute, setforceMute] = useState(0);
  const router = useRouter();
  const [session, loading] = useSession();
  const [hasMedia, setHasMedia] = useState(false);
  //console.log(post);

  useEffect(() => {
    context.nsfw === "false" && post.over_18
      ? setHideNSFW(true)
      : setHideNSFW(false);
    findMedia();
    return () => {
      setHideNSFW(false);
    };
  }, [context, post]);

  const [lastRoute, setLastRoute] = useState("");
  const [returnRoute, setReturnRoute] = useState("");

  useEffect(() => {
    if (lastRoute === router.asPath) {
      //console.log("match");
      setSelect(false);
      context.setPauseAll(false);
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
    context.setPauseAll(true);
    setSelect(true);
    // need to handle pushing to [frontsort].. this kinda works (browser buttons don't work, app buttons do)
    if (router.query?.frontsort) {
      // router.push("/", post.permalink);
      // console.log("FRONSORT");
      //setReturnRoute(router.asPath);
      router.push("", post.id, { shallow: true });
    } else if (router.pathname.includes("/user/")) {
     router.push("",`/user/${post.author}/p/${post.id}`,{shallow:true});
    } else {
      router.push("", post.permalink, { shallow: true });
    }

  };

  const findMedia = () => {
    if (post?.preview?.reddit_video_preview) {
      setHasMedia(true);
    } else if (post?.media?.reddit_video) {
      setHasMedia(true);
    } else if (post?.media_metadata) {
      setHasMedia(true);
    } else if (post?.preview?.images?.[0]) {
      setHasMedia(true);
    } else if (post?.url) {
      if (
        post.url.includes(".jpg") ||
        post.url.includes(".png") ||
        post.url.includes(".gif")
      ) {
        setHasMedia(true);
      }
    } else {
      setHasMedia(false);
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
          postData={post}
          postNum={postNum}
        />
      )}

      {/* Click wrappter */}
      <div onClick={() => handleClick()}>
        {/* OG Card */}
        {/* <h1>{postNum}</h1> */}
        {context?.cardStyle === "row1" ? (
          <Row1
            post={post}
            hasMedia={hasMedia}
            hideNSFW={hideNSFW}
            score={score}
            vote={vote}
            castVote={castVote}
            forceMute={forceMute}
          />
        ) : context?.cardStyle === "card2" ? (
          <Card2
            post={post}
            hasMedia={hasMedia}
            hideNSFW={hideNSFW}
            score={score}
            vote={vote}
            castVote={castVote}
            forceMute={forceMute}
          />
        ) : (
          <Card1
            post={post}
            hasMedia={hasMedia}
            hideNSFW={hideNSFW}
            score={score}
            vote={vote}
            castVote={castVote}
            forceMute={forceMute}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
