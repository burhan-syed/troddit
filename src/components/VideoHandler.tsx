import Image from "next/image";
import { useState, useEffect } from "react";

const VideoHandler = ({ placeholder, videoInfo }) => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const onLoadedData = () => {
    setVideoLoaded(true);
  };
  return (
    <div className="relative overflow-hidden ">
      {videoLoaded ? "" : <div className="absolute z-50 w-16 h-16 -mt-8 -ml-8 border-b-2 border-gray-900 rounded-full top-1/2 left-1/2 animate-spin"></div>}

      <div
        className={`blur-xl ` + `${videoLoaded ? "opacity-0" : "opacity-100"}`}
      >
        <Image
          // className={`${
          //   videoLoaded ? "opacity-100" : "opacity-0"
          // }  h-full w-full`}
          className="absolute top-0 left-0"
          src={placeholder.url}
          height={placeholder.height}
          width={placeholder.width}
          alt="placeholder"
          // placeholder="blur"
          // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8FQDwAEnQGIVO32RQAAAABJRU5ErkJggg=="
          onError={() => {
            console.log("ERR: ", placeholder, videoInfo);
            setUseFallback(true);
          }}
        />
      </div>

      <video
        // className="object-cover"
        // className={videoLoaded ? "opacity-0" : "opacity-100"}
        className="absolute top-0 left-0"
        width={`${videoInfo.width} !important`}
        height={`${videoInfo.height} !important`}
        autoPlay={true}
        muted
        loop
        // preload="metadata"
        onLoadedData={onLoadedData}
        // poster={imageInfo.url}
        playsInline
      >
        <source data-src={videoInfo.url} src={videoInfo.url} type="video/mp4" />
      </video>
    </div>
  );
};

export default VideoHandler;
