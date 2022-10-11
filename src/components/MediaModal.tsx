import { useWindowWidth } from "@react-hook/window-size";
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
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

const MediaModal = ({
  hide,
  changePost,
  flattenedPosts,
  curPostNum,
  setHideArrows,
  hideArrows,
  showUI,
  setUseMediaMode,
  firstNum,
  isXTranslating,
  setIsYTranslating,
  setReadPosts,
}) => {
  const windowWidth = useWindowWidth();
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
    () => flattenedPosts?.[curPostName]?.data?.name
  );
  const [touched, setTouched] = useState(false);
  const [touchStartY, setTouchStartY] = useState<any[]>([0]);
  const [touchEndY, setTouchEndY] = useState<any[]>([0]);
  const [touchStartTime, setTouchStartTime] = useState([Infinity]);
  const [translateAmount, setTranslateAmount] = useState(
    -1 * curPostNum * windowHeight
  );
  const [animateY, setAnimateY] = useState(false);
  const handleTouchStart = (e) => {
    if (!isXTranslating) {
      setTouched(true);
      setAnimateY(false);
      touchStartY[0] = e.targetTouches[0].clientY;
      touchStartTime[0] = new Date().getTime();
    }
  };

  useEffect(() => {
    return () => {
      touchEndY[0] = undefined;
      touchStartTime[0] = Infinity;
      touchStartY[0] = undefined;
    };
  }, [isXTranslating]);

  const handleTouchEnd = (e) => {
    setAnimateY(true);
    if (!isXTranslating) {
      const now = new Date().getTime();

      if (
        now > touchStartTime[0] + 100 &&
        typeof touchStartY[0] == "number" &&
        typeof touchEndY[0] == "number" &&
        touchEndY[0] !== 0
      ) {
        if (
          touchStartY[0] - touchEndY[0] > 15 &&
          flattenedPosts[curPostNum + 1]?.data?.name
        ) {
          changePost(1);
          setHideArrows(true);
          setTranslateAmount(-1 * (curPostNum + 1) * windowHeight);
        } else if (
          touchStartY[0] - touchEndY[0] < -15 &&
          flattenedPosts[curPostNum - 1]?.data?.name
        ) {
          changePost(-1);
          setHideArrows(true);
          setTranslateAmount(-1 * (curPostNum - 1) * windowHeight);
        } else {
          setHideArrows(false);
          setTranslateAmount(-1 * curPostNum * windowHeight);
        }
      } else {
        setHideArrows(false);
        setTranslateAmount(-1 * curPostNum * windowHeight);
      }
      touchEndY[0] = undefined;
      touchStartTime[0] = Infinity;
      touchStartY[0] = undefined;
    }
  };
  const handleTouchMove = (e) => {
    if (!isXTranslating) {
      touchEndY[0] = e.targetTouches[0].clientY;
      if (
        (e.targetTouches[0].clientY > touchStartY &&
          flattenedPosts[curPostNum - 1]?.data?.name) ||
        (e.targetTouches[0].clientY < touchStartY &&
          flattenedPosts[curPostNum + 1]?.data?.name)
      ) {
        if (new Date().getTime() > touchStartTime[0] + 100) {
          setTranslateAmount(
            -1 * curPostNum * windowHeight +
              -1 * (touchStartY[0] - e.targetTouches[0].clientY)
          );
        }
      }
    }
  };
  //add to read on unmount
  useEffect(() => {
    if (firstNum !== curPostNum && touched) {
      setAnimateY(true);
    }
    setCurPostName(flattenedPosts?.[curPostNum]?.data?.name);
    touchEndY[0] = undefined;
    touchStartTime[0] = Infinity;
    touchStartY[0] = undefined;
    if (
      flattenedPosts?.[curPostNum]?.data?.mediaInfo?.iFrameHTML &&
      context?.preferEmbeds
    ) {
      setHideArrows(false);
    }

    return () => {
      setAnimateY(false);
      touchEndY[0] = undefined;
      touchStartTime[0] = Infinity;
      touchStartY[0] = undefined;
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
    setTranslateAmount(-1 * curPostNum * windowHeight);
  }, [windowHeight, curPostNum]);

  useEffect(() => {
    if (translateAmount !== -1 * curPostNum * windowHeight) {
      setIsYTranslating(true);
    } else {
      setIsYTranslating(false);
    }
  }, [translateAmount, curPostNum, windowHeight]);

  const Media = useCallback(
    (post, hidden) => (
      <>
        <MediaWrapper
          post={post}
          hideNSFW={false}
          forceMute={false}
          containerDims={[windowWidth, windowHeight]}
          imgFull={post?.mediaInfo?.isSelf}
          postMode={true}
          hide={hidden}
          fullMediaMode={true}
          curPostName={curPostName}
        />
      </>
    ),
    [curPostName, windowHeight, windowWidth, hide]
  );

  const [showAd, setShowAd] = useState(true);
  useEffect(() => {
    setShowAd(true);
  }, [curPostNum]);

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

  if (!windowHeight) {
    return <></>;
  }

  return (
    <>
      {!flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf && (
        <button
          aria-label={"toggle full resolution"}
          title={context?.highRes ? "" : "load full res"}
          className={
            "flex items-center justify-center fixed outline-none text-white border border-transparent md:hover:border-th-accent  top-1 left-14 md:left-auto md:right-24 md:top-4 md:h-12 z-[98] hover:backdrop-blur-sm  hover:text-opacity-50 hover:bg-black/40 rounded-full bg-black/40 md:bg-transparent md:rounded-md w-10 h-10 " +
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
      <div
        className={
          "absolute top-0 left-0 " +
          (animateY ? " transition-transform duration-200" : " ")
        }
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => handleTouchMove(e)}
        onTouchEnd={(e) => handleTouchEnd(e)}
        style={{
          transform: `translate3d(0px, ${translateAmount}px,${0}px)`,
          touchAction: `none`,
        }}
        onDoubleClick={(e) => {
          e.preventDefault();
          if (
            !flattenedPosts[curPostNum]?.data?.mediaInfo?.isGallery ||
            ((e.clientX > 48 ||
              e.clientY > windowHeight / 2 + 48 ||
              e.clientY < windowHeight / 2 - 48) &&
              e.clientX < windowWidth - 48)
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
                    "absolute left-0 z-[97] w-screen backdrop-blur-3xl " +
                    (i === curPostNum
                      ? ""
                      : "overflow-hidden pointer-events-none")
                  }
                  style={{
                    backgroundColor: `${bgColor}95`,
                    //transform: `translate3d(0px,${translateAmount + (i * windowHeight)}px,0px)`,
                    top: `${i * windowHeight}px`,
                    height: `${windowHeight}px`,
                  }}
                  ref={i === curPostNum ? containerRef : null}
                  onMouseDown={(e) => {
                    setAnimate(false);
                    i === curPostNum && scale > 1 && onMouseDown(e);
                  }}
                  onWheel={(e) => {
                    setAnimate(false);
                    i === curPostNum && onWheel(e);
                  }}
                >
                  {post?.data?.mediaInfo?.isSelf &&
                  !post?.data?.mediaInfo?.isMedia ? (
                    <div
                      className="flex justify-center w-screen overflow-y-auto bg-th-base "
                      style={{ height: `${windowHeight}px` }}
                    >
                      <div
                        className="max-w-2xl "
                        onTouchMove={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setHideArrows(false);
                        }}
                        onTouchEnd={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div className="mx-2 my-12 md:my-4 md:mx-0">
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
                              <Link href={`/u/${post?.data?.author}`}>
                                <a
                                  className={touched ? " " : "hover:underline"}
                                  onClick={(e) => {
                                    if (touched) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  u/{post?.data?.author}
                                </a>
                              </Link>
                              <span>on</span>
                              <Link href={`/r/${post?.data?.subreddit}`}>
                                <a
                                  className={touched ? "" : "hover:underline"}
                                  onClick={(e) => {
                                    if (touched) {
                                      e.preventDefault();
                                      e.stopPropagation();
                                    }
                                  }}
                                >
                                  r/{post?.data?.subreddit}
                                </a>
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
                          </div>
                          <h1 className="flex flex-wrap items-center gap-2 py-2 text-xl font-semibold">
                            {post?.data?.title}{" "}
                            <span className="text-xs font-medium ">
                              <TitleFlair post={post.data} />
                            </span>
                          </h1>

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
                        </div>
                        {Media(post?.data, i !== curPostNum)}
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
                      <div className="relative min-w-full min-h-full ">
                        {Media(post?.data, i !== curPostNum)}
                      </div>
                    </div>
                  )}
                  {i === curPostNum && !post?.data?.mediaInfo?.isSelf && (
                    <>
                      {post?.data?.mediaInfo?.isVideo &&
                        (!post?.data?.mediaInfo?.iFrameHTML ||
                          !context?.preferEmbeds) && (
                          <button
                            onClick={() => context.toggleAudioOnHover()}
                            className={
                              "text-white outline-none select-none md:hidden flex items-center justify-center absolute right-1.5 z-[98] bottom-[9.5rem] backdrop-blur-lg bg-black/40 w-10 h-10 rounded-full " +
                              (showUI ? "" : "hidden")
                            }
                          >
                            {context.audioOnHover ? (
                              <BiVolumeFull className="flex-none w-4 h-4 " />
                            ) : (
                              <BiVolumeMute className="flex-none w-4 h-4 " />
                            )}
                          </button>
                        )}
                      <div
                        className={
                          "absolute right-1.5 z-[98] bottom-24 md:hidden " +
                          (showUI ? "" : "hidden")
                        }
                      >
                        <SaveButton
                          id={post?.data?.name}
                          saved={post?.data?.saved}
                          row={true}
                          fullmedia={true}
                          useKeys={true}
                        />
                      </div>
                      <button
                        onClick={() => setUseMediaMode(false)}
                        className={
                          "outline-none select-none md:hidden flex items-center justify-center absolute right-1.5 z-[98] bottom-10 backdrop-blur-lg bg-black/40 w-10 h-10 rounded-full " +
                          (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf
                            ? " text-th-text "
                            : " text-white ") +
                          (showUI ? "" : "hidden")
                        }
                      >
                        <BiComment className="flex-none w-4 h-4 " />
                      </button>
                      {post?.data?.mediaInfo?.iFrameHTML &&
                        context?.preferEmbeds && (
                          <div className="absolute top-20 w-screen bg-transparent bottom-14 z-[99] md:invisible"></div>
                        )}
                      <div
                        className={
                          "absolute flex flex-row items-start justify-start gap-2  left-0 p-2 md:pl-2 md:pr-4 md:left-2 w-screen md:w-auto  hover:bg-black/20 md:rounded-md group md:hover:backdrop-blur-sm bg-gradient-to-t " +
                          " md:top-2 md:bottom-auto " +
                          " transition ease-in-out duration-200 " +
                          (flattenedPosts?.[curPostNum]?.data?.mediaInfo?.isSelf
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
                            <Link href={`/u/${post?.data?.author}`}>
                              <a
                                className={touched ? " " : "hover:underline"}
                                onClick={(e) => {
                                  if (touched) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                u/{post?.data?.author}
                              </a>
                            </Link>
                            <span>on</span>
                            <Link href={`/r/${post?.data?.subreddit}`}>
                              <a
                                className={touched ? "" : "hover:underline"}
                                onClick={(e) => {
                                  if (touched) {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }
                                }}
                              >
                                r/{post?.data?.subreddit}
                              </a>
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
                              "flex flex-row items-center justify-start gap-2 pt-2 text-sm text-left outline-none md:pt-0 md:flex-col md:items-start md:py-1 md:gap-2 md:mr-0 text-opacity-80 group-hover:text-opacity-100 mr-14 md:max-w-sm " +
                              (flattenedPosts?.[curPostNum]?.data?.mediaInfo
                                ?.isSelf
                                ? " text-th-text "
                                : " text-white ")
                            }
                          >
                            <button
                              disabled={touched}
                              onClick={() => !touched && setUseMediaMode(false)}
                              className="flex text-left "
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
                              {post?.data?.title}
                            </button>
                            {(post?.data?.link_flair_text?.length > 0 ||
                              post?.data?.link_flair_richtext?.length > 0) &&
                              windowWidth < 768 && (
                                <span className="py-1 text-xs font-medium md:mt-1">
                                  <TitleFlair post={post.data} noClick={true} />
                                </span>
                              )}
                          </div>

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
