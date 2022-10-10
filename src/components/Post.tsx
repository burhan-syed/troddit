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
import  useResizeObserver  from "@react-hook/resize-observer";

const Post = ({ post, postNum = 0, openPost, handleSizeChange, forceSizeChange }) => {
  const postRef = useRef<HTMLDivElement>(null);
  useResizeObserver(postRef, () => handleSizeChange(post?.data?.name, postRef?.current?.getBoundingClientRect()?.height))
  const recomputeSize = () => {
    forceSizeChange(post?.data?.name, postRef?.current?.getBoundingClientRect()?.height)
  }
  const context: any = useMainContext();
  const [hideNSFW, setHideNSFW] = useState(false);
  const [select, setSelect] = useState(false);
  const [forceMute, setforceMute] = useState(0);
  const router = useRouter();
  const { data: session, status } = useSession();
  const {read} = useRead(post?.data?.name)
  const [commentsDirect, setCommentsDirect] = useState(false); 
  const [origCommentCount, setOrigCommentCount] = useState<number>(); 
  useEffect(() => {
    context.nsfw === false && post?.data?.over_18
      ? setHideNSFW(true)
      : setHideNSFW(false);
    post?.data.spoiler && setHideNSFW(true);
    return () => {
      setHideNSFW(false);
    };
  }, [context, post]);



  const handleClick = (e, toComments) => {
    e.stopPropagation();
    const multi = router.query?.m ?? ""
    if (!e.ctrlKey && !e.metaKey) {
      context.setPauseAll(true);
      openPost(post,postNum,toComments);
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

  useEffect(() => {
    if (read) {setOrigCommentCount(read?.numComments)} else {setOrigCommentCount(undefined)};
  }, [read])

  return (
    <div ref={postRef} className={""}>
      {/* Click wrappter */}
      <div className="select-none" > 
        {post?.kind === "t1" ? (
          <CommentCard data={post?.data} postNum={postNum} handleClick={handleClick}/>
        ) : context?.cardStyle === "row1" ? (
          <Row1
            post={post?.data}
            hasMedia={post?.data?.mediaInfo?.isMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}
            recomputeSize={recomputeSize}
          />
        ) : context?.cardStyle === "card2" ? (
          <Card2
            post={post?.data}
            hasMedia={post?.data?.mediaInfo?.isMedia}
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
            hasMedia={post?.data?.mediaInfo?.isMedia}
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
