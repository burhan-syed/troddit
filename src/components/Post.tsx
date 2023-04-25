import React, { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/dist/client/router";
import { useSession } from "next-auth/react";
import Card1 from "./cards/Card1";
import Card2 from "./cards/Card2";
import Row1 from "./cards/Row1";
import CommentCard from "./cards/CommentCard";
import { useRead } from "../hooks/useRead";
import useCardHeightTrigger from "../hooks/useCardHeightTrigger";

const Post = ({
  post,
  columns,
  postClick,
  postNum = 0,
  openPost,
  uniformMediaMode = false,
  mediaDimensions = [0, 0] as [number, number],
  showNSFW,
  cardStyle,
  inView = true,
  handleSizeChange,
  initHeight = 0,
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const postCardRef = useRef<HTMLDivElement>(null);
  const { read } = useRead(post?.data?.name);
  const checkCardHeight = useCardHeightTrigger({
    handleSizeChange,
    postCardRef,
    postName: post?.data?.name,
  });
  const [hideNSFW, setHideNSFW] = useState(false);
  const [forceMute, setforceMute] = useState(0);
  const [origCommentCount, setOrigCommentCount] = useState<number>();

  useEffect(() => {
    showNSFW === false && post?.data?.over_18
      ? setHideNSFW(true)
      : setHideNSFW(false);
    post?.data.spoiler && setHideNSFW(true);
    return () => {
      setHideNSFW(false);
    };
  }, [showNSFW, post]);

  const handleClick = (e, nav: { toComments?: boolean; toMedia?: boolean }) => {
    e.stopPropagation();
    if (!e.ctrlKey && !e.metaKey) {
      openPost(post, postNum, nav, router.asPath);
      const multi = router.query?.m ?? "";
      const queryParams = `${multi ? `?m=${multi}` : ``}`;
      if (router.query?.frontsort) {
        router.push("", `${post?.data.id}`, { shallow: true });
      } else if (
        router.pathname?.includes("/u/") &&
        session?.user?.name?.toUpperCase() ===
          router?.query?.slug?.[0]?.toUpperCase()
      ) {
        router.push(
          "",
          `/u/${router?.query?.slug?.[0]}/${post.data.permalink}${queryParams}`,
          { shallow: true }
        );
      } else if (router.pathname?.includes("/u/")) {
        if (
          router.query?.slug?.[1]?.toUpperCase() === "M" &&
          router?.query?.slug?.[2]
        ) {
          router.push(
            "",
            `/u/${router.query?.slug?.[0]}/m/${router.query.slug[2]}${post.data.permalink}${queryParams}`,
            {
              shallow: true,
            }
          );
        } else {
          router.push(
            "",
            `/u/${post?.data.author}/${post.data.permalink}${queryParams}`,
            {
              shallow: true,
            }
          );
        }
      } else {
        router.push("", `${post?.data.permalink}${queryParams}`, {
          shallow: true,
        });
      }
    } else {
      window.open(`${post?.data.permalink}`, "_blank");
    }
  };

  useEffect(() => {
    if (read) {
      setOrigCommentCount(read?.numComments);
    } else {
      setOrigCommentCount(undefined);
    }
  }, [read]);

  return (
    <div ref={postCardRef} className={""}>

      {/* Click wrapper */}
      <div
        className={"select-none"}
        onClickCapture={() => {
          postClick(post?.data?.name, postNum);
        }}
      >
        {post?.kind === "t1" ? (
          <CommentCard
            data={post?.data}
            postNum={postNum}
            handleClick={handleClick}
          />
        ) : cardStyle === "row1" ? (
          <Row1
            post={post?.data}
            columns={columns}
            hasMedia={post?.data?.mediaInfo?.hasMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}
            mediaDimensions={mediaDimensions}
            checkCardHeight={checkCardHeight}
            initHeight={initHeight}
            // newPost={post?.newPost}
          />
        ) : cardStyle === "card2" ? (
          <Card2
            inView={inView}
            columns={columns}
            post={post?.data}
            hasMedia={post?.data?.mediaInfo?.hasMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}
            mediaDimensions={mediaDimensions}
            checkCardHeight={checkCardHeight}
            // newPost={post?.newPost}

          />
        ) : (
          <Card1
            inView={inView}
            columns={columns}
            post={post?.data}
            hasMedia={post?.data?.mediaInfo?.hasMedia}
            hideNSFW={hideNSFW}
            forceMute={forceMute}
            postNum={postNum}
            read={read}
            handleClick={handleClick}
            origCommentCount={origCommentCount}
            uniformMediaMode={uniformMediaMode}
            mediaDimensions={mediaDimensions}
            checkCardHeight={checkCardHeight}
            // newPost={post?.newPost}

          />
        )}
      </div>
    </div>
  );
};

export default Post;
