import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../MainContext";
import { BsPlay, BsPause, BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import { BiVolumeMute, BiVolumeFull, BiPlay, BiPause } from "react-icons/bi";
import { useWindowHeight } from "@react-hook/window-size";
const VideoHandler = ({
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
  const [timeRemaining, setTimeRemaining] = useState(0.0);
  const [buffering, setBuffering] = useState(false);

  const onLoadedData = () => {
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
    console.log(videoInfo.url);
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

  useEffect(() => {
    setTimeRemaining(video?.current?.duration - video?.current?.currentTime);
    return () => {
      //
    };
  }, [video?.current?.currentTime]);

  // useEffect(() => {
  //   //console.log(volume, audioRef.current);
  //   if (audioRef?.current?.volume) {
  //     audioRef.current.volume = volume;
  //   }
  //   if (volume === 0) {
  //     //setMuted(true);
  //   } else if (volume > 0) {
  //     if (audioRef?.current?.muted !== undefined && hasAudio) {
  //       //always sync audio
  //       audioRef.current.currentTime = video.current.currentTime;
  //       //if audio is not playing and video is playing, play audio
  //       if (!audioPlaying && videoPlaying) {
  //         audioRef?.current?.play().catch((e) => console.log(e));
  //       }
  //       //toggle audio mute
  //       audioRef.current.muted = false; //!audioRef.current.muted;
  //       //if (audioRef.current.muted) audioRef.current.pause();
  //       //mark manual unmute
  //       //muted ? setManualAudio(true) : setManualAudio(false);
  //       setMuted(false);
  //     }
  //   }
  // }, [volume]);

  //main control for play/pause button
  const playControl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    //console.log(video.current);
    //only allow play if video loaded
    if (true) {
      //videoLoaded) {
      //when video is paused/stopped
      if ((video?.current?.paused || video?.current?.ended) && !videoPlaying) {
        //play the video
        video?.current
          ?.play()
          .then(() => {
            //setVideoPlaying(true); this will be handled directly from the video element
            setmanualPlay(true);
          })
          .catch((e) => {
            //setVideoPlaying(false); this will be handled directly from the video element
            setmanualPlay(false);
          });
      }
      //pause the video
      else if (!video?.current?.paused && videoPlaying) {
        setVideoPlaying(false);
        setmanualPlay(false);
        video?.current?.pause();
      }

      //play audio if there is audio
      if (hasAudio) {
        //if audio is paused, sync it and play
        if (
          (audioRef?.current?.paused || audioRef?.current?.ended) &&
          !audioPlaying
        ) {
          audioRef.current.currentTime = video.current.currentTime;
          audioRef?.current?.play().catch((e) => console.log(e));
        }
        //otherwise pause the audio
        else if (!audioRef?.current?.paused && audioPlaying) {
          audioRef.current.pause();
        }
      }
    }
  };
  //main controls for audio
  const audioControl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    //if audio exists
    if (audioRef?.current?.muted !== undefined && hasAudio) {
      //always sync audio
      audioRef.current.currentTime = video.current.currentTime;
      //if audio is not playing and video is playing, play audio
      if (!audioPlaying && videoPlaying) {
        audioRef?.current?.play().catch((e) => console.log(e));
      }
      //toggle audio mute
      audioRef.current.muted = !audioRef.current.muted;
      if (audioRef.current.muted) audioRef.current.pause();
      //mark manual unmute
      muted ? setManualAudio(true) : setManualAudio(false);
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

  const handleMouseIn = () => {
    //if video was not played manually, in card mode,
    if (!manualPlay && videoLoaded && !context.mediaOnly) {
      //play video if not in autoplay
      //disabling this for now - with change from preload to none when not in autoplay
      //if (!context.autoplay) playVideo();

      //unmute play audio if allowed and video playing
      if (
        context.audioOnHover &&
        !(context.audioOnHover && postMode) &&
        videoPlaying
      ) {
        audioRef.current.muted = false;
        setMuted(false);
        playAudio();
      }
    }
  };

  const handleMouseOut = () => {
    //not in manual play, then pause audio and video
    if (!manualPlay && !context.autoplay && !postMode) {
      pauseAudio();
      pauseVideo();
    }

    //also mute if not manually unmuted manipulation
    if (!manualAudio && !postMode) {
      setMuted(true);
      audioRef.current.muted = true;
    }
  };

  return (
    <div
      className="flex items-center justify-center min-w-full group hover:cursor-pointer"
      onClick={(e) => {
        if (postMode || !context.autoplay) {
          playControl(e);
        }
      }}
    >
      {/* Background Span Image */}
      <div className="absolute z-0 min-w-full min-h-full overflow-hidden  dark:brightness-[0.2] brightness-50 ">
        <Image
          className={"scale-110 blur-md "}
          src={placeholder.url}
          height={vidHeight}
          width={vidWidth}
          alt="placeholder"
          layout="fill"
          unoptimized={true}
          priority={imgFull}
          onError={() => {
            setUseFallback(true);
          }}
        />
      </div>
      {/* Controls */}
      <div className="absolute bottom-0 z-10 flex flex-row min-w-full p-1 text-lightText">
        <button
          onClick={(e) => playControl(e)}
          className={
            (context?.autoplay ? " hidden group-hover:flex " : " flex ") +
            "items-center justify-center w-9 h-9  bg-black rounded-full bg-opacity-20 hover:bg-opacity-40  "
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
        {/* <h1>{timeRemaining}</h1> */}
        {hasAudio && (
          <button
            onClick={(e) => audioControl(e)}
            className="flex items-center justify-center ml-auto bg-black rounded-full w-9 h-9 bg-opacity-20 hover:bg-opacity-40"
          >
            <div className="">
              {muted ? (
                <BiVolumeMute className="flex-none w-4 h-4" />
              ) : (
                <BiVolumeFull className="flex-none w-4 h-4 " />
              )}
            </div>
          </button>
        )}
      </div>

      {/* Video */}
      <div
        className={
          "relative overflow-hidden    "
          //+ (!postMode && videoLoaded && " -mb-1 ") + //there's a margin below the video for some reason
          //postMode && " flex items-center justify-center  "
        }
        // style={imgFull || context?.columnOverride == 1 ? maxHeight : {}}
        style={
          postMode && vidHeight >= vidWidth ? { height: `${vidHeight}px` } : {}
        }
      >
        {((!videoLoaded && (context?.autoPlay || postMode)) || buffering) && (
          <div className="absolute z-10 w-8 h-8 -mt-4 -ml-4 border-b-2 border-gray-200 rounded-full top-1/2 left-1/2 animate-spin"></div>
        )}

        <div
          className={
            `blur-sm ` +
            `${
              videoLoaded
                ? postMode
                  ? " hidden "
                  : " opacity-0 "
                : " opacity-100"
            }` +
            (!videoLoaded && postMode && " absolute")
          }
          style={
            (imgFull || context?.columnOverride == 1) && !videoLoaded
              ? imgheight
              : {}
          }
        >
          <Image
            className={!postMode ? "absolute top-0 left-0" : " "}
            src={placeholder.url}
            height={vidHeight - 5}
            width={vidWidth}
            alt="placeholder"
            unoptimized={true}
            priority={imgFull}
            onError={() => {
              setUseFallback(true);
            }}
          />
        </div>

        <video
          ref={video}
          className={
            (videoLoaded ? "opacity-100" : "opacity-0") +
            (!postMode && " absolute top-0 left-0 ")
          }
          width={`${vidWidth} `}
          height={`${vidHeight} `}
          autoPlay={context?.autoplay || postMode}
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
          onPlay={() => {
            //.log("VIDEO PLAYING");
            //playAll();
          }}
          onPause={() => {
            setVideoPlaying(false);
          }}
          controls={false} //{!context?.autoplay}
          onMouseOver={(event) => {
            handleMouseIn();
          }}
          onMouseOut={(event) => {
            handleMouseOut();
          }}
          onLoadedData={onLoadedData}
          playsInline
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
          muted={!(context?.audioOnHover && postMode)}
          loop={false}
          className="hidden"
          playsInline
          onCanPlay={onAudioLoaded}
          onPlaying={() => setAudioPlaying(true)}
          onPause={() => setAudioPlaying(false)}
          onWaiting={() => setAudioPlaying(false)}
          onError={(err) => null}
          onLoadStart={(e) => (audioRef.current.volume = 0.5)}
        >
          <source data-src={audio} src={audio} type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export default VideoHandler;
