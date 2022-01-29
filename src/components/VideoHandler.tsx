import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../MainContext";
import { BsPlay, BsPause, BsVolumeMute, BsVolumeUp } from "react-icons/bs";
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
  // const [audioSrc, setaudioSrc] = useState("");
  // const [mounted, setMounted] = useState(false);
  // const [loaded, setLoaded] = useState(false);

  const [hasAudio, sethasAudio] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [manualPlay, setmanualPlay] = useState(false);
  const [muted, setMuted] = useState(true);
  const [prevMuted, setPrevMuted] = useState(true);
  const [manualAudio, setManualAudio] = useState(false);

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
  const playControl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    //only allow play if video loaded
    if (videoLoaded) {
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
      if (!context.autoplay) playVideo();

      //unmute play audio if allowed and video playing
      if (context.audioOnHover || !muted) {
        audioRef.current.muted = false;
        setMuted(false);
        playAudio();
      }
    }
  };

  const handleMouseOut = () => {
    //not in manual play, then pause audio and video
    if (!manualPlay && !context.autoplay) {
      pauseAudio();
      pauseVideo();
    }

    //also mute if not manually unmuted manipulation
    if (!manualAudio) {
      setMuted(true);
      audioRef.current.muted = true;
    }
  };

  return (
    <div
      className={
        "relative overflow-hidden group  " +
        (postMode && " flex items-center justify-center  ")
      }
      // style={imgFull || context?.columnOverride == 1 ? maxHeight : {}}
      style={postMode ? { height: `${vidHeight}px` } : {}}
    >
      {videoLoaded ? (
        ""
      ) : (
        <div className="absolute z-10 w-16 h-16 -mt-8 -ml-8 border-b-2 border-gray-900 rounded-full top-1/2 left-1/2 animate-spin"></div>
      )}

      <div
        className={
          `blur-xl ` +
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
          height={vidHeight}
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
        width={`${vidWidth} !important`}
        height={`${vidHeight} !important`}
        autoPlay={context?.autoplay}
        muted
        loop
        preload={context?.autoplay ? "auto" : "metadata"}
        onWaiting={() => {
          if (!muted) setPrevMuted(false);
          //pauseAll();
          setVideoPlaying(false);
          pauseAudio();
        }}
        onPlaying={() => {
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
        <source data-src={videoInfo.url} src={videoInfo.url} type="video/mp4" />
      </video>
      <div className="absolute bottom-0 flex flex-row min-w-full p-1 mb-1 text-lightText ">
        <button
          onClick={(e) => playControl(e)}
          className={
            (context?.autoplay ? " hidden group-hover:flex " : " flex ") +
            "items-center justify-center w-8 h-8 rounded opacity-100 "
          }
        >
          <div className="">
            {videoPlaying ? (
              <BsPause className="flex-none w-8 h-8 filter drop-shadow-lg" />
            ) : (
              <BsPlay className="flex-none w-8 h-8 filter drop-shadow-lg" />
            )}
          </div>
        </button>
        {hasAudio && (
          <>
            <button
              onClick={(e) => audioControl(e)}
              className="flex items-center justify-center w-8 h-8 ml-auto "
            >
              <div className="filter drop-shadow-lg">
                {muted ? (
                  <BsVolumeMute className="w-8 h-8 " />
                ) : (
                  <BsVolumeUp className="w-8 h-8 " />
                )}
              </div>
            </button>
          </>
        )}
      </div>

      <video
        autoPlay={false}
        controls={false}
        ref={audioRef}
        muted
        loop={false}
        className="hidden"
        playsInline
        onCanPlay={onAudioLoaded}
        onPlaying={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onWaiting={() => setAudioPlaying(false)}
        onError={(err) => null}
      >
        <source data-src={audio} src={audio} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoHandler;
