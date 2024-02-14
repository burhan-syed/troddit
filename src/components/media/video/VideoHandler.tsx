/* eslint-disable @next/next/no-img-element */
import Image from "next/legacy/image";
import useBrowser from "../../../hooks/useBrowser";
import { useInView } from "react-intersection-observer";
import { useState, useEffect, useRef, useMemo } from "react";
import { useMainContext } from "../../../MainContext";
import { BiVolumeMute, BiVolumeFull, BiPlay, BiPause } from "react-icons/bi";
import { secondsToHMS } from "../../../../lib/utils";
import { useKeyPress } from "../../../hooks/KeyPress";
import React from "react";
import useGlobalState from "../../../hooks/useGlobalState";
import { useWindowWidth } from "@react-hook/window-size";
import HlsPlayer from "./HLSPlayer";
import type { HlsConfig } from "hls.js";
import LoaderPuff from "../../ui/LoaderPuff";

const VideoHandler = ({
  name,
  columns,
  curPostName = undefined,
  thumbnail,
  placeholder,
  videoInfo,
  maxHeightNum = -1,
  fullMediaMode = false,
  imgFull = false,
  postMode = false,
  hide = false,
  containerDims = [0, 0],
  uniformMediaMode = false,
  quality = "" as "full" | "sd" | "hd" | "min" | undefined,
  setAllowIframe,
  checkCardHeight,
}) => {
  const context: any = useMainContext();
  const browser = useBrowser();
  const windowWidth = useWindowWidth();
  const { getGlobalData, setGlobalData, clearGlobalState } = useGlobalState([
    "videoLoadData",
  ]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const volControls = useRef<HTMLDivElement>(null);
  const fullWidthRef: any = useRef();
  const seekRef: any = useRef();
  const [videoQuality, setVideoQuality] = useState<
    "full" | "sd" | "hd" | "min" | undefined
  >(() => quality);
  useEffect(() => {
    setVideoQuality(quality);
  }, [quality]);

  const [vodInfo, setVodInfo] = useState(() => videoInfo);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [preventPlay, setPreventPlay] = useState(() => hide);
  const [manualPlay, setmanualPlay] = useState(false);
  const [manualPause, setManualPause] = useState(false);
  const [muted, setMuted] = useState(
    !(context?.audioOnHover && postMode) || preventPlay
  );

  const { volume, setVolume } = context;
  const [hasAudio, setHasAudio] = useState(() =>
    !videoInfo.hlsSrc && !videoInfo.hasAudio ? false : true
  );
  const [prevMuted, setPrevMuted] = useState(true);
  const [manualAudio, setManualAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [videoDuration, setVideoDuration] = useState(
    () => videoInfo?.duration ?? 0.0
  );
  const [buffering, setBuffering] = useState(false);
  const [mouseIn, setMouseIn] = useState(false);
  const [focused, setFocused] = useState(postMode);
  const [show, setShow] = useState(postMode && !hide ? true : false);
  const [left, setLeft] = useState(false);
  const [heightStyle, setHeightStyle] = useState({});

  const [vidHeight, setVidHeight] = useState(videoInfo?.height);
  const [vidWidth, setVidWidth] = useState(videoInfo?.width);
  useEffect(() => {
    const maximizeWidth = () => {
      let r = fullWidthRef?.current?.clientWidth / videoInfo.width;
      setVidWidth(r * videoInfo.width);
      setVidHeight(r * videoInfo.height);
    };
    //if imgFull maximize the video to take full width
    if (imgFull && !containerDims?.[1]) {
      maximizeWidth();
    }
    //if container (containerDims) fill it
    else if (containerDims?.[1]) {
      let ry = containerDims?.[1] / videoInfo?.height;
      let rx = containerDims?.[0] / videoInfo?.width;
      if (Math.abs(ry - rx) < 0.05) {
        //if minimal cropping just fill the area
        setVidHeight(containerDims?.[1]);
        setVidWidth(containerDims?.[0]);
      } else if (ry <= rx) {
        setVidHeight(containerDims?.[1]);
        setVidWidth(videoInfo.width * (containerDims?.[1] / videoInfo?.height));
      } else {
        setVidWidth(containerDims?.[0]);
        setVidHeight(
          videoInfo.height * (containerDims?.[0] / videoInfo?.width)
        );
      }
    }
    //
    //in single column or in a post we will scale video so height is within window. By default maxHeightNum is x * windowHeight (set in Media component)
    else if ((columns == 1 || postMode) && maxHeightNum > 0) {
      if (videoInfo.height > maxHeightNum) {
        let r2 = maxHeightNum / videoInfo.height;
        // console.log("set",videoInfo.width * r2,maxHeightNum )
        setVidHeight(maxHeightNum);
        setVidWidth(videoInfo.width * r2);
      }
    }
    //otherwise fill the available width to minimize letterboxing
    else {
      maximizeWidth();
    }

    return () => {
      //by default native video height/width
      setVidHeight(videoInfo.height);
      setVidWidth(videoInfo.width);
    };
  }, [
    imgFull,
    maxHeightNum,
    fullWidthRef?.current?.clientWidth,
    videoInfo,
    postMode,
    containerDims,
    columns,
  ]);

  //unify overall heights to avoid weird sizing issues
  useEffect(() => {
    if (videoRef.current?.clientWidth) {
      let h = (videoRef?.current?.clientWidth / vidWidth) * vidHeight;
      if (h > 0) {
        setHeightStyle({
          height: `${Math.min(h, vidHeight)}px`,
        });
      }
    }
  }, [videoRef?.current?.clientWidth, vidHeight, vidWidth, postMode]);

  const onLoadedData = () => {
    setVideoDuration(videoRef?.current?.duration as number);
    setVideoLoaded(true);
  };

  const { ref } = useInView({
    threshold: [0, 0.7, 0.8, 0.9, 1],
    onChange: (inView, entry) => {
      if (!postMode && !preventPlay && !context?.mediaMode) {
        entry.intersectionRatio == 0
          ? setShow(false)
          : entry.intersectionRatio >= 0.8 && setShow(true);
        show && !postMode && entry.intersectionRatio < 1
          ? setLeft(true)
          : entry.intersectionRatio == 1 && setLeft(false);
      }
    },
  });

  useEffect(() => {
    if (name === curPostName && fullMediaMode) {
      setPreventPlay(false);
    } else if (fullMediaMode && name !== curPostName) {
      setPreventPlay(true);
    }
  }, [curPostName]);

  useEffect(() => {
    if (
      ((context?.autoplay && !fullMediaMode) ||
        (context?.autoPlayMode && fullMediaMode && !preventPlay) ||
        (fullMediaMode && name === curPostName)) &&
      ((!context.pauseAll && show) || fullMediaMode) &&
      !manualPause
    ) {
      playControl({ override: "play" });
    } else if ((!context?.autoplay && !postMode) || !show || preventPlay) {
      playControl({ override: "pause" });
    }
  }, [
    context.autoplay,
    context.pauseAll,
    context?.autoPlayMode,
    show,
    preventPlay,
    curPostName,
  ]);

  useEffect(() => {
    //preload in fullmediamode
  }, [fullMediaMode]);

  useEffect(() => {
    if (context.pauseAll && !postMode) {
      playControl({ override: "pause" });
    }
  }, [context.pauseAll]);

  //main control for play/pause button
  const playControl = ({
    e,
    manual = false,
    override,
  }: {
    e?: any;
    manual?: boolean;
    override?: "play" | "pause";
  }) => {
    e?.preventDefault();
    e?.stopPropagation();

    const playMedia = () => {
      setShow(true);
      manual && setManualPause(false);
      setBuffering(true);
      videoRef?.current
        ?.play()
        .then(() => {
          setBuffering(false);
          manual && setmanualPlay(true);
        })
        .catch((e) => {
          if (manual) {
            setmanualPlay(false);
          } else if (videoRef.current && videoRef.current?.muted !== true) {
            //try muting and playing
            triggerMute();
            videoRef.current.muted = true;
            videoRef.current.play().then(() => {
              setBuffering(false);
            });
          }
        });
    };
    const pauseMedia = () => {
      manual && setManualPause(true);
      setmanualPlay(false);
      videoRef?.current?.pause();
      setVideoPlaying(false);
    };
    if (override === "play") {
      playMedia();
      //setTryPlay(true);
    } else if (override === "pause") {
      pauseMedia();
    } else {
      //when video is paused/stopped
      if (
        (videoRef?.current?.paused || videoRef?.current?.ended) &&
        !videoPlaying
      ) {
        //play the video
        playMedia();
      }
      //pause the video
      else if (!videoRef?.current?.paused && videoPlaying) {
        pauseMedia();
      }
    }
  };
  //main controls for audio
  const audioControl = (e?, manual = false) => {
    e?.preventDefault();
    e?.stopPropagation();
    manual && setManualAudio(true);
    if (videoRef?.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setMuted(videoRef.current.muted);
    }
  };

  const handleMouseIn = (e) => {
    setShow(true);
    setMouseIn(true);
    if (context.hoverplay && context.cardStyle !== "row1") {
      if (
        (!manualPlay || videoRef?.current?.paused) &&
        !context.autoplay &&
        !postMode
      ) {
        playControl({ e: e, override: "play" });
      }
    }
    if (
      !postMode &&
      !manualAudio &&
      context.audioOnHover &&
      !preventPlay &&
      videoRef.current
    ) {
      videoRef.current.muted = false;
      setMuted(false);
    }
  };

  const handleMouseOut = () => {
    setMouseIn(false);
    //not in manual play, then pause audio and video
    if (context.hoverplay && context.cardStyle !== "row1") {
      if (!manualPlay && !context.autoplay && !postMode) {
        // pauseAudio();
        playControl({ override: "pause" });
      }
    }
    //also mute if not manually unmuted manipulation
    if (
      !manualAudio &&
      !postMode &&
      context.audioOnHover &&
      columns !== 1 &&
      videoRef.current
    ) {
      videoRef.current.muted = true;
      setMuted(true);
    }
  };

  const [showVol, setShowVol] = useState(false);
  const [seekTime, setSeekTime] = useState("");
  const [seekLeftOfset, setSeekLeftOffset] = useState(0);
  const [seekTargetLength, setSeekTargetLenght] = useState(0);
  const showSeek = (e) => {
    let r = e.nativeEvent.offsetX / e.nativeEvent.target.clientWidth;
    setSeekLeftOffset(e.nativeEvent.offsetX);
    setSeekTargetLenght(e.nativeEvent.target.clientWidth);
    setSeekTime(secondsToHMS(r * videoDuration));
  };

  const updateSeek = (e) => {
    e.stopPropagation();
    e.preventDefault();
    let r = e.nativeEvent.offsetX / e.nativeEvent.target.clientWidth;
    if (videoRef.current) {
      videoRef.current.currentTime = r * videoDuration;
      if (!videoPlaying) {
        setProgressPerc(
          videoRef?.current?.currentTime / videoRef?.current?.duration
        );
      }
      setResetInterval((i) => (i += 1));
    }
  };

  const [volMouseDown, setVolMouseDown] = useState(false);
  const [showVolSlider, setShowVolSlider] = useState(false);
  const updateVolume = (e) => {
    e.stopPropagation();
    e.preventDefault();
    let r = Math.abs(
      1 - e.nativeEvent.offsetY / e.nativeEvent.target.clientHeight
    );
    if (r >= 1) r = 1;
    if (r <= 0.1) r = 0;
    if (r > 0 && videoRef.current) {
      videoRef.current.muted = false;
      setMuted(false);
    } else if (videoRef.current) {
      videoRef.current.muted = true;
      setMuted(true);
    }
    // r > 0 ? setMuted(false) : setMuted(true);
    setManualAudio(true);
    setVolume(r);
  };

  const updateVolumeDrag = (e) => {
    if (volMouseDown) {
      updateVolume(e);
    }
  };

  useEffect(() => {
    if (
      (!show || !context?.audioOnHover || left) &&
      (!postMode || fullMediaMode) &&
      videoRef.current
    ) {
      videoRef.current.muted = true;
      setMuted(true);
    } else if (
      context?.audioOnHover &&
      (postMode || columns == 1) &&
      !left &&
      //!(browser.includes("Safari") && windowWidth < 640) &&
      videoRef.current
    ) {
      videoRef.current.muted = false;
      setMuted(false);
    }
  }, [show, context?.audioOnHover, columns, left]);

  // useEffect(() => {
  //   if (videoRef?.current) {
  //     videoRef.current.muted = muted;
  //   }
  // }, [muted, videoPlaying]);

  const triggerMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      setMuted(true);
    }
  };
  const triggerHasAudio = (audio: boolean) => {
    setHasAudio(audio);
  };

  useEffect(() => {
    if (videoRef?.current && typeof volume === "number") {
      videoRef.current.volume = volume;
    }

    return () => {
      //
    };
  }, [volume]);

  //smoother progress bar
  const [progressPerc, setProgressPerc] = useState(0);
  const [intervalID, setIntervalID] = useState<any>();
  const [resetInterval, setResetInterval] = useState(0);
  useEffect(() => {
    if (
      videoPlaying &&
      videoRef?.current &&
      (mouseIn || postMode || columns === 1) &&
      !preventPlay
    ) {
      let initial = Date.now();
      let timepassed = 0;
      let duration = videoRef?.current?.duration * 1000;
      let initialTime = videoRef?.current?.currentTime * 1000;
      let delta = initialTime / duration;
      let updateSeekRange = () => {
        if (videoPlaying) {
          timepassed = Date.now() - initial;
          delta = (initialTime + timepassed) / duration;
          if (delta > 1) {
            setResetInterval((i) => (i += 1));
          }

          setCurrentTime((initialTime + timepassed) / 1000);
          setProgressPerc(delta);
          //handle out of range..
          if (
            (initialTime + timepassed) / 1000 > duration &&
            videoRef.current &&
            videoRef?.current?.currentTime >= 0
          ) {
            videoRef.current.currentTime = 0;
          }
        }
      };

      setIntervalID((id) => {
        clearInterval(id);
        return setInterval(updateSeekRange, 10);
      });
    } else {
      clearInterval(intervalID);
    }
    return () => {};
  }, [videoPlaying, mouseIn, postMode, preventPlay, resetInterval, columns]);

  const setData = useRef<any>();
  useEffect(() => {
    if (
      progressPerc >= 0.9 &&
      fullMediaMode &&
      !setData.current &&
      !preventPlay
    ) {
      setData.current = true;
      setTimeout(
        () => {
          setGlobalData(name, true);
        },
        videoDuration > 0 ? videoDuration * 0.1 * 1000 : 100
      );
    } else if (progressPerc < 0.9) {
      setData.current = false;
    }
  }, [progressPerc, fullMediaMode, name, videoDuration, preventPlay]);

  const kPress = useKeyPress("k");
  const mPress = useKeyPress("m");

  const hlsConfig: Partial<HlsConfig> | undefined = useMemo(
    () => ({
      testBandwidth: quality ? false : true,
      startLevel: quality ? undefined : -1,
    }),
    [quality]
  );

  useEffect(() => {
    if (focused && !context?.replyFocus && !preventPlay) {
      kPress && playControl({ manual: true });
      mPress && audioControl();
    }

    return () => {};
  }, [kPress, mPress, context.replyFocus, focused]);

  const timeoutRef = useRef<any>(null);

  return (
    <div
      className={
        " min-w-full group hover:cursor-pointer overflow-hidden " +
        (uniformMediaMode
          ? "object-cover object-center aspect-[9/16] "
          : " flex items-center justify-center")
      }
      onClick={(e) => {
        if (fullMediaMode) {
          if (timeoutRef.current === null) {
            timeoutRef.current = setTimeout(() => {
              playControl({ e: e, manual: true });
              timeoutRef.current = null;
            }, 300);
          }
        } else if (!uniformMediaMode) {
          playControl({ e: e, manual: true });
        }
      }}
      onDoubleClick={(e) => {
        if (fullMediaMode) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
      }}
      onMouseEnter={(e) => {
        setFocused(true);
        windowWidth > 640 && handleMouseIn(e);
      }}
      onMouseLeave={(e) => {
        !postMode && setFocused(false);
        windowWidth > 640 && handleMouseOut();
      }}
      ref={ref}
      style={
        containerDims?.[1]
          ? { height: `${containerDims[1]}px` }
          : uniformMediaMode
          ? { minHeight: "100%" }
          : heightStyle
      }
    >
      {buffering && (
        <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
          <LoaderPuff />
        </div>
      )}
      {/* <div className="absolute z-10 text-lg text-white -translate-x-1/2 bg-black/40 top-1/2 left-1/2">
        {vidWidth},{vidHeight}
      </div> */}
      {/* Background Span Image */}
      <div
        className="absolute z-0 min-w-full min-h-full overflow-hidden brightness-[0.2]"
        ref={fullWidthRef}
      >
        <Image
          className={"scale-110 blur-md "}
          src={thumbnail.src}
          alt=""
          layout="fill"
          unoptimized={true}
          priority={imgFull}
          onError={() => {
            setUseFallback(true);
          }}
        />
      </div>
      {/* Controls */}
      {true && (
        <>
          {/* {windowWidth <= 640 &&
            (columns === 1 || postMode) &&
            !fullMediaMode &&
            videoPlaying && (
              <div
                className={
                  " top-2 left-1 absolute  z-10 text-white text-xs p-0.5 rounded-lg px-2 bg-black/20 "
                }
              >
                {secondsToHMS(videoDuration - currentTime)}
              </div>
            )} */}
          <div className="absolute bottom-0 z-10 flex flex-row min-w-full p-1 pb-2 text-white h-11">
            <div className={"flex items-center gap-2"}>
              <button
                aria-label="play/pause"
                type={"button"}
                onClick={(e) => {
                  playControl({ e: e, manual: true });
                }}
                className={
                  (fullMediaMode ? "hidden sm:flex " : "") +
                  (uniformMediaMode ? (mouseIn ? " flex  " : " hidden ") : "") +
                  (context?.autoplay
                    ? `${mouseIn ? " flex " : " flex sm:hidden "}`
                    : " flex ") +
                  (windowWidth <= 640 &&
                  !fullMediaMode &&
                  videoPlaying &&
                  (columns === 1 || postMode)
                    ? " p-0.5 rounded-lg px-2 "
                    : " w-8 h-8  ") +
                  "items-center justify-center bg-black rounded-md bg-opacity-20 hover:bg-opacity-40  "
                }
              >
                <div className="">
                  {videoPlaying ? (
                    <>
                      {windowWidth <= 640 &&
                      (columns === 1 || postMode) &&
                      !fullMediaMode ? (
                        <div className={" text-xs "}>
                          {secondsToHMS(videoDuration - currentTime)}
                        </div>
                      ) : (
                        <BiPause className="flex-none w-6 h-6 " />
                      )}
                    </>
                  ) : (
                    <BiPlay className="flex-none w-6 h-6 ml-0.5" />
                  )}
                </div>
              </button>
              {(windowWidth >= 640 || fullMediaMode) && (
                <div
                  className={
                    fullMediaMode
                      ? `flex items-center justify-center gap-2 text-xs sm:text-sm pb-1 ml-1 sm:pb-0 sm:ml-0 ${
                          mouseIn ? "block" : "block sm:hidden"
                        } `
                      : `text-sm ${mouseIn ? "block" : "hidden"}`
                  }
                >
                  {/* {videoPlaying ? (
                    <BiPause className="flex-none w-3 h-3 sm:hidden " />
                  ) : (
                    <BiPlay className="flex-none w-3 h-3 sm:hidden" />
                  )} */}
                  {secondsToHMS(currentTime) +
                    "/" +
                    secondsToHMS(videoDuration)}
                </div>
              )}
            </div>

            {hasAudio && (
              // vol positioner
              <div
                className="relative ml-auto"
                onMouseEnter={() => setShowVolSlider(true)}
                onMouseLeave={() => setShowVolSlider(false)}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {true && (
                  <div
                    //vol container
                    className="absolute bottom-0 left-0 w-full h-[170px] bg-transparent"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <div
                      //slider container
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => setVolMouseDown(true)}
                      onMouseUp={(e) => setVolMouseDown(false)}
                      onMouseLeave={() => setVolMouseDown(false)}
                      className={
                        "relative bottom-0 left-0  justify-center w-full h-32 bg-black bg-opacity-40 rounded-md " +
                        (showVolSlider ? " hidden md:flex " : " hidden ")
                      }
                    >
                      <div
                        //slide range
                        className="absolute bottom-0 flex justify-center w-full mb-2 rounded-full h-28"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <div
                          //range controls
                          className="absolute z-30 w-full h-full"
                          ref={volControls}
                          onClick={(e) => updateVolume(e)}
                          onMouseMove={(e) => {
                            updateVolumeDrag(e);
                          }}
                        ></div>
                        <div className="absolute bottom-0 w-2 h-full">
                          <div
                            //control circle
                            className="absolute z-20 w-4 h-4 bg-white border rounded-full -left-1 "
                            style={
                              muted || volume === 0
                                ? { bottom: 0 }
                                : {
                                    bottom: `${volume * 100 - 10}%`,
                                  }
                            }
                            onMouseDown={() => setVolMouseDown(true)}
                            onMouseUp={() => setVolMouseDown(false)}
                          ></div>
                          <div
                            //vol container
                            className="absolute bottom-0 z-10 w-full origin-bottom rounded-full bg-th-scrollbar"
                            style={{ height: `${muted ? 0 : volume * 100}%` }}
                          ></div>
                          <div className="absolute bottom-0 z-0 w-full h-full rounded-full bg-white/10"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <button
                  //mute unmute button
                  aria-label="toggle mute"
                  type="button"
                  onClick={
                    (e) => {
                      if (!browser.includes("Safari") && videoRef.current) {
                        context.setaudioOnHover(videoRef.current.muted);
                      }
                      audioControl(e, true);
                    }
                    // if(videoRef.current){
                    //   videoRef.current.muted = !videoRef.current.muted;
                    //   setMuted(videoRef.current.muted);
                    // }
                  }
                  onMouseEnter={() => setShowVol(true)}
                  onMouseLeave={() => setShowVol(false)}
                  className={
                    windowWidth < 640 && fullMediaMode
                      ? " absolute flex-none outline-none select-none md:hidden flex items-center justify-center  right-0.5 z-[98] bottom-[9rem] backdrop-blur-lg text-white bg-black/40 w-10 h-10 rounded-full "
                      : (fullMediaMode || uniformMediaMode
                          ? " hidden md:flex"
                          : "  flex ") +
                        " w-8 h-8 relative  items-center justify-center ml-auto bg-black rounded-md bg-opacity-20 hover:bg-opacity-40"
                  }
                >
                  {muted ? (
                    <BiVolumeMute className="flex-none w-4 h-4" />
                  ) : (
                    <BiVolumeFull className="flex-none w-4 h-4 " />
                  )}
                </button>
              </div>
            )}
            <div
              // Progress Bar Container

              id={"progressBarContainer"}
              ref={seekRef}
              className={
                "absolute bottom-0 left-0 z-10  w-full h-5  " +
                (mouseIn || postMode || columns === 1 ? " block " : " hidden ")
              }
            >
              {seekTime !== "" && (
                <div
                  className="absolute flex items-center justify-center w-12 py-1 text-sm transition-transform bg-black rounded-lg bg-opacity-40 bottom-4 border-th-border"
                  style={{
                    left: `${
                      seekLeftOfset <= 24
                        ? 0
                        : seekLeftOfset >= seekTargetLength - 24
                        ? seekTargetLength - 48
                        : seekLeftOfset - 24
                    }px`,
                  }}
                >
                  {seekTime}
                </div>
              )}
              <div
                //video duration
                className="absolute bottom-0 left-0 h-1 origin-left bg-th-scrollbar "
                style={{ width: `${progressPerc * 100}%` }}
              ></div>
              <div
                className="absolute left-0 w-full h-full "
                onMouseMove={(e) => showSeek(e)}
                onMouseLeave={() => setSeekTime("")}
                onClick={(e: any) => {
                  updateSeek(e);
                }}
              ></div>
            </div>
          </div>
        </>
      )}
      {/* Video */}
      <div
        className={
          uniformMediaMode
            ? "min-h-full min-w-full object-cover object-center "
            : postMode && !fullMediaMode && !containerDims?.[1]
            ? "min-w-full"
            : "relative overflow-hidden flex items-center  object-fill"
        }
        style={
          uniformMediaMode
            ? { height: `100%` }
            : containerDims?.[1]
            ? { height: `${containerDims[1]}px` }
            : heightStyle
        }
      >
        {/* <div
          //high res placeholder image
          className={
            ` ` +
            `${
              !videoLoaded
                ? " opacity-100 "
                : containerDims?.[1]
                ? " hidden "
                : " opacity-0 "
            }` +
            (!videoLoaded && containerDims?.[1]
              ? " absolute top-1/2 -translate-y-1/2 "
              : "")
          }
        >
          <Image
            className={
              (!containerDims?.[1] ? "absolute bottom-0 left-0" : " ") +
              (placeholder?.url?.includes("http") ? " " : " blur-2xl ")
            }
            src={
              placeholder?.url?.includes("http")
                ? placeholder.url
                : thumbnail.url
            }
            height={placeholder.height}
            width={placeholder.width}
            layout={uniformMediaMode ? "fill" : "intrinsic"}
            objectFit={uniformMediaMode ? "cover" : undefined}
            alt=""
            unoptimized={true}
            priority={imgFull}
            onError={() => {
              setUseFallback(true);
            }}
            draggable={false}
          />
        </div> */}
        <HlsPlayer
          playerRef={videoRef}
          hlsConfig={hlsConfig}
          quality={videoQuality}
          src={vodInfo?.hlsSrc ?? vodInfo?.src}
          skipHls={!vodInfo?.hlsSrc}
          triggerMute={triggerMute}
          triggerHasAudio={triggerHasAudio}
          poster={
            !placeholder?.src?.includes("publicdomainpictures")
              ? placeholder?.src?.includes("https")
                ? placeholder.src
                : thumbnail.src
              : ""
          }
          className={
            (videoLoaded ? "opacity-100 " : " opacity-100") +
            (!containerDims?.[1]
              ? " min-w-full min-h-full max-w-full max-h-full m-auto block absolute inset-0 w-0 h-0  " //absolute top-0 left-1/2 -translate-x-1/2
              : "  ") +
            (uniformMediaMode
              ? " min-w-full min-h-full max-w-full max-h-full m-auto block absolute inset-0 w-0 h-0 "
              : "") +
            " "
          }
          width={`${vidWidth}`}
          height={`${vidHeight}`}
          autoPlay={
            (context.autoplay && columns === 1) || postMode || fullMediaMode
          }
          disablePictureInPicture
          muted={true}
          loop={true}
          controls={false}
          preload={context?.autoplay || postMode ? "auto" : "none"}
          onWaiting={() => {
            if (!muted) setPrevMuted(false);
            setBuffering(true);
            setVideoPlaying(false);
          }}
          onPlaying={() => {
            if (!show) {
              videoRef.current?.pause();
            }
            setBuffering(false);
            setVideoPlaying(true);
          }}
          onPause={() => {
            setVideoPlaying(false);
          }}
          onEnded={() => {
            //
          }}
          onLoadedMetadata={() => {
            checkCardHeight && checkCardHeight();
          }}
          onLoadedData={onLoadedData}
          playsInline
          draggable={false}
        />
      </div>
    </div>
  );
};

export default VideoHandler;
