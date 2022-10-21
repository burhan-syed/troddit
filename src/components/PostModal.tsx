import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { RiArrowGoBackLine } from "react-icons/ri";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { useMainContext } from "../MainContext";
import { useKeyPress } from "../hooks/KeyPress";
import Thread from "./Thread";
import useFeedGallery from "../hooks/useFeedGallery";
import MediaModal from "./MediaModal";
import { BiPlay, BiPause } from "react-icons/bi";

import PostOptButton from "./PostOptButton";
import useGlobalState from "../hooks/useGlobalState";

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
  mediaMode = false,
  commentMode = false,
  withcontext = false,
}) => {
  const router = useRouter();
  const context: any = useMainContext();
  const { getFeedData, setFeedData } = useFeedGallery();
  const [flattenedPosts, setFlattenedPosts] = useState(
    () => getFeedData() as any[]
  );
  const [autoPlay, setAutoPlay] = useState(false);
  const [useMediaMode, setUseMediaMode] = useState(mediaMode);
  const [sort, setSort] = useState<string>(
    (router?.query?.sort as string) ?? "top"
  );
  const [curPost, setCurPost] = useState<any>(postData);
  const [curPostNum, setCurPostNum] = useState(postNum);
  const [showUI, setShowUI] = useState(true);
  const [hideArrows, setHideArrows] = useState(false);
  useEffect(() => {
    if (showUI) {
      setHideArrows(false);
    }
  }, [showUI]);

  useEffect(() => {
    context.setPostOpen(true);
    return () => {
      context.bulkAddReadPosts(readPostsRef?.current ?? []);
      context.setMediaMode(false);
      context.setPostOpen(false);
      context.setHighRes(false);
    };
  }, []);

  const [readPosts, setReadPosts] = useState<any[]>([]);
  const readPostsRef = useRef<any[]>([]);
  useEffect(() => {
    readPostsRef.current = readPosts;
  }, [readPosts]);

  useEffect(() => {
    setTranslateAmount(0);
    setOAmount(0);
    if (useMediaMode) {
      context.setMediaMode(true);
    } else {
      setHideArrows(false);
      context.setMediaMode(false);
    }
    //reset this since we're not updating route when in media mode
    if (curPost.permalink) {
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop as string),
      });
      const multi = params?.["m"] ?? "";
      const queryParams = `${multi ? `?m=${multi}` : ``}`;
      router.replace(
        "",
        router.query?.frontsort
          ? `${curPost?.id}${mediaMode ? "?mode=media" : ""}`
          : router.route === "/u/[...slug]"
          ? `/u/${router?.query?.slug?.[0]}${curPost?.permalink}${queryParams}`
          : `${curPost.permalink}${queryParams}`,
        {
          shallow: true,
        }
      );
    }

    return () => {};
  }, [useMediaMode]);

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

  const handleBack = (animation: boolean = false, forceBack = false) => {
    if (mediaMode === false && useMediaMode) {
      setUseMediaMode(false);
    } else if (mediaMode === true && !useMediaMode && !forceBack) {
      setUseMediaMode(true);
    } else {
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
    }
  };

  useEffect(() => {
    let feedData = getFeedData() as any[];
    if (curPostNum + 5 > flattenedPosts?.length) fetchMore();
    if (feedData?.length !== flattenedPosts?.length)
      setFlattenedPosts(feedData);
  }, [curPostNum]);

  const changePost = (move: 1 | -1) => {
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop as string),
    });
    const multi = params?.["m"] ?? "";
    const queryParams = `${multi ? `?m=${multi}` : ``}`;
    if (flattenedPosts?.[curPostNum + move]?.data) {
      const nextPost = flattenedPosts?.[curPostNum + move]?.data;
      setCurPost(nextPost);
      //whole app is rendered when route changes, don't change route in full media mode
      if (
        !useMediaMode &&
        !(
          router.route === "/u/[...slug]" &&
          router.query?.slug?.[1]?.toUpperCase() === "M"
        )
      ) {
        router.replace(
          "",
          router.query?.frontsort
            ? `${nextPost?.id}${mediaMode ? "?mode=media" : ""}`
            : router.route === "/u/[...slug]"
            ? `/u/${router?.query?.slug?.[0]}${nextPost?.permalink}${queryParams}`
            : `${nextPost.permalink}${queryParams}`,
          {
            shallow: true,
          }
        );
      }
      setCurPostNum((p) => p + move);
    }
  };

  const { getGlobalData, setGlobalData, clearGlobalState } = useGlobalState([
    "videoLoadData",
  ]);
  const innerInt = useRef<NodeJS.Timer | number | undefined>();
  useEffect(() => {
    let currNum = curPostNum;
    let changePostInterval = (move: 1 | -1, curPostNum, intervalFlatPosts) => {
      const params = new Proxy(new URLSearchParams(window.location.search), {
        get: (searchParams, prop) => searchParams.get(prop as string),
      });
      const multi = params?.["m"] ?? "";
      const queryParams = `${multi ? `?m=${multi}` : ``}`;
      if (intervalFlatPosts?.[curPostNum + move]?.data) {
        const nextPost = intervalFlatPosts?.[curPostNum + move]?.data;
        setCurPost(nextPost);
        //causes whole app to render when route changes
        // if (
        //   !(
        //     router.route === "/u/[...slug]" &&
        //     router.query?.slug?.[1]?.toUpperCase() === "M"
        //   )
        // ) {
        //   router.replace(
        //     "",
        //     router.query?.frontsort
        //       ? `${nextPost?.id}${mediaMode ? "?mode=media" : ""}`
        //       : router.route === "/u/[...slug]"
        //       ? `/u/${router?.query?.slug?.[0]}${nextPost?.permalink}${queryParams}`
        //       : `${nextPost.permalink}${queryParams}`,
        //     {
        //       shallow: true,
        //     }
        //   );
        // }
        // if (move === 1) {
        //   preload(intervalFlatPosts?.[currNum + 2]?.data);
        // }
        currNum = currNum + move;
        setCurPostNum((p) => p + move);
      }
    };

    let interval;
    let pause = false;

    clearInterval(interval);
    if (autoPlay) {
      context.setAutoPlayMode(true);
      //hasNextPost && changePostInterval(1, currNum, flattenedPosts);
      let attemptNextPost = async () => {
        if (!pause) {
          //console.log("start");
          clearGlobalState();
          const feedData = getFeedData() as any[];
          //console.log('feed?', currNum, feedData);
          let isVideo = feedData?.[currNum]?.data?.mediaInfo?.isVideo;
          if (isVideo && context.waitForVidInterval) {
            pause = true;
            const checkForVidComplete = async () => {
              return await new Promise((resolve) => {
                clearInterval(innerInt?.current as number);
                innerInt.current = setInterval(() => {
                  let idToCheck =
                    feedData?.[currNum]?.data?.crosspost_parent_list?.[0]
                      ?.name ?? feedData?.[currNum]?.data?.name;
                  const check = getGlobalData()?.get(idToCheck);
                  //console.log("check", check, idToCheck);
                  if (check) {
                    resolve("foo");
                    clearInterval(innerInt.current as number);
                    pause = false;
                  }
                }, 100);
              });
            };
            await checkForVidComplete();
            hasNextPost && changePostInterval(1, currNum, feedData);

            // setTimeout(() => {
            //   hasNextPost && changePostInterval(1, currNum, feedData);
            //   pause = false;
            // }, duration * 1000);
          } else {
            setTimeout(
              () => {
                hasNextPost && changePostInterval(1, currNum, feedData);
              },
              isVideo ? (context?.autoPlayInterval ?? 10) * 1000 : 0
            );
          }
        }
      };

      getFeedData()?.[currNum]?.data?.mediaInfo?.isVideo && attemptNextPost();
      interval = setInterval(() => {
        //console.log("attempt next");
        attemptNextPost();
      }, (context?.autoPlayInterval ?? 10) * 1000);
    } else {
      context.setAutoPlayMode(false);
    }
    return () => {
      //context.setAutoPlayMode(false);
      clearInterval(interval);
      clearInterval(innerInt.current as number);
    };
  }, [
    autoPlay,
    context.waitForVidInterval,
    context.autoPlayInterval,
    curPostNum,
  ]);

  const nextPress = useKeyPress("ArrowRight");
  const backPress = useKeyPress("ArrowLeft");
  const upPress = useKeyPress("ArrowUp");
  const downPress = useKeyPress("ArrowDown");
  const escapePress = useKeyPress("Escape");
  const pPress = useKeyPress("p");
  const fPress = useKeyPress("f");

  useEffect(() => {
    if (!context.replyFocus) {
      if (nextPress) {
        changePost(1);
      } else if (backPress) {
        changePost(-1);
      } else if (useMediaMode && upPress) {
        changePost(-1);
      } else if (useMediaMode && downPress) {
        changePost(1);
      } else if (escapePress) {
        handleBack();
      } else if (pPress && useMediaMode) {
        setAutoPlay((a) => !a);
      } else if (fPress) {
        setUseMediaMode((a) => !a);
      }
    }

    return () => {};
  }, [
    fPress,
    pPress,
    nextPress,
    backPress,
    upPress,
    downPress,
    escapePress,
    context.replyFocus,
  ]);
  const [animate, setAnimate] = useState(false);
  const [isYTranslating, setIsYTranslating] = useState(false);
  const [touchStart, setTouchStart] = useState([0]);
  const [touchEnd, setTouchEnd] = useState([0]);
  const [touchStartY, setTouchStartY] = useState([0]);
  const [touchEndY, setTouchEndY] = useState([0]);
  const [translateAmount, setTranslateAmount] = useState(0);
  const [oAmount, setOAmount] = useState(0);
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
      !isYTranslating &&
      useMediaMode
      //&& Math.abs(touchStartY[0] - touchEndY[0]) < 20
    ) {
      !(
        (mediaMode === false && useMediaMode) ||
        (mediaMode === true && !useMediaMode)
      )
        ? setTranslateAmount(Math.max(0, -1 * (touchStart[0] - touchEnd[0])))
        : setOAmount(Math.max(0, -1 * (touchStart[0] - touchEnd[0])));
    } else {
      //setAnimate(true);
      setTranslateAmount(0);
      setOAmount(0);
      touchStart[0] = e.targetTouches[0].clientX as number;
      touchStartTime[0] = new Date().getTime();
    }
  };
  const handleTouchEnd = (e) => {
    //console.log(touchStartTime[0], new Date().getTime() > touchStartTime[0] + 250 )
    const now = new Date().getTime();
    if (now > touchStartTime[0] + 250 && now < touchStartTime[0] + 1500) {
      setAnimate(true);
      if (touchStart[0] - touchEnd[0] > 100) {
      } else if (touchStart[0] - touchEnd[0] < -100) {
        handleBack(true);
      } else {
        setTranslateAmount(0);
        setOAmount(0);
      }
    } else {
      setTranslateAmount(0);
      setOAmount(0);
    }
  };

  const hasPrevPost = flattenedPosts?.[curPostNum - 1]?.data;
  const hasNextPost = flattenedPosts?.[curPostNum + 1]?.data;

  return (
    <>
      <div
        className={
          "fixed inset-0 z-30 w-screen min-w-full min-h-screen max-h-screen overscroll-y-contain " +
          (animate ? " transition-transform duration-200 ease-out " : "")
        }
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => handleTouchMove(e)}
        onTouchEnd={(e) => handleTouchEnd(e)}
        style={
          (mediaMode === false && useMediaMode) ||
          (mediaMode === true && !useMediaMode)
            ? {
                opacity: `${100 - (oAmount / 500) * 100}%`,
              }
            : {
                transform: `translate3d(${translateAmount}px, ${0}px,${0}px)`,
                touchAction: `none`,
                //opacity: `${100 - (translateAmount / 1000) * 100}%`,
              }
        }
      >
        <div
          onClick={() => handleBack(undefined, true)}
          className="fixed top-0 left-0 w-screen h-full bg-black/75 opacity-80 backdrop-filter overscroll-none"
        ></div>
        <button
          aria-label="go back"
          title="back (esc)"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleBack(undefined, windowWidth >= 768);
          }}
          className={
            "fixed z-[99]  md:bottom-auto  " +
            " outline-none select-none md:rounded-lg flex items-center justify-center  md:bg-transparent bg-black/40 rounded-full backdrop-blur-lg md:backdrop-blur-none md:hover:bg-black/20 w-10 h-10 md:w-12 md:h-12 flex-none  md:text-opacity-50 hover:text-opacity-100 cursor-pointer border border-transparent hover:border-th-borderHighlight hover:backdrop-blur-sm " +
            (context?.mediaMode
              ? " md:top-4 md:right-2 md:left-auto left-1 top-1 " +
              (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf ? " text-white md:text-th-text " : " text-white " ) + 
                " transition ease-in-out duration-200 " +
                (showUI && !hideArrows
                  ? " opacity-100 "
                  : " opacity-0 hover:opacity-100")
              : " md:top-16 md:left-4 right-1.5 bottom-[2.5rem] text-white  ")
          }
        >
          <RiArrowGoBackLine
            title={"back (esc)"}
            className={"w-5 h-5 md:w-8 md:h-8   "}
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
            className={
              "fixed z-[98] rotate-90  outline-none cursor-pointer select-none md:p-2 rounded-full md:text-opacity-50 hover:text-opacity-100  bg-black/40 backdrop-blur-lg md:backdrop-blur-none md:bg-transparent md:hover:bg-black/20 md:rounded-md flex items-center justify-center  border border-transparent hover:border-th-borderHighlight hover:backdrop-blur-lg w-10 h-10 md:w-12 md:h-12  " +
              (useMediaMode
                ? " md:top-[7.6rem] md:right-2 right-1.5 md:left-auto bottom-[20.5rem] " +
                (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf ? " text-white md:text-th-text " : " text-white " ) + 
                  " transition ease-in-out duration-200 " +
                  (showUI && !hideArrows
                    ? " opacity-100 "
                    : " opacity-0 hover:opacity-100")
                : " text-white md:top-1/2 md:left-4 md:-translate-y-1/2 md:bottom-auto md:rotate-0 right-1 bottom-[13rem] hidden md:flex ")
            }
          >
            <AiOutlineLeft className="w-4 h-4 md:w-10 md:h-10" />
          </button>
        )}
        {useMediaMode ? (
          <>
            <MediaModal
              flattenedPosts={
                flattenedPosts?.length > 0
                  ? flattenedPosts
                  : [{ data: { ...curPost } }]
              }
              hide={false}
              setHideArrows={setHideArrows}
              hideArrows={hideArrows}
              changePost={changePost}
              curPostNum={curPostNum}
              showUI={showUI}
              setUseMediaMode={setUseMediaMode}
              firstNum={postNum}
              isXTranslating={translateAmount > 0}
              setIsYTranslating={setIsYTranslating}
              setReadPosts={setReadPosts}
            />

            <div
              className={
                "fixed top-1 md:top-4 right-1.5 md:right-16 z-[98] " +
                " transition ease-in-out duration-200 "
              }
            >
              <PostOptButton
                post={curPost}
                mode="fullmedia"
                showUI={showUI}
                setShowUI={setShowUI}
                buttonStyles={"md:text-opacity-50 md:hover:text-opacity-100 "
                + (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf ? " text-white md:text-th-text " : " text-white " )}
              />
            </div>
          </>
        ) : (
          <>
            <Thread
              key={curPost?.name ?? curPostNum}
              permalink={direct ? permalink : curPost?.permalink}
              commentMode={commentMode}
              initialData={curPost}
              updateSort={updateSort}
              sort={sort}
              commentsDirect={commentsDirect}
              setMediaMode={setUseMediaMode}
              goBack={handleBack}
              withContext={withcontext}
              setCurPost={setCurPost}
              direct={direct}
            />
          </>
        )}

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
            className={
              "fixed z-[98]  rotate-90 outline-none cursor-pointer select-none md:text-opacity-50 hover:text-opacity-100   md:p-2 flex items-center justify-center md:bg-transparent md:backdrop-blur-none bg-black/40 rounded-full md:hover:bg-black/20 md:rounded-md  border border-transparent  backdrop-blur-lg hover:border-th-borderHighlight hover:backdrop-blur-lg w-10 h-10 md:w-12 md:h-12  " +
              (useMediaMode
                ? "  md:top-[10.5rem] md:right-2 right-1.5 md:left-auto bottom-[17rem] " +
                (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf ? " text-white md:text-th-text " : " text-white " ) + 
                  " transition ease-in-out duration-200 " +
                  (showUI && !hideArrows
                    ? " opacity-100 "
                    : " opacity-0 hover:opacity-100")
                : " text-white md:rotate-0 md:right-4 md:top-1/2 md:-translate-y-1/2 md:bottom-auto right-1 bottom-[10rem] hidden md:flex ")
            }
          >
            <AiOutlineRight className="w-4 h-4 md:w-10 md:h-10" />
          </button>
        )}
        {hasNextPost && useMediaMode && (
          <button
            aria-label="autoplay"
            title="auto play (p)"
            className={
              "fixed z-[99] right-1.5 top-14 md:right-2 md:top-[4.5rem] md:text-opacity-50 hover:text-opacity-100 md:bg-transparent bg-black/40  md:hover:bg-black/20 rounded-full md:rounded-md  flex items-center justify-center border border-transparent hover:border-th-borderHighlight outline-none hover:backdrop-blur-lg w-10 h-10 md:w-12 md:h-12 " +
              " transition ease-in-out duration-200 select-none " +
              (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf ? " text-white md:text-th-text " : " text-white " ) + 
              (showUI && (!hideArrows || autoPlay)
                ? " opacity-100 backdrop-blur-lg md:backdrop-blur-none "
                : " opacity-0 hover:opacity-100")
            }
            style={{ textShadow: "0px 1px #00000020" }}
            autoFocus
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAutoPlay((a) => !a);
            }}
          >
            {autoPlay ? (
              <BiPause className="w-6 h-6 md:w-12 md:h-12 md:-m-2" />
            ) : (
              <BiPlay className="w-6 h-6 md:w-12 md:h-12 md:-m-2" />
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default PostModal;
