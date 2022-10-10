import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RiArrowGoBackLine } from "react-icons/ri";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { useMainContext } from "../MainContext";
import { useKeyPress } from "../hooks/KeyPress";
import Thread from "./Thread";
import useFeedGallery from "../hooks/useFeedGallery";
import { useWindowWidth } from "@react-hook/window-size";

const PostModal = ({
  setSelect,
  returnRoute,
  permalink,
  curKey,
  fetchMore = () => {},
  allPosts = [] as any[],
  postData = {},
  postNum,
  direct = false,
  commentsDirect = false,
  commentMode = false,
  withcontext = false,
}) => {
  const router = useRouter();
  const context: any = useMainContext();
  const { getFeedData } = useFeedGallery();
  const [flattenedPosts, setFlattenedPosts] = useState(
    () => getFeedData() as any[]
  );

  const [sort, setSort] = useState<string>(
    (router?.query?.sort as string) ?? "top"
  );
  const [curPost, setCurPost] = useState<any>(postData);
  const [curPostNum, setCurPostNum] = useState(postNum);

  useEffect(() => {
    context.setPostOpen(true);
    return () => {
      context.setPostOpen(false);
    };
  }, []);

  //prevent scrolling on main body when open
  useEffect(() => {
    if (true) {
      const width = document.body.clientWidth;
      document.documentElement.style.setProperty("--overflow", "hidden hidden");
      document.body.style.width = `${width}px`;
    } else {
      document.documentElement.style.setProperty(
        "--overflow",
        "hidden visible"
      );
      document.body.style.width = `auto`;
    }

    return () => {
      document.documentElement.style.setProperty(
        "--overflow",
        "hidden visible"
      );
      document.body.style.width = `auto`;
    };
  }, []);

  const updateSort = async (e, sort) => {
    e.preventDefault();
    setSort(sort);
  };

  const windowWidth = useWindowWidth();
  const handleBack = (animation: boolean = false) => {
    //setSelect(false);
    setTranslateAmount(windowWidth);
    setTimeout(
      () => {
        setSelect(false);
        if (returnRoute === "multimode") {
          //do nothing
        } else if (returnRoute) {
          //console.log("last route", returnRoute);
          router.replace(returnRoute);
        } else {
          router.back();
        }
      },
      animation ? 200 : 0
    );
  };

  useEffect(() => {
    if (curPostNum + 5 > flattenedPosts?.length) fetchMore();
    let feedData = getFeedData() as any[];
    if (feedData?.length !== flattenedPosts?.length)
      setFlattenedPosts(feedData);
  }, [curPostNum]);

  const changePost = (move: 1 | -1) => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop as string),
    });
    const multi = params?.["m"] ?? "";
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
            : router.route === "/u/[...slug]"
            ? `/u/${router?.query?.slug?.[0]}${nextPost?.permalink}${
                multi ? `?m=${multi}` : ""
              }`
            : `${nextPost.permalink}${multi ? `?m=${multi}` : ""}`,
          {
            shallow: true,
          }
        );
      }
      setCurPostNum((p) => p + move);
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

  const [animate, setAnimate] = useState(false);
  const [touchStart, setTouchStart] = useState([0]);
  const [touchEnd, setTouchEnd] = useState([0]);
  const [touchStartY, setTouchStartY] = useState([0]);
  const [touchEndY, setTouchEndY] = useState([0]);
  const [translateAmount, setTranslateAmount] = useState(0);
  const [touchStartTime, setTouchStartTime] = useState([new Date().getTime()]);

  const handleTouchStart = (e) => {
    setAnimate(false);
    touchStart[0] = e.targetTouches[0].clientX as number;
    touchStartY[0] = e.targetTouches[0].clientY as number;
    touchStartTime[0] = new Date().getTime();
  };
  const handleTouchMove = (e) => {
    e.preventDefault();
    setAnimate(false);
    touchEnd[0] = e.targetTouches[0].clientX as number;
    touchEndY[0] = e.targetTouches[0].clientY as number;
    if (
      new Date().getTime() > touchStartTime[0] + 50 &&
      Math.abs(touchStart[0] - touchEnd[0]) > 2 &&
      Math.abs(touchStartY[0] - touchEndY[0]) < 20
    ) {
      setTranslateAmount(Math.max(0, -1 * (touchStart[0] - touchEnd[0])));
    } else {
      //setAnimate(true);
      setTranslateAmount(0);
      touchStart[0] = e.targetTouches[0].clientX as number;
      touchStartTime[0] = new Date().getTime();
    }
  };
  const handleTouchEnd = (e) => {
    if (new Date().getTime() > touchStartTime[0] + 250) {
      setAnimate(true);
      if (touchStart[0] - touchEnd[0] > 100) {
      } else if (touchStart[0] - touchEnd[0] < -100) {
        handleBack(true);
      } else {
        setTranslateAmount(0);
      }
    } else {
      setTranslateAmount(0);
    }
  };

  const hasPrevPost = flattenedPosts?.[curPostNum - 1]?.data;
  const hasNextPost = flattenedPosts?.[curPostNum + 1]?.data;

  return (
    <div
      className={
        "fixed inset-0 z-30 w-screen min-w-full min-h-screen max-h-screen overscroll-y-contain " +
        (animate ? " transition-transform duration-200 ease-out " : "")
      }
      // onTouchStart={(e) => handleTouchStart(e)}
      // onTouchMove={(e) => handleTouchMove(e)}
      // onTouchEnd={(e) => handleTouchEnd(e)}
      // style={{
      //   transform: `translate(${translateAmount}px, ${0}px)`,
      //   touchAction: `none`,
      //   //opacity: `${100 - (translateAmount / 1000) * 100}%`,
      // }}
    >
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black/75 opacity-80 backdrop-filter backdrop-blur-lg overscroll-none"
      ></div>
      <button
        aria-label="go back"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleBack();
        }}
        className={
          "fixed z-50 right-5 bottom-10 md:left-4 md:top-14 md:bottom-auto  " +
          " outline-none select-none rounded-full w-14 h-9 flex items-center justify-center md:dark:bg-transparent md:bg-transparent  md:h-auto   "
        }
      >
        <RiArrowGoBackLine
          title={"back (esc)"}
          className={
            "w-8 h-8 md:mt-1  md:text-gray-400 cursor-pointer md:hover:text-gray-300"
          }
        />
      </button>
      {hasPrevPost && (
        <button
          aria-label="previous post"
          title={`previous post (left arrow)`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changePost(-1);
          }}
          className="fixed z-50 w-12 rotate-90 outline-none cursor-pointer select-none right-6 md:rotate-0 bottom-36 md:p-2 md:text-gray-400 md:block md:left-4 md:hover:text-gray-300 md:top-1/2 md:bottom-auto"
        >
          <AiOutlineLeft className="w-10 h-10" />
        </button>
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
        withContext={withcontext}
        direct={direct}
      />
      {/* context.posts?.length > 0 */}
      {hasNextPost && (
        <button
          aria-label="next post"
          title={`next post (right arrow)`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            changePost(1);
          }}
          className="fixed z-50 w-12 rotate-90 outline-none cursor-pointer select-none md:text-gray-400 right-6 bottom-24 md:rotate-0 md:p-2 md:block md:right-4 md:hover:text-gray-300 md:top-1/2 md:bottom-auto"
        >
          <AiOutlineRight className="w-10 h-10" />
        </button>
      )}
    </div>
  );
};

export default PostModal;
