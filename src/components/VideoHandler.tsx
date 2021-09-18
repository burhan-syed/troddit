import Image from "next/image";
import { useState, useEffect } from "react";
import { useMainContext } from "../MainContext";

const VideoHandler = ({
  placeholder,
  videoInfo,
  maxHeight = {},
  imgFull = false,
}) => {
  const context: any = useMainContext();

  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const onLoadedData = () => {
    setVideoLoaded(true);
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

  return (
    <div className="relative overflow-hidden">
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
        className={
          (videoLoaded ? "opacity-100" : "opacity-0") + " absolute top-0 left-0"
        }
        style={imgFull ? maxHeight : {}}
        width={`${videoInfo.width} !important`}
        height={`${videoInfo.height} !important`}
        autoPlay={context?.autoplay}
        muted
        loop
        preload={context?.autoplay ? "auto" : "metadata"}
        controls={!context?.autoplay}
        onLoadedData={onLoadedData}
        playsInline
      >
        <source data-src={videoInfo.url} src={videoInfo.url} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoHandler;
