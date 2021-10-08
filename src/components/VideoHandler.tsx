import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useMainContext } from "../MainContext";
import { GrPause, GrPlay, GrVolume, GrVolumeMute } from "react-icons/gr";
import { BsPlay, BsPause, BsVolumeMute, BsVolumeUp } from "react-icons/bs";
const VideoHandler = ({
  placeholder,
  videoInfo,
  maxHeight = {},
  imgFull = false,
  audio,
}) => {
  const context: any = useMainContext();
  const video: any = useRef();
  const audioRef: any = useRef();
  const [hasAudio, sethasAudio] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [prevMuted, setPrevMuted] = useState(true);

  const onLoadedData = () => {
    setVideoLoaded(true);
  };
  const onAudioLoaded = () => {
    sethasAudio(true);
  };

  const [imgheight, setheight] = useState({});
  const [maxheight, setmaxheight] = useState({});
  const [maxheightnum, setmaxheightnum] = useState<Number>();

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
      video?.current?.pause()?.catch((e) => null);
    }
  }, [context.autoplay]);
  useEffect(() => {
    if (hasAudio && audioPlaying && context.pauseAll) {
      //console.log("forcemute");
      pauseAll();
    }
  }, [context.pauseAll]);

  const playControl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    //console.log("playcontrol");
    if (videoLoaded) {
      if ((video?.current?.paused || video?.current?.ended) && !videoPlaying) {
        //console.log("video playing true");

        video?.current
          ?.play()
          .then(setVideoPlaying(true))
          .catch((e) => {
            // console.log(e);
            setVideoPlaying(false);
          });
      } else if (!video?.current?.paused && videoPlaying) {
        setVideoPlaying(false);
        // console.log("video playing false");
        video?.current?.pause();
      }
      if (hasAudio) {
        if (
          (audioRef?.current?.paused || audioRef?.current?.ended) &&
          !audioPlaying
        ) {
          audioRef.current.currentTime = video.current.currentTime;
          audioRef?.current?.play().catch((e) => console.log(e));
        } else if (!audioRef?.current?.paused && audioPlaying) {
          audioRef.current.pause();
        }
      }
    }
  };
  const audioControl = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // console.log("AUDIO CONTROL");
    if (audioRef?.current?.muted !== undefined && hasAudio) {
      if (audioRef.current.muted === true && videoPlaying) {
        audioRef.current.currentTime = video.current.currentTime;
        audioRef?.current?.play().catch((e) => console.log(e));
      }
      audioRef.current.muted = !audioRef.current.muted;
      setMuted((m) => !m);
    }
  };

  const pauseAll = () => {
    // if (!video?.current?.paused && videoPlaying) {
    //   video?.current?.pause();
    // }
    setVideoPlaying(false);
    if (!audioRef?.current?.paused && audioPlaying && hasAudio) {
      audioRef.current.pause();
      if (!audioRef.current.muted) {
        audioRef.current.muted = true;
        setMuted(true);
      }
    }
  };
  const playAll = (override = false) => {
    if ((video?.current?.paused || video?.current?.ended) && !videoPlaying) {
      video?.current?.play().catch((e) => console.log(e));
    }
    if (
      (audioRef?.current?.paused || audioRef?.current?.ended) &&
      !audioPlaying &&
      hasAudio
    ) {
      if (!prevMuted || override) {
        audioRef.current.muted = false;
        setMuted(false);
        setPrevMuted(true);
      }
      audioRef.current.currentTime = video.current.currentTime;
      audioRef?.current?.play().catch((e) => console.log(e));
    }
  };

  const handleMouseOver = () => {
    console.log("mouseover");
    if(videoPlaying ){
      console.log('playaudio');
      playAll(true);
    }
  }
  

  return (
    <div className="relative overflow-hidden group">
      {videoLoaded ? (
        ""
      ) : (
        <div className="absolute z-10 w-16 h-16 -mt-8 -ml-8 border-b-2 border-gray-900 rounded-full top-1/2 left-1/2 animate-spin"></div>
      )}

      <div
        className={`blur-xl ` + `${videoLoaded ? "opacity-0" : "opacity-100"}`}
        style={imgFull && !videoLoaded ? imgheight : {}}
      >
        <Image
          className="absolute top-0 left-0"
          src={placeholder.url}
          height={placeholder.height}
          width={placeholder.width}
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
          " absolute top-0 left-0 "
        }
        style={imgFull ? maxHeight : {}}
        width={`${videoInfo.width} !important`}
        height={`${videoInfo.height} !important`}
        autoPlay={context?.autoplay}
        muted
        loop
        preload={context?.autoplay ? "auto" : "metadata"}
        onWaiting={() => {
          if (!muted) setPrevMuted(false);
          pauseAll();
        }}
        onPlaying={() => {
          setVideoPlaying(true);
          playAll();
        }}
        onPlay={() => {
          //.log("VIDEO PLAYING");
        }}
        onPause={() => {
          setVideoPlaying(false);
        }}
        controls={false} //{!context?.autoplay}
        onLoadedData={onLoadedData}
        playsInline
        //onMouseOver={}
      >
        <source data-src={videoInfo.url} src={videoInfo.url} type="video/mp4" />
      </video>
      <div className="absolute bottom-0 flex flex-row min-w-full p-1 mb-1 text-white ">
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
        onPlay={() => setAudioPlaying(true)}
        onPause={() => setAudioPlaying(false)}
        onError={(err) => null}
      >
        <source data-src={audio} src={audio} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoHandler;
