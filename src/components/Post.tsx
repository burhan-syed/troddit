import React,{ useEffect, useState, useRef, useCallback } from "react";
import { useMainContext } from "../MainContext";
import PostModal from "./PostModal";
import { useRouter } from "next/dist/client/router";
import { useSession } from "next-auth/react";
import Card1 from "./cards/Card1";
import Card2 from "./cards/Card2";
import Row1 from "./cards/Row1";
import CommentCard from "./cards/CommentCard";
import { useRead } from "../hooks/useRead";

const Post = ({ post, curKey, postNum = 0, fetchNextPage = () => {} }) => {
  const context: any = useMainContext();
  const [hideNSFW, setHideNSFW] = useState(false);
  const [select, setSelect] = useState(false);
  const [forceMute, setforceMute] = useState(0);
  const router = useRouter();
  const { data: session, status } = useSession();
  const [hasMedia, setHasMedia] = useState(false);
  const [margin, setMargin] = useState("m-1");
  const {read, readCount} = useRead(post?.data?.name)
  const [commentsDirect, setCommentsDirect] = useState(false); 
  const [origCommentCount, setOrigCommentCount] = useState<number>(); 
  useEffect(() => {
    context.nsfw === false && post?.data?.over_18
      ? setHideNSFW(true)
      : setHideNSFW(false);
    post?.data.spoiler && setHideNSFW(true);
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
      setCommentsDirect(false);
      context.setPauseAll(false);
    }
    //don't add lastRoute to the array, breaks things
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.asPath]);

  const handleClick = (e, toComments) => {
    e.stopPropagation();
    const multi = router.query?.m ?? ""
    if (toComments){
      setCommentsDirect(true); 
    }
    if (!e.ctrlKey && !e.metaKey) {
      setLastRoute(router.asPath);
      context.setPauseAll(true);
      setSelect(true);
      if (router.query?.frontsort) {
        router.push("", post?.data.id, { shallow: true });
      } 
      else if (
        router.pathname.includes("/u/") &&
        session?.user?.name?.toUpperCase() ===
          router?.query?.slug?.[0]?.toUpperCase()
      ) {
        router.push(
          "",
          `/u/${router?.query?.slug?.[0]}/${post.data.permalink}${multi ? `?m=${multi}` : ""}`,
          { shallow: true }
        );
      } else if (router.pathname.includes("/u/")) {
        if (router.query?.slug?.[1]?.toUpperCase() === "M" && router?.query?.slug?.[2]) {
          router.push("", `/u/${router.query?.slug?.[0]}/m/${router.query.slug[2]}${post.data.permalink}${multi ? `?m=${multi}` : ""}`, {
            shallow: true,
          });
        } else {

          router.push("", `/u/${post?.data.author}/${post.data.permalink}${multi ? `?m=${multi}` : ""}`, {
            shallow: true,
          });
        }
      } 
      else {
        router.push("", `${post?.data.permalink}${multi ? `?m=${multi}` : ""}`, { shallow: true });
      }
    } else {
      window.open(`${post?.data.permalink}`, "_blank");
    }
  };

  const findMedia = () => {
    if (post?.data?.preview?.reddit_video_preview) {
      setHasMedia(true);
      return true;
    } else if (post?.data?.media?.reddit_video) {
      setHasMedia(true);
      return true;
    } else if (post?.data?.media_metadata) {
      setHasMedia(true);
      return true;
    } else if (post?.data?.preview?.images?.[0]) {
      setHasMedia(true);
      return true;
    } else if (post?.data?.url) {
      if (
        post?.data.url.includes(".jpg") ||
        post?.data.url.includes(".png") ||
        post?.data.url.includes(".gif")
      ) {
        setHasMedia(true);
        return true;
      }
    } else {
      setHasMedia(false);
      return false;
    }
  };

  useEffect(() => {
    if (read && (readCount || readCount === 0)) {setOrigCommentCount(readCount)} else {setOrigCommentCount(undefined)};
   
  }, [readCount])

  return (
    <div className={margin + " "}>
      {select && (
        <PostModal
          permalink={post?.data?.permalink}
          setSelect={setSelect}
          returnRoute={
            router.query?.slug?.[1]?.toUpperCase() === "M"
              ? "multimode"
              : undefined
          }
          postData={post?.data}
          postNum={postNum}
          commentMode={post?.kind === "t1"}
          commentsDirect={commentsDirect}
          curKey={curKey}
          fetchMore={fetchNextPage}
        />
      )}

      {/* Click wrappter */}
      <div className="select-none" > 
        {post?.kind === "t1" ? (
          <CommentCard data={post?.data} postNum={postNum} handleClick={handleClick}/>
        ) : context?.cardStyle === "row1" ? (
          <Row1
            post={post?.data}
            hasMedia={hasMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}
          />
        ) : context?.cardStyle === "card2" ? (
          <Card2
            post={post?.data}
            hasMedia={hasMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}

          />
        ) : (
          <Card1
            post={post?.data}
            hasMedia={hasMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}

          />
        )}
      </div>
    </div>
  );
};

export default Post;
