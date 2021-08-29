import Image from "next/image";
import { useState, useEffect } from "react";

const ImageHandler = ({ placeholder, imageInfo }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  const onLoadedData = () => {
    console.log("loaded");
    setImageLoaded(true);
  };
  return (
    <div className="">
      {/* <div className="absolute top-0 left-0">
        <Image
          // className={`${
          //   videoLoaded ? "opacity-100" : "opacity-0"
          // }  h-full w-full`}
          className={(imageLoaded ? "opacity-0" : "opacity-100") + "blur-3xl"}
          src={placeholder.url}
          height={imageInfo.height}
          width={imageInfo.width}
          alt="placeholder"
          onError={() => {
            console.log("ERR: ", placeholder, imageInfo);
            setUseFallback(true);
          }}
        />
      </div> */}
      <Image
        // className="object-cover"
        // className={videoLoaded ? "opacity-0" : "opacity-100"}
        src={imageInfo.url}
        width={imageInfo.width}
        height={imageInfo.height}
        alt="image"
        onLoadedData={onLoadedData}
        onLoad={(e) => {
          onLoadedData;
        }}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKF5YDwADJAGVKdervwAAAABJRU5ErkJggg=="
      />
    </div>
  );
};

export default ImageHandler;
