import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import Link from "next/dist/client/link";
import { loadComments, loadPost, postVote, getUserVotes } from "../RedditAPI";
import { BiDownvote, BiUpvote, BiExpand, BiCollapse } from "react-icons/bi";
import { HiOutlineSwitchHorizontal } from "react-icons/hi";
import { BiComment } from "react-icons/bi";
import { RiArrowGoBackLine } from "react-icons/ri";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";

import { useWindowSize } from "@react-hook/window-size";
import { BiExit } from "react-icons/bi";
import { ImReddit } from "react-icons/im";
import { BsReply, BsArchive } from "react-icons/bs";
import ReactDOM from "react-dom";
import React, { useRef } from "react";
import { useSession } from "next-auth/react";
import { useMainContext } from "../MainContext";
import CommentSort from "./CommentSort";
import CommentReply from "./CommentReply";
import { secondsToTime } from "../../lib/utils";
import TitleFlair from "./TitleFlair";
import { findMediaInfo } from "../../lib/utils";
import { useKeyPress } from "../hooks/KeyPress";
// import { usePlausible } from "next-plausible";
import Vote from "./Vote";
import MediaWrapper from "./MediaWrapper";
import Awardings from "./Awardings";
import PostTitle from "./PostTitle";
import SaveButton from "./SaveButton";
import UserFlair from "./UserFlair";
import PostOptButton from "./PostOptButton";
import { GoRepoForked } from "react-icons/go";
import SubIcon from "./SubIcon";
import useThread from "../hooks/useThread";
import Thread from "./Thread";
import useFeedGallery from "../hooks/useFeedGallery";

