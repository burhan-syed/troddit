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
import { findMediaInfo, secondsToTime } from "../../lib/utils";
import Card1 from "./views/Card1";
import Card2 from "./views/Card2";
import Row1 from "./views/Row1";

// import { usePlausible } from "next-plausible";

const Post = ({ post, postNum = 0 }) => {
  const context: any = useMainContext();
  const [hideNSFW, setHideNSFW] = useState(false);
  const [score, setScore] = useState("");
  const [select, setSelect] = useState(false);
  const [forceMute, setforceMute] = useState(0);
  const router = useRouter();
  const [session, loading] = useSession();
  const [hasMedia, setHasMedia] = useState(false);
  // const plausible = usePlausible();
  const [margin, setMargin] = useState("m-1");

  useEffect(() => {
    context.nsfw === "false" && post.over_18
      ? setHideNSFW(true)
      : setHideNSFW(false);
    post.spoiler && setHideNSFW(true);
    findMedia();
    return () => {
      setHideNSFW(false);
    };
  }, [context, post]);

  useEffect(() => {
    //console.log(context.columns, context.cardStyle);
    context.cardStyle === "row1"
      ? setMargin("m-0")
      : context.columns === 1
      ? setMargin("m-1")
      : context.columns > 4
      ? setMargin("m-0.5")
      : setMargin("m-1");
  }, [context.columns, context.cardStyle]);

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

  const handleClick = (e) => {
    e.stopPropagation();
    // plausible("postOpen");
    if (!e.ctrlKey) {
      setLastRoute(router.asPath);
      context.setPauseAll(true);
      setSelect(true);
      // need to handle pushing to [frontsort].. this kinda works (browser buttons don't work, app buttons do)
      if (router.query?.frontsort) {
        // router.push("/", post.permalink);
        // console.log("FRONSORT");
        //setReturnRoute(router.asPath);
        router.push("", post.id, { shallow: true });
      } else if (
        router.pathname.includes("/u/") &&
        session?.user?.name?.toUpperCase() ===
          router?.query?.slug?.[0]?.toUpperCase()
      ) {
        router.push(
          "",
          `/u/${router.query?.slug?.[0]}/${
            router?.query?.slug?.[1] ? `${router?.query?.slug?.[1]}/` : `p/`
          }${post.id}`,
          { shallow: true }
        );
      } else if (router.pathname.includes("/u/")) {
        if (router.query?.slug?.[1]?.toUpperCase() === "M"){
          //no routing
        } else {
          router.push("", `/u/${post.author}/p/${post.id}`, { shallow: true });

        }
      } else {
        router.push("", post.permalink, { shallow: true });
      }
    } else {
      window.open(`${post.permalink}`, "_blank");
    }
  };

  const findMedia = () => {
    if (post?.preview?.reddit_video_preview) {
      setHasMedia(true);
      return true;
    } else if (post?.media?.reddit_video) {
      setHasMedia(true);
      return true;
    } else if (post?.media_metadata) {
      setHasMedia(true);
      return true;
    } else if (post?.preview?.images?.[0]) {
      setHasMedia(true);
      return true;
    } else if (post?.url) {
      if (
        post.url.includes(".jpg") ||
        post.url.includes(".png") ||
        post.url.includes(".gif")
      ) {
        setHasMedia(true);
        return true;
      }
    } else {
      setHasMedia(false);
      return false;
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
    <div className={margin + " z-30"}>
      {select && (
        <PostModal
          permalink={post?.permalink}
          setSelect={setSelect}
          returnRoute={router.query?.slug?.[1]?.toUpperCase() === "M" ? "multimode" : undefined}
          postData={post}
          postNum={postNum}
        />
      )}

      {/* Click wrappter */}
      <div className="select-none" onClick={(e) => handleClick(e)}>
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
            postNum={postNum}
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
            postNum={postNum}
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
            postNum={postNum}
          />
        )}
      </div>
    </div>
  );
};

export default Post;
