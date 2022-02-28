import Image from "next/image";
import { useState, useEffect, useRef, BaseSyntheticEvent } from "react";
import { useMainContext } from "../MainContext";
import { BsPlay, BsPause, BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import { BiVolumeMute, BiVolumeFull, BiPlay, BiPause } from "react-icons/bi";
import { useWindowHeight } from "@react-hook/window-size";
import { secondsToHMS } from "../../lib/utils";
import { useKeyPress } from "../hooks/KeyPress";
const VideoHandler = ({
  thumbnail,
  placeholder,
  videoInfo,
  maxHeight = {},
  maxHeightNum = 6000,
  imgFull = false,
  postMode = false,
  audio,
  containerDims = undefined,
}) => {
  const context: any = useMainContext();
  const video: any = useRef();
  const audioRef: any = useRef();
  const volRef: any = useRef();
  const seekRef: any = useRef();
  // const [audioSrc, setaudioSrc] = useState("");
  // const [mounted, setMounted] = useState(false);
  // const [loaded, setLoaded] = useState(false);

  const [hasAudio, sethasAudio] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [manualPlay, setmanualPlay] = useState(false);
  const [muted, setMuted] = useState(!(context?.audioOnHover && postMode));
  const [volume, setVolume] = useState(
    !(context?.audioOnHover && postMode) ? 0 : 0.5
  );
  const [prevMuted, setPrevMuted] = useState(true);
  const [manualAudio, setManualAudio] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [videoDuration, setVideoDuration] = useState(0.0);
  const [buffering, setBuffering] = useState(false);
  const [mouseIn, setMouseIn] = useState(false);
  const [focused, setFocused] = useState(postMode);

  const onLoadedData = () => {
    setVideoDuration(video?.current?.duration);

    setVideoLoaded(true);
  };
  const onAudioLoaded = () => {
    sethasAudio(true);
  };

  const [imgheight, setheight] = useState({});
  const [maxheight, setmaxheight] = useState({});
  const [maxheightnum, setmaxheightnum] = useState<Number>();

  const [vidHeight, setVidHeight] = useState(videoInfo?.height);
  const [vidWidth, setVidWidth] = useState(videoInfo?.width);
  useEffect(() => {
    //console.log(videoInfo.url);
    if (postMode && containerDims) {
      //console.log(containerDims);
      let ry = containerDims?.[1] / videoInfo?.height;
      let rx = containerDims?.[0] / videoInfo?.width;
      if (Math.abs(ry - rx) < 0.05) {
        //if minimal cropping just fill the area
        setVidHeight(Math.floor(containerDims?.[1]));
        setVidWidth(Math.floor(containerDims?.[0]));
      } else if (ry <= rx) {
        setVidHeight(containerDims?.[1]);
        setVidWidth(
          Math.floor(videoInfo.width * (containerDims?.[1] / videoInfo?.height))
        );
      } else {
        setVidWidth(containerDims?.[0]);
        setVidHeight(
          Math.floor(videoInfo.height * (containerDims?.[0] / videoInfo?.width))
        );
      }
    } else if (imgFull || (context.columnOverride == 1 && !postMode)) {
      if (videoInfo?.height && maxHeightNum) {
        let r = maxHeightNum / videoInfo.height;
        setVidHeight(Math.floor(videoInfo.height * r));
        setVidWidth(Math.floor(videoInfo.width * r));
      }
    }

    return () => {
      setVidHeight(videoInfo.height);
      setVidWidth(videoInfo.width);
    };
  }, [
    imgFull,
    maxHeightNum,
    videoInfo,
    context.columnOverride,
    postMode,
    containerDims,
  ]);

  useEffect(() => {
    setheight({
      height: `${videoInfo.height}px`,
      maxHeight: `${Math.floor(screen.height * 0.75)}px`,
    });
    setmaxheight({ maxHeight: `${Math.floor(screen.height * 0.75)}px` });
    setmaxheightnum(Math.floor(screen.height * 0.75));
  }, [videoInfo]);

  useEffect(() => {
    if (context?.autoplay && !videoPlaying && !context.pauseAll) {
      video?.current?.play().catch((e) => console.log(e));
    } else if (!context?.autoplay && videoPlaying) {
      video?.current?.pause()?.catch((e) => console.log(e));
    }
  }, [context.autoplay, context.pauseAll]);
  useEffect(() => {
    if (hasAudio && audioPlaying && context.pauseAll) {
      //console.log("forcemute");
      pauseAll();
    }
  }, [context.pauseAll]);

  //main control for play/pause button
  const playControl = (e?, manual = false) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (true) {
      //when video is paused/stopped
      if ((video?.current?.paused || video?.current?.ended) && !videoPlaying) {
        //play the video
        video?.current
          ?.play()
          .then(() => {
            //setVideoPlaying(true); this will be handled directly from the video element
            manual && setmanualPlay(true);

            if (
              hasAudio
              // &&(audioRef?.current?.paused || audioRef?.current?.ended) &&
              // !audioPlaying
            ) {
              audioRef.current.currentTime = video.current.currentTime;
              audioRef?.current
                ?.play()
                ?.then(() => setAudioPlaying(true))
                .catch((e) => console.log(e));
            }
          })
          .catch((e) => {
            //setVideoPlaying(false); this will be handled directly from the video element
            manual && setmanualPlay(false);
          });
      }
      //pause the video
      else if (!video?.current?.paused && videoPlaying) {
        setVideoPlaying(false);
        setmanualPlay(false);
        video?.current?.pause();
        if (!audioRef?.current?.paused) {
          audioRef.current.pause();
          setAudioPlaying(false);
        }
      }
    }
  };
  //main controls for audio
  const audioControl = (e?, manual = false) => {
    e?.preventDefault();
    e?.stopPropagation();
    //if audio exists
    if (audioRef?.current?.muted !== undefined && hasAudio) {
      //always sync audio
      audioRef.current.currentTime = video.current.currentTime;
      //if audio is not playing and video is playing, play audio
      if (!audioPlaying && videoPlaying) {
        audioRef?.current?.play().catch((e) => console.log(e));
      }
      manual && setManualAudio(true);
      setMuted((m) => !m);
    }
  };

  //for pausing media when another post is opened
  const pauseAll = () => {
    videoLoaded && video?.current?.pause();
    hasAudio && audioRef.current.pause();
  };

  const pauseVideo = () => {
    videoLoaded && video?.current?.pause();
  };

  //pause Audio while video is loading
  const pauseAudio = () => {
    if (hasAudio) {
      audioRef.current.pause();
    }
  };
  //play Audio..
  const playAudio = () => {
    if (hasAudio) {
      audioRef.current.currentTime = video.current.currentTime;
      audioRef.current.play();
    }
  };

  //play Video..
  const playVideo = () => {
    videoLoaded && video?.current?.play().catch((e) => console.log(e));
  };

  const handleMouseIn = (e) => {
    setMouseIn(true);
    if (
      !context.mediaOnly &&
      context.hoverplay &&
      context.cardStyle !== "row1"
    ) {
      if (
        (!manualPlay || video?.current?.paused) &&
        !context.autoplay &&
        !postMode
      ) {
        playControl(e);
      }
    }
    if (!postMode && !manualAudio && context.audioOnHover) {
      setMuted(false);
    }
  };

  const handleMouseOut = () => {
    setMouseIn(false);
    //not in manual play, then pause audio and video
    if (
      !context.mediaOnly &&
      context.hoverplay &&
      context.cardStyle !== "row1"
    ) {
      if (!manualPlay && !context.autoplay && !postMode) {
        pauseAudio();
        pauseVideo();
      }
    }
    //also mute if not manually unmuted manipulation
    if (!manualAudio && !postMode && context.audioOnHover) {
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
    //console.log(secondsToHMS(r * videoDuration));
    setSeekTime(secondsToHMS(r * videoDuration));
  };

  const updateSeek = (e) => {
    e.stopPropagation();
    e.preventDefault();
    //console.log(e, e.nativeEvent.offsetX, e.nativeEvent.target.clientWidth);
    //console.log(video.current);
    let r = e.nativeEvent.offsetX / e.nativeEvent.target.clientWidth;
    //console.log(r, videoDuration, r * videoDuration);
    video.current.currentTime = r * videoDuration;
    if (!videoPlaying) {
      setProgressPerc(video?.current?.currentTime / video?.current?.duration);
    }
  };

  const [volumeOffset, setvolumeOffset] = useState(-1);
  const [volMouseDown, setVolMouseDown] = useState(false);
  const [showVolSlider, setShowVolSlider] = useState(false);
  const updateVolume = (e) => {
    e.stopPropagation();
    e.preventDefault();
    //console.log(e, e.nativeEvent.offsetX, e.nativeEvent.target.clientWidth);
    //console.log(video.current);
    let r = Math.abs(
      1 - e.nativeEvent.offsetY / e.nativeEvent.target.clientHeight
    );
    //console.log(e.nativeEvent.offsetY);
    setvolumeOffset(e.nativeEvent.offsetY);
    //console.log(r, videoDuration, r * videoDuration);
    //console.log(r);
    if (r >= 1) r = 1;
    if (r <= 0.1) r = 0;
    r > 0 ? setMuted(false) : setMuted(true);
    setManualAudio(true);
    setVolume(r);
  };
  const updateVolumeDrag = (e) => {
    if (volMouseDown) {
      updateVolume(e);
    }
  };

  useEffect(() => {
    if (postMode) {
      setMuted(!context?.audioOnHover);
    }
    return () => {
      //
    };
  }, [context?.audioOnHover]);

  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.muted = muted;
    }
  }, [muted]);

  useEffect(() => {
    if (audioRef?.current) {
      audioRef.current.volume = volume;
    }
    return () => {
      //
    };
  }, [volume]);

  //smoother progress bar
  const [progressPerc, setProgressPerc] = useState(0);
  const [intervalID, setIntervalID] = useState<any>();
  useEffect(() => {
    if (videoPlaying && video?.current && mouseIn) {
      let initial = Date.now();
      let timepassed = 0;
      let duration = video?.current?.duration * 1000;
      let initialTime = video?.current?.currentTime * 1000;
      let delta = initialTime / duration;
      //console.log(delta);
      let updateSeekRange = () => {
        if (videoPlaying) {
          //console.log(delta + Date.now() / initial);
          timepassed = Date.now() - initial;
          delta = (initialTime + timepassed) / duration;
          if (delta > 1) delta = 1;
          //console.log((initialTime + timepassed) / duration);
          setCurrentTime((initialTime + timepassed) / 1000);
          setProgressPerc(delta);
          //handle out of range..
          if ((initialTime + timepassed) / 1000 > duration) {
            video.current.currentTime = 0;
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
    //console.log(video?.current);
    return () => {};
  }, [videoPlaying, mouseIn]);

  const kPress = useKeyPress("k");
  const spacePress = useKeyPress("Space");
  const mPress = useKeyPress("m");

  useEffect(() => {
    if (focused && !context?.replyFocus) {
      (kPress || spacePress) && playControl();
      mPress && audioControl();
    }

    return () => {};
  }, [kPress, mPress]);

  return (
    <div
      className={
        "flex items-center justify-center min-w-full group hover:cursor-pointer overflow-hidden"
        //+(!postMode && context.columnOverride !== 1 && " mb-[-5px]")
      }
      onClick={(e) => {
        playControl(e, true);
      }}
      onMouseEnter={(e) => {
        // console.log("mouseenter");
        setFocused(true);
        handleMouseIn(e);
      }}
      onMouseLeave={(e) => {
        !postMode && setFocused(false);
        handleMouseOut();
      }}
    >
      {/* Background Span Image */}
      <div className="absolute top-0 z-0 min-w-full min-h-full overflow-hidden  dark:brightness-[0.2] brightness-50 ">
        <Image
          className={"scale-110 blur-md  "}
          src={thumbnail.url}
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
      <div className="absolute bottom-0 z-10 flex flex-row min-w-full p-1 pb-2 text-lightText">
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              //console.log("innerclick");
              playControl(e, true);
            }}
            className={
              (context?.autoplay
                ? `${mouseIn ? " flex " : " hidden "}`
                : " flex ") +
              "items-center justify-center w-8 h-8  bg-black rounded-md bg-opacity-20 hover:bg-opacity-40  "
            }
          >
            <div className="">
              {videoPlaying ? (
                <BiPause className="flex-none w-6 h-6 " />
              ) : (
                <BiPlay className="flex-none w-6 h-6 ml-0.5" />
              )}
            </div>
          </button>
          <div className={" text-sm " + (mouseIn ? " block  " : " hidden ")}>
            {secondsToHMS(currentTime) + "/" + secondsToHMS(videoDuration)}
          </div>
        </div>
        {hasAudio && (
          // vol positioner
          <div
            className="relative ml-auto"
            onMouseEnter={() => setShowVolSlider(true)}
            onMouseLeave={() => setShowVolSlider(false)}
          >
            {/* vol container */}
            <div className="absolute bottom-0 left-0 w-full h-[170px] bg-transparent">
              {/* slider container */}
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => setVolMouseDown(true)}
                onMouseUp={(e) => setVolMouseDown(false)}
                onMouseLeave={() => setVolMouseDown(false)}
                className={
                  "relative bottom-0 left-0  justify-center w-full h-32 bg-black bg-opacity-40 rounded-md " +
                  (showVolSlider ? " hidden md:flex " : " hidden ")
                  // limiting to post mode currently becuase of slider drag issues
                }
              >
                {/* Slide range */}
                <div className="absolute bottom-0 flex justify-center w-full mb-2 rounded-full h-28">
                  {/* Range controls */}
                  <div
                    className="absolute z-30 w-full h-full"
                    onClick={(e) => updateVolume(e)}
                    //onMouseLeave={() => setVolMouseDown(false)}
                    onMouseMove={(e) => {
                      updateVolumeDrag(e);
                    }}
                  ></div>
                  <div className="absolute bottom-0 w-2 h-full">
                    {/* Control Circle  */}
                    <div
                      className="absolute z-20 w-4 h-4 bg-white border rounded-full -left-1 "
                      style={
                        muted || volume === 0
                          ? { bottom: 0 }
                          : {
                              transform: `translateY(${
                                volumeOffset === -1 ? 48 : volumeOffset
                              }px)`,
                            }
                      }
                      onMouseDown={() => setVolMouseDown(true)}
                      onMouseUp={() => setVolMouseDown(false)}
                    ></div>
                    {/* Vol indicator */}
                    <div
                      className="absolute bottom-0 z-10 w-full origin-bottom bg-blue-400 rounded-full dark:bg-red-800"
                      style={{ height: `${muted ? 0 : volume * 100}%` }}
                    ></div>
                    <div className="absolute bottom-0 z-0 w-full h-full bg-white bg-opacity-50 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
            {/* mute/unmute button */}
            <button
              onClick={(e) => audioControl(e, true)}
              onMouseEnter={() => setShowVol(true)}
              onMouseLeave={() => setShowVol(false)}
              className="relative flex items-center justify-center w-8 h-8 ml-auto bg-black rounded-md bg-opacity-20 hover:bg-opacity-40"
            >
              {muted ? (
                <BiVolumeMute className="flex-none w-4 h-4" />
              ) : (
                <BiVolumeFull className="flex-none w-4 h-4 " />
              )}
            </button>
          </div>
        )}
        {/* Progress Bar Container*/}
        <div
          id={"progressBarConainer"}
          ref={seekRef}
          className={
            "absolute bottom-0 left-0 z-10  w-full h-5  " +
            (mouseIn ? " block " : " hidden ")
          }
        >
          {seekTime !== "" && (
            <div
              className="absolute flex items-center justify-center w-12 py-1 text-sm transition-transform bg-black rounded-lg bg-opacity-40 bottom-4 dark:border-darkBorder"
              style={{
                left: `${
                  seekLeftOfset <= 24
                    ? 0
                    : seekLeftOfset >= seekTargetLength - 24
                    ? seekTargetLength - 48
                    : seekLeftOfset - 24
                }px`,
                // transform: `translateX(${
                //   seekLeftOfset / seekTargetLength < 0.2
                //     ? 20
                //     : seekLeftOfset / seekTargetLength > 0.9
                //     ? -80
                //     : -20
                // }px)`,
              }}
            >
              {seekTime}
            </div>
          )}
          {/* Video Duration */}
          <div
            className="absolute bottom-0 left-0 h-1 origin-left bg-blue-400 dark:bg-red-800 "
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

      {/* Video */}
      <div
        className={"relative overflow-hidden flex   "}
        style={containerDims?.[1] && { height: `${containerDims[1]}px` }}
      >
        {((!videoLoaded && (context?.autoPlay || postMode)) || buffering) && (
          <div className="absolute z-10 w-8 h-8 -mt-4 -ml-4 border-b-2 border-gray-200 rounded-full top-1/2 left-1/2 animate-spin"></div>
        )}

        <div
          className={
            `  ` +
            `${
              !videoLoaded
                ? " opacity-100 "
                : containerDims?.[1]
                ? " hidden "
                : postMode
                ? "opacity-0 "
                : " opacity-0"
            }` +
            (!videoLoaded &&
              containerDims?.[1] &&
              " absolute top-1/2 -translate-y-1/2 ")
          }
        >
          <Image
            className={!containerDims?.[1] ? "absolute bottom-0 left-0" : " "} //!postMode ?
            src={placeholder.url}
            height={vidHeight}
            width={vidWidth}
            alt="placeholder"
            unoptimized={true}
            priority={imgFull}
            onError={() => {
              setUseFallback(true);
            }}
            draggable={false}
          />
        </div>

        <video
          ref={video}
          className={
            (videoLoaded ? "opacity-100 " : " opacity-0") +
            (!containerDims?.[1] ? " absolute top-0 left-0 " : " ") //!postMode
          }
          width={`${vidWidth}`}
          height={`${vidHeight}`}
          autoPlay={
            context?.autoplay || postMode || context.cardStyle === "row1"
          }
          muted
          loop
          preload={context?.autoplay || postMode ? "auto" : "none"}
          onWaiting={() => {
            if (!muted) setPrevMuted(false);
            //pauseAll();
            setBuffering(true);
            setVideoPlaying(false);
            pauseAudio();
          }}
          onPlaying={() => {
            setBuffering(false);
            setVideoPlaying(true);
            playAudio();
          }}
          onPause={() => {
            setVideoPlaying(false);
          }}
          controls={false}
          onLoadedData={onLoadedData}
          playsInline
          draggable={false}
        >
          <source
            data-src={videoInfo.url}
            src={videoInfo.url}
            type="video/mp4"
          />
        </video>

        <video
          autoPlay={false}
          controls={false}
          ref={audioRef}
          muted={!muted}
          loop={false}
          className="hidden"
          playsInline
          onCanPlay={onAudioLoaded}
          onPlaying={() => setAudioPlaying(true)}
          onPause={() => setAudioPlaying(false)}
          onWaiting={() => setAudioPlaying(false)}
          onError={(err) => null}
          onLoadStart={(e) => setVolume(0.5)}
        >
          <source data-src={audio} src={audio} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default VideoHandler;