const PostModal = ({
  setSelect,
  returnRoute,
  permalink,
  curKey,
  fetchMore = () => {},
  postData = {},
  postNum,
  direct = false,
  commentsDirect = false,
  commentMode = false,
  withcontext = false,
}) => {

  const router = useRouter();
  const context:any = useMainContext(); 
  const { flattenedPosts } = useFeedGallery(curKey);

  
  const [sort, setSort] = useState<string>(router?.query?.sort as string ?? "top");
  const [curPost, setCurPost] = useState<any>(postData);
  const [curPostNum, setCurPostNum] = useState(postNum);


  //prevent scrolling on main body when open
  useEffect(() => {
    if (true) {
      const width = document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.width = `${width}px`;
    } else {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    }

    return () => {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    };
  }, []);

  // useEffect(() => {
  //   context.setPostOpen(true);

  //   return () => {
  //     context.setPostOpen(false);
  //   };
  // }, []);


  // const updateMyReplies = (resdata) => {
  //   const newreply = {
  //     myreply: true,
  //     kind: "t1",
  //     data: resdata,
  //   };
  //   setmyReplies((replies) => [newreply, ...replies]);
  //   setopenReply(false);
  // };



  const updateSort = async (e, sort) => {
    e.preventDefault();
    setSort(sort);
  };


  const handleBack = () => {
    setSelect(false);
    if (returnRoute === "multimode") {
      //do nothing
    } else if (returnRoute) {
      //console.log("last route", returnRoute);
      router.replace(returnRoute);
    } else {
      router.back();
    }
  };


  useEffect(() => {
    if (curPostNum + 5 > flattenedPosts?.length) fetchMore();
  }, [curPostNum]);

  const changePost = (move: 1 | -1) => {
    if (flattenedPosts?.[curPostNum + move]?.data) {
      const nextPost = flattenedPosts?.[curPostNum + move]?.data;
      setCurPost(nextPost);
      if (
        !(
          router.route === "/u/[...slug]" &&
          router.query?.slug?.[1]?.toUpperCase() === "M"
        )
      ) {
        router.replace(
          "",
          router.query?.frontsort
            ? nextPost?.id 
            : // : router.route === "/u/[...slug]" &&
            //   session?.user?.name?.toUpperCase() ===
            //     router?.query?.slug?.[0]?.toUpperCase()
            // ? `/u/${router.query?.slug?.[0]}/${
            //     router?.query?.slug?.[1]
            //       ? `${router?.query?.slug?.[1]}/`
            //       : `p/`
            //   }${flattenedPosts[curPostNum + 1]?.data?.id}`
            router.route === "/u/[...slug]"
            ? `/u/${router?.query?.slug?.[0]}${nextPost?.permalink}`
            : nextPost.permalink,
          {
            shallow: true,
          }
        );
      }
      setCurPostNum((p) =>  p + move);
    }
  };

  const nextPress = useKeyPress("ArrowRight");
  const backPress = useKeyPress("ArrowLeft");
  const escapePress = useKeyPress("Escape");

  useEffect(() => {
    if (!context.replyFocus) {
      if (nextPress) {
        changePost(1);
      } else if (backPress) {
        changePost(-1);
      } else if (escapePress) {
        handleBack();
      }
    }

    return () => {};
  }, [nextPress, backPress, escapePress, context.replyFocus]);

  const [touchStart, setTouchStart] = useState([0]);
  const [touchEnd, setTouchEnd] = useState([0]);
  const [touchStartY, setTouchStartY] = useState([0]);
  const [touchEndY, setTouchEndY] = useState([0]);
  const handleTouchStart = (e) => {
    touchStart[0] = e.targetTouches[0].clientX as number;
    touchStartY[0] = e.targetTouches[0].clientY as number;
  };
  const handleTouchMove = (e) => {
    touchEnd[0] = e.targetTouches[0].clientX as number;
    touchEndY[0] = e.targetTouches[0].clientY as number;
  };
  const handleTouchEnd = (e) => {
    if (touchStart[0] - touchEnd[0] > 100) {
    } else if (
      touchStart[0] - touchEnd[0] < -100 &&
      Math.abs(touchStartY[0] - touchEndY[0]) < 20
    ) {
      handleBack();
    }
  };

  return (
    <div
      className={
        "fixed inset-0 z-30 w-screen min-w-full min-h-screen overflow-y-auto overscroll-y-contain"
      }
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchMove={(e) => handleTouchMove(e)}
      onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black/75 opacity-80 backdrop-filter backdrop-blur-lg overscroll-none"
      ></div>
      <div
        className={
          "fixed z-50 right-8 bottom-12 md:left-4 md:top-16 md:bottom-auto  " +
          " bg-th-border/40  backdrop-opacity-10 backdrop-blur-lg rounded-full w-14 h-9 flex items-center justify-center md:dark:bg-transparent md:bg-transparent  md:h-auto   "
        }
      >
        <RiArrowGoBackLine
          title={"back (esc)"}
          onClick={() => handleBack()}
          className={
            "w-8 h-8 md:mt-1  md:text-gray-400 cursor-pointer md:hover:text-gray-300"
          }
        />
      </div>
      {flattenedPosts?.[curPostNum - 1]?.data && (
        <div
          title={`previous post (left arrow)`}
          onClick={(e) => changePost(-1)}
          className="fixed hidden p-2 text-gray-400 cursor-pointer md:block left-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineLeft className="w-10 h-10" />
        </div>
      )}
      <Thread
        key={curPost?.name ?? curPostNum}
        permalink={direct ? permalink : curPost?.permalink}
        commentMode={commentMode}
        initialData={curPost}
        updateSort={updateSort}
        sort={sort}
        commentsDirect={commentsDirect}
        goBack={handleBack}
      />
      {/* context.posts?.length > 0 */}
      {flattenedPosts?.[curPostNum + 1]?.data && (
        <div
          title={`next post (right arrow)`}
          onClick={(e) => changePost(1)}
          className="fixed hidden p-2 text-gray-400 cursor-pointer md:block right-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineRight className="w-10 h-10" />
        </div>
      )}
    </div>
  );
};

export default PostModal;
