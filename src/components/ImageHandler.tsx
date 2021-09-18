import Image from "next/image";
import { useState, useEffect } from "react";

const ImageHandler = ({ placeholder, imageInfo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const onLoadedData = () => {
    //console.log("loaded");
    setImageLoaded(true);
  };
  return (
    <div className="relative">
      <div className="absolute top-0 left-0 blur">
        <Image
          // className={`${
          //   videoLoaded ? "opacity-100" : "opacity-0"
          // }  h-full w-full`}
          className={(imageLoaded ? "opacity-0" : "opacity-100") + "blur-3xl"}
          src={placeholder.url}
          height={imageInfo.height}
          width={imageInfo.width}
          alt="placeholder"
          unoptimized={true}
          onError={() => {
            //console.log("ERR: ", placeholder, imageInfo);
            setUseFallback(true);
          }}
        />
      </div>
      {imageLoaded ? (
        ""
      ) : (
        <div className="absolute w-16 h-16 border-b-2 border-gray-900 rounded-full left-1/2 animate-spin top-1/2"></div>
      )}

      <Image
        // className="object-cover"
        // className={videoLoaded ? "opacity-0" : "opacity-100"}
        src={imageInfo.url}
        width={imageInfo.width}
        height={imageInfo.height}
        alt="image"
        onLoadedData={onLoadedData}
        unoptimized={true}
        onLoad={(e) => {
          onLoadedData;
        }}
        // placeholder="blur"
        // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKF5YDwADJAGVKdervwAAAABJRU5ErkJggg=="
      />
    </div>
  );
};

export default ImageHandler;
