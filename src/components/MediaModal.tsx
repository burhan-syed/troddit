import { useWindowWidth } from "@react-hook/window-size";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { localSeen, useMainContext } from "../MainContext";
import MediaWrapper from "./MediaWrapper";
import { MdHighQuality, MdOutlineHighQuality } from "react-icons/md";
import usePanAndZoom from "../hooks/panAndZoom/usePanAndZoom";
import { BiComment, BiVolumeMute, BiVolumeFull } from "react-icons/bi";
import SaveButton from "./SaveButton";
import Vote from "./Vote";
import Link from "next/link";
import { secondsToTime } from "../../lib/utils";
import TitleFlair from "./TitleFlair";
import { IoMdExpand } from "react-icons/io";
import useBrowser from "../hooks/useBrowser";
import PostBody from "./PostBody";
import { GoRepoForked } from "react-icons/go";
const MediaModal = ({
  hide,
  changePost,
  flattenedPosts,
  curPostNum,
  setHideArrows,
  hideArrows,
  showUI,
  setUseMediaMode,
  setReadPosts,
  handleBack,
  updateTranslateX,
}) => {
  const windowWidth = useWindowWidth();
  const browser = useBrowser();
  const [windowHeight, setWindowHeight] = useState<number>(0);
  useEffect(() => {
    setWindowHeight(window.innerHeight);
    const onResize = () => {
      setWindowHeight(window.innerHeight);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);

  useEffect(() => {
    let interval;
    if (!hideArrows && window.innerWidth <= 640) {
      interval = setTimeout(() => setHideArrows(true), 3500);
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [hideArrows]);
  const context: any = useMainContext();
  const [triggerVote, setTriggerVote] = useState(0);
  const {
    containerRef,
    onMouseDown,
    onWheel,
    translateX,
    translateY,
    scale,
    onReset,
  } = usePanAndZoom();
  const [animate, setAnimate] = useState(true);
  const [curPostName, setCurPostName] = useState(
    () =>
      flattenedPosts?.[curPostNum]?.data?.crosspost_parent_list?.[0]?.name ??
      flattenedPosts?.[curPostNum]?.data?.name
  );
  const [touched, setTouched] = useState(false);
  const [multiTouch, setMultiTouch] = useState(false);
  const [touchStartY, setTouchStartY] = useState<any[]>([0]);
  const [touchStartX, setTouchStartX] = useState<any[]>([0]);
  const [touchEndY, setTouchEndY] = useState<any[]>([0]);
  const [touchEndX, setTouchEndX] = useState<any[]>([0]);
  const [translateMode, setTranslateMode] = useState<("vert" | "hor" | "")[]>([
    "",
  ]);
  const [touchStartTime, setTouchStartTime] = useState([Infinity]);
  const translateDiv = useRef<HTMLDivElement>(null);
  const scrollingRef = useRef<HTMLDivElement>(null);
  const [translateAmount, setTranslateAmount] = useState(
    -1 * curPostNum * windowHeight
  );
  const [bgColor, setBGColor] = useState<string>();
  useEffect(() => {
    let baseColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--base")
      .trim();
    if (baseColor === "#000") {
      baseColor = "#000000";
    }
    setBGColor(baseColor);
  }, []);
  const updateTranslate = (x: number | string, smooth = windowWidth <= 768) => {
    if (translateDiv.current) {
      if (smooth) {
        translateDiv.current.style.transitionProperty = "transform";
        translateDiv.current.style.transitionDuration = "200ms";
        translateDiv.current.style.transitionTimingFunction =
          "cubic-bezier(0.4, 0, 0.2, 1)";
      } else {
        translateDiv.current.style.transitionProperty = "";
        translateDiv.current.style.transitionDuration = "";
        translateDiv.current.style.transitionTimingFunction = "";
      }
      translateDiv.current.style.setProperty(
        "transform",
        `translate3d(0px, ${x}px,${0}px)`
      );
    }
  };
  // const [animateY, setAnimateY] = useState(false);
  const handleTouchStart = (e) => {
    setTouched(true);
    //console.log(e.targetTouches.length)
    if (e.targetTouches.length < 2) {
      touchStartY[0] = e.targetTouches[0].clientY;
      touchStartX[0] = e.targetTouches[0].clientX;
      touchStartTime[0] = new Date().getTime();
    }
  };

  const handleTouchEnd = (e) => {
    const now = new Date().getTime();
    if (translateMode[0] == "hor") {
      if (
        now > touchStartTime[0] + 100 &&
        typeof touchStartX[0] == "number" &&
        typeof touchEndX[0] == "number" &&
        touchEndX[0] !== 0 &&
        touchStartX[0] - touchEndX[0] < -100
      ) {
        handleBack(true, true);
      } else {
        updateTranslateX(0);
      }
    } else if (
      now > touchStartTime[0] + 100 &&
      //now < touchStartTime[0] + 1500 &&
      typeof touchStartY[0] == "number" &&
      typeof touchEndY[0] == "number" &&
      touchEndY[0] !== 0
    ) {
      //console.log(touchStartY[0] - touchEndY[0], touchStartY[0], touchEndY[0],)
      if (
        touchStartY[0] - touchEndY[0] > 15 &&
        flattenedPosts[curPostNum + 1]?.data?.name
      ) {
        changePost(1);
        setHideArrows(true);
        updateTranslate(-1 * (curPostNum + 1) * windowHeight, true);
      } else if (
        touchStartY[0] - touchEndY[0] < -15 &&
        flattenedPosts[curPostNum - 1]?.data?.name
      ) {
        changePost(-1);
        setHideArrows(true);
        updateTranslate(-1 * (curPostNum - 1) * windowHeight, true);
      } else {
        setHideArrows(false);
        updateTranslate(-1 * curPostNum * windowHeight);
        updateTranslateX(0);
      }
    } else {
      setHideArrows(false);
      updateTranslate(-1 * curPostNum * windowHeight);
      updateTranslateX(0);
    }
    touchEndY[0] = undefined;
    touchStartTime[0] = Infinity;
    touchStartY[0] = undefined;
    touchStartX[0] = undefined;
    touchEndY[0] = undefined;
    translateMode[0] = "";
  };
  const handleTouchMove = (e) => {
    if (e.targetTouches.length < 2) {
      touchEndY[0] = e.targetTouches[0].clientY;
      touchEndX[0] = e.targetTouches[0].clientX;
      if (
        translateMode[0] !== "hor" &&
        Math.abs(touchEndY[0] - touchStartY[0]) >=
          Math.abs(touchEndX[0] - touchStartX[0])
      ) {
        updateTranslateX(0, false);
        if (Math.abs(touchEndY[0] - touchStartY[0]) > 20) {
          translateMode[0] = "vert";
        }

        if (
          (e.targetTouches[0].clientY > touchStartY &&
            flattenedPosts[curPostNum - 1]?.data?.name) ||
          (e.targetTouches[0].clientY < touchStartY &&
            flattenedPosts[curPostNum + 1]?.data?.name)
        ) {
          updateTranslate(
            `${
              -1 * curPostNum * windowHeight +
              -1 * (touchStartY[0] - e.targetTouches[0].clientY)
            }`,
            false
          );
          // }
        }
      } else if (translateMode[0] !== "vert") {
        if (Math.abs(touchEndX[0] - touchStartX[0]) > 20) {
          translateMode[0] = "hor";
        }
        updateTranslate(-1 * curPostNum * windowHeight, false);
        updateTranslateX(
          Math.max(0, -1 * (touchStartX[0] - touchEndX[0])),
          false
        );
      }
    } else {
      translateMode[0] = "";
      touchEndY[0] = undefined;
      touchStartTime[0] = Infinity;
      touchStartY[0] = undefined;
      touchStartX[0] = undefined;
      touchEndY[0] = undefined;
    }
  };
  //add to read on unmount
  useEffect(() => {
    setCurPostName(
      flattenedPosts?.[curPostNum]?.data?.crosspost_parent_list?.[0]?.name ??
        flattenedPosts?.[curPostNum]?.data?.name
    );
    touchEndY[0] = undefined;
    touchStartTime[0] = Infinity;
    touchStartY[0] = undefined;
    touchStartX[0] = undefined;
    touchEndY[0] = undefined;
    if (
      flattenedPosts?.[curPostNum]?.data?.mediaInfo?.iFrameHTML &&
      context?.preferEmbeds
    ) {
      setHideArrows(false);
    }

    return () => {
      touchEndY[0] = undefined;
      touchStartTime[0] = Infinity;
      touchStartY[0] = undefined;
      touchStartX[0] = undefined;
      touchEndY[0] = undefined;
      setAnimate(true);
      onReset();
      scale > 1 && context.setHighRes(false);
      if (flattenedPosts?.[curPostNum]?.data?.name && !hide) {
        context?.autoRead &&
          setReadPosts((p) => {
            return [
              ...p,
              {
                postId: flattenedPosts?.[curPostNum]?.data?.name,
                numComments: flattenedPosts?.[curPostNum]?.data?.num_comments,
              },
            ];
          });

        context?.autoSeen &&
          localSeen.setItem(flattenedPosts?.[curPostNum]?.data?.name, {
            time: new Date(),
          });
      }
    };
  }, [curPostNum, windowHeight]);
  useEffect(() => {
    if (triggerVote > 0) {
      setTriggerVote(0);
    }
  }, [triggerVote]);

  useLayoutEffect(() => {
    updateTranslate(-1 * curPostNum * windowHeight);
  }, [windowHeight, curPostNum]);

  const Media = useCallback(
    (post, hidden, showCrossPost = false) => (
      <>
        <MediaWrapper
          post={post}
          hideNSFW={(context.nsfw === false && post?.over_18) || post?.spoiler}
          forceMute={false}
          containerDims={[windowWidth, windowHeight]}
          imgFull={post?.mediaInfo?.isSelf}
          postMode={true}
          showCrossPost={showCrossPost}
          hide={hidden}
          fullMediaMode={true}
          curPostName={curPostName}
        />
      </>
    ),
    [curPostName, windowHeight, windowWidth, context.nsfw]
  );

  if (!windowHeight) {
    return <></>;
  }

  return (
    <>
      {!(
        (context.preferEmbeds &&
          flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isIFrame) ||
        flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf
      ) && (
        <button
          aria-label={"toggle full resolution"}
          title={context?.highRes ? "" : "load full res"}
          className={
            "flex items-center justify-center fixed outline-none text-white border border-transparent md:hover:border-th-accent  top-1 left-14 md:left-auto md:right-36 md:top-4 md:h-12 z-[98] hover:backdrop-blur-sm  hover:text-opacity-50 hover:bg-black/40 rounded-full bg-black/40 md:bg-transparent md:rounded-md w-10 h-10 " +
            (showUI && !hideArrows
              ? ` md:text-opacity-50 backdrop-blur-lg md:backdrop-blur-none ${
                  scale > 1 ? " md:text-opacity-50 " : " md:text-opacity-0 "
                } `
              : " text-opacity-0 hidden")
          }
          onClick={() => context.setHighRes((f) => !f)}
        >
          {context?.highRes ? (
            <MdHighQuality className="w-5 h-5 md:w-8 md:h-8 " />
          ) : (
            <MdOutlineHighQuality className={"w-5 h-5 md:w-8 md:h-8  "} />
          )}
        </button>
      )}
      {scale > 1 && !flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf && (
        <button
          onClick={() => {
            onReset();
          }}
          className="flex items-center justify-center fixed outline-none text-white border border-transparent md:hover:border-th-accent  top-1 left-24 md:left-auto md:right-24 md:top-4 md:h-12 z-[98] hover:backdrop-blur-sm  hover:text-opacity-50 hover:bg-black/40 rounded-full bg-black/40 md:bg-transparent md:rounded-md w-10 h-10 md:text-opacity-50 "
        >
          <IoMdExpand className="w-5 h-5 md:w-8 md:h-8 " />
        </button>
      )}
      <div
        ref={translateDiv}
        className={"absolute top-0 left-0 "}
        onTouchStart={(e) =>
          !flattenedPosts[curPostNum]?.data?.mediaInfo?.isSelf &&
          handleTouchStart(e)
        }
        onTouchMove={(e) =>
          !flattenedPosts[curPostNum]?.data?.mediaInfo?.isSelf &&
          handleTouchMove(e)
        }
        onTouchEnd={(e) =>
          !flattenedPosts[curPostNum]?.data?.mediaInfo?.isSelf &&
          handleTouchEnd(e)
        }
        onDoubleClick={(e) => {
          e.preventDefault();
          if (
            !flattenedPosts[curPostNum]?.data?.mediaInfo?.isSelf &&
            (!flattenedPosts[curPostNum]?.data?.mediaInfo?.isGallery ||
              ((e.clientX > 48 ||
                e.clientY > windowHeight / 2 + 48 ||
                e.clientY < windowHeight / 2 - 48) &&
                e.clientX < windowWidth - 48))
          ) {
            setTriggerVote((v) => (v += 1));
          }
        }}
      >
        {flattenedPosts &&
          flattenedPosts.map((post, i) => (
            <>
              {Math.abs(curPostNum - i) < 2 && (
                <div
                  className={
                    "absolute left-0 z-[97] w-screen backdrop-blur-sm " +
                    (i === curPostNum
                      ? ""
                      : "overflow-hidden pointer-events-none")
                  }
                  style={{
                    //transform: `translate3d(0px,${translateAmount + (i * windowHeight)}px,0px)`,
                    backgroundColor: `${
                      post?.data?.mediaInfo?.isSelf ? `${bgColor}` : "#000000"
                    }`,
                    top: `${i * windowHeight}px`,
                    height: `${windowHeight}px`,
                  }}
                  ref={i === curPostNum ? containerRef : null}
                  onMouseDown={(e) => {
                    if (scale > 1 && !post?.data?.mediaInfo?.isSelf) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                    setAnimate(false);
                    i === curPostNum && scale > 1 && onMouseDown(e);
                  }}
                  onWheel={(e) => {
                    setAnimate(false);
                    i === curPostNum &&
                      !post?.data?.mediaInfo?.isSelf &&
                      onWheel(e);
                  }}
                >
                  {post?.data?.mediaInfo?.isSelf ? (
                    <div
                      ref={scrollingRef}
                      className={
                        " w-full overflow-y-auto overflow-x-hidden " +
                        (post?.data?.mediaInfo?.isDual ||
                        post?.data?.crosspost_parent_list?.[0]
                          ? ` ${
                              post?.data?.mediaInfo?.isDual
                                ? ""
                                : " flex flex-col items-center "
                            } `
                          : "flex item-center justify-center")
                      }
                      style={{ height: `${windowHeight}px` }}
                    >
                      <div
                        className="max-w-2xl px-1 my-auto "
                        onTouchMove={(e) => {
                          setHideArrows(false);
                        }}
                      >
                        <div className="min-w-full p-1 mx-2 my-12 md:my-4 md:mx-4">
                          <div
                            className={
                              " flex flex-col flex-wrap group-hover:text-opacity-100 "
                            }
                          >
                            <div
                              className={
                                "flex flex-row flex-wrap items-center gap-1 py-0 text-xs  pr-14 md:pr-0 md:pb-1 text-opacity-50 group-hover:text-opacity-100" +
                                (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                  ?.isSelf
                                  ? " text-th-text "
                                  : " text-white ")
                              }
                              style={{
                                wordBreak: "break-word",
                                textShadow: `0px 1px ${
                                  flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                    ?.isSelf
                                    ? "#00000000"
                                    : "#00000050"
                                }`,
                              }}
                            >
                              <Link
                                href={`/u/${post?.data?.author}`}
                                className={touched ? " " : "hover:underline"}
                                onClick={(e) => {
                                  if (touched) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                u/{post?.data?.author}
                              </Link>
                              <span>on</span>
                              <Link
                                href={`/r/${post?.data?.subreddit}`}
                                className={touched ? "" : "hover:underline"}
                                onClick={(e) => {
                                  if (touched) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                r/{post?.data?.subreddit}
                              </Link>

                              {post.data?.crosspost_parent_list?.[0] && (
                                <span className="flex items-center ml-1 gap-x-0.5">
                                  cross post{" "}
                                  <GoRepoForked className="flex-none w-4 h-4 rotate-90" />
                                </span>
                              )}

                              <span
                                className={"ml-1"}
                                title={new Date(
                                  post?.data?.created_utc * 1000
                                )?.toString()}
                              >
                                {secondsToTime(post?.data?.created_utc, [
                                  "s ago",
                                  "m ago",
                                  "h ago",
                                  "d ago",
                                  "mo ago",
                                  "yr ago",
                                ])}
                              </span>
                            </div>
                          </div>
                          <h2 className="flex flex-wrap items-center gap-2 py-2 text-xl font-semibold">
                            {post?.data?.title}{" "}
                            <span className="text-xs font-medium ">
                              <TitleFlair post={post.data} />
                            </span>
                          </h2>

                          <div
                            className={
                              "flex flex-row items-center justify-start w-full gap-5 my-2 text-xs text-opacity-50 md:my-0 md:mb-0 sm:gap-3 group-hover:text-opacity-100 " +
                              (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                ?.isSelf
                                ? " text-th-text "
                                : " text-white ")
                            }
                            style={{
                              textShadow: `0px 1px ${
                                flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                  ?.isSelf
                                  ? "#00000000"
                                  : "#00000050"
                              }`,
                            }}
                          >
                            <div className="flex-row items-center  gap-2 sm:gap-1 -ml-0.5 text-xs flex ">
                              <Vote
                                key={post?.data?.name}
                                name={post?.data?.name}
                                likes={post?.data?.likes}
                                score={post?.data?.score}
                                size={5}
                                postMode={true}
                                triggerVote={triggerVote}
                              />
                            </div>
                            <div className="md:block">
                              <SaveButton
                                id={post?.data?.name}
                                saved={post?.data?.saved}
                                row={true}
                                useKeys={true}
                              />
                            </div>
                            <button
                              title="see comments (f)"
                              onClick={() => setUseMediaMode(false)}
                              className="flex items-center gap-1 ml-0 mr-2 text-xs border border-transparent outline-none hover:underline"
                            >
                              <BiComment className="flex-none w-4 h-4 " />
                              <span>
                                {post?.data?.num_comments}{" "}
                                {post?.data?.num_comments === 1
                                  ? "comment"
                                  : "comments"}
                              </span>
                            </button>
                          </div>
                        </div>
                        <div className={""}>
                          <PostBody
                            withBG={
                              post.data?.crosspost_parent_list?.[0]
                                ? true
                                : false
                            }
                            rawHTML={
                              post.data?.crosspost_parent_list?.[0]
                                ?.selftext_html ?? post?.data?.selftext_html
                            }
                            mode="post"
                          />
                        </div>
                      </div>
                      <div
                        className={
                          "relative " +
                          (post.data?.crosspost_parent_list?.[0]
                            ? ""
                            : "max-w-screen")
                        }
                        onTouchMove={(e) => {
                          // console.log(
                          //   scrollingRef?.current?.scrollHeight,
                          //   scrollingRef?.current?.scrollTop
                          // );
                          e.preventDefault();
                          e.stopPropagation();
                          setHideArrows(false);
                        }}
                        // onTouchEnd={(e) => {
                        //   e.preventDefault();
                        //   e.stopPropagation();
                        // }}
                      >
                        {Media(post?.data, i !== curPostNum, true)}
                      </div>
                    </div>
                  ) : (
                    <div
                      onTouchMove={(e) => {
                        if (
                          post?.data?.mediaInfo?.iFrameHTML &&
                          context?.preferEmbeds
                        ) {
                          setHideArrows(false);
                        }
                      }}
                      className={
                        "flex items-center justify-center max-h-full min-h-full overflow-y-none overscroll-contain  " +
                        ((animate || scale === 1) && i === curPostNum
                          ? " transition-transform duration-200 ease-in-out "
                          : " ") +
                        (scale > 1 ? " cursor-grab" : "")
                      }
                      style={
                        i === curPostNum
                          ? {
                              transform: `translate3d(${translateX}px, ${translateY}px,${0}px) scale(${scale})`,
                            }
                          : {}
                      }
                    >
                      <div className={"relative min-w-full min-h-full "}>
                        {Media(post?.data, i !== curPostNum)}
                      </div>
                    </div>
                  )}
                  {i === curPostNum && (
                    <>
                      <div
                        className={
                          "absolute right-1.5 z-[98] bottom-24 md:hidden " +
                          (showUI ? "" : "hidden") +
                          (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf
                            ? " text-th-text "
                            : " text-white ")
                        }
                      >
                        <SaveButton
                          id={post?.data?.name}
                          saved={post?.data?.saved}
                          fullmedia={true}
                          useKeys={true}
                        />
                      </div>
                      <button
                        onClick={() => setUseMediaMode(false)}
                        className={
                          "outline-none select-none md:hidden flex items-center justify-center absolute right-1.5 z-[98] bottom-10 backdrop-blur-lg bg-black/40 w-10 h-10 rounded-full text-white " +
                          (showUI ? "" : "hidden")
                        }
                      >
                        <BiComment className="flex-none w-4 h-4 " />
                      </button>
                      {post?.data?.mediaInfo?.iFrameHTML &&
                        context?.preferEmbeds && (
                          <div className="absolute top-20 w-screen bg-transparent bottom-14 z-[99] md:invisible"></div>
                        )}
                      {!post?.data?.mediaInfo?.isSelf && (
                        <div
                          className={
                            "absolute flex flex-row items-start justify-start gap-2  left-0 p-2 md:pl-2 md:pr-4 md:left-2 w-screen md:w-auto  hover:bg-black/20 md:rounded-md group md:hover:backdrop-blur-sm pointer-events-none bg-gradient-to-t " +
                            " md:top-2 md:bottom-auto " +
                            " transition ease-in-out duration-200 " +
                            (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                              ?.isSelf
                              ? " text-th-text "
                              : " text-white ") +
                            (post?.data?.mediaInfo?.iFrameHTML &&
                            context?.preferEmbeds
                              ? " bottom-14 from-black/0 via-black/10 to-black/10 "
                              : " top-auto bottom-1 pb-10 md:pb-3 from-black/40 md:from-black/0 ") +
                            (showUI
                              ? " opacity-100 "
                              : " opacity-0 hover:opacity-100") +
                            " "
                          }
                        >
                          <div
                            className={
                              " flex flex-col flex-wrap group-hover:text-opacity-100 "
                            }
                          >
                            <div
                              className={
                                "flex pointer-events-auto flex-row flex-wrap items-center gap-1 py-0 text-xs  pr-14 md:pr-0 md:pb-1 text-opacity-50 group-hover:text-opacity-100" +
                                (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                  ?.isSelf
                                  ? " text-th-text "
                                  : " text-white ")
                              }
                              style={{
                                wordBreak: "break-word",
                                textShadow: `0px 1px ${
                                  flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                    ?.isSelf
                                    ? "#00000000"
                                    : "#00000050"
                                }`,
                              }}
                            >
                              <Link
                                href={`/u/${post?.data?.author}`}
                                className={
                                  "" + touched ? " " : "hover:underline"
                                }
                                onClick={(e) => {
                                  if (touched) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                u/{post?.data?.author}
                              </Link>
                              <span>on</span>
                              <Link
                                href={`/r/${post?.data?.subreddit}`}
                                className={touched ? "" : "hover:underline"}
                                onClick={(e) => {
                                  if (touched) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                r/{post?.data?.subreddit}
                              </Link>

                              <span
                                className={"ml-1"}
                                title={new Date(
                                  post?.data?.created_utc * 1000
                                )?.toString()}
                              >
                                {secondsToTime(post?.data?.created_utc, [
                                  "s ago",
                                  "m ago",
                                  "h ago",
                                  "d ago",
                                  "mo ago",
                                  "yr ago",
                                ])}
                              </span>
                            </div>
                            <div
                              className={
                                "flex pointer-events-auto flex-row items-center justify-start gap-2 pt-2 text-sm text-left outline-none md:pt-0 md:flex-col md:items-start md:py-1 md:gap-2 md:mr-0 text-opacity-80 group-hover:text-opacity-100 mr-14 md:max-w-sm " +
                                (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                  ?.isSelf
                                  ? " text-th-text "
                                  : " text-white ")
                              }
                            >
                              <button
                                disabled={touched}
                                onClick={() =>
                                  !touched && setUseMediaMode(false)
                                }
                                className="flex text-left "
                                style={{
                                  wordBreak: "break-word",
                                  textShadow: `0px 1px ${
                                    flattenedPosts?.[curPostNum]?.data
                                      ?.mediaInfo?.isSelf
                                      ? "#00000000"
                                      : "#00000050"
                                  }`,
                                }}
                              >
                                {post?.data?.title}
                              </button>
                              {(post?.data?.link_flair_text?.length > 0 ||
                                post?.data?.link_flair_richtext?.length > 0) &&
                                windowWidth < 768 && (
                                  <span className="py-1 text-xs font-medium md:mt-1">
                                    <TitleFlair
                                      post={post.data}
                                      noClick={true}
                                    />
                                  </span>
                                )}
                            </div>

                            <div
                              className={
                                "flex pointer-events-auto flex-row items-center justify-start w-full gap-5 my-2 text-xs text-opacity-50 md:my-0 md:mb-0 sm:gap-3 group-hover:text-opacity-100 " +
                                (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                  ?.isSelf
                                  ? " text-th-text "
                                  : " text-white ")
                              }
                              style={{
                                textShadow: `0px 1px ${
                                  flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                    ?.isSelf
                                    ? "#00000000"
                                    : "#00000050"
                                }`,
                              }}
                            >
                              <div className="flex-row items-center  gap-2 sm:gap-1 -ml-0.5 text-xs flex ">
                                <Vote
                                  key={post?.data?.name}
                                  name={post?.data?.name}
                                  likes={post?.data?.likes}
                                  score={post?.data?.score}
                                  size={5}
                                  postMode={true}
                                  triggerVote={triggerVote}
                                />
                              </div>
                              <div className="hidden md:block">
                                <SaveButton
                                  id={post?.data?.name}
                                  saved={post?.data?.saved}
                                  row={true}
                                  useKeys={true}
                                />
                              </div>
                              <button
                                title="see comments (f)"
                                onClick={() => setUseMediaMode(false)}
                                className="flex items-center gap-1 ml-0 mr-2 text-xs border border-transparent outline-none hover:underline"
                              >
                                <BiComment className="flex-none w-4 h-4 " />
                                <span>
                                  {post?.data?.num_comments}{" "}
                                  {post?.data?.num_comments === 1
                                    ? "comment"
                                    : "comments"}
                                </span>
                              </button>
                            </div>
                            {(post?.data?.link_flair_text?.length > 0 ||
                              post?.data?.link_flair_richtext?.length > 0) &&
                              windowWidth >= 768 && (
                                <span className="py-1 text-xs font-medium md:mt-1">
                                  <TitleFlair post={post.data} />
                                </span>
                              )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ))}
      </div>
    </>
  );
};

export default MediaModal;
