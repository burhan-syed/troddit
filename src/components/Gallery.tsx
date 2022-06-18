/* eslint-disable @next/next/no-img-element */
import { Transition } from "@headlessui/react";
import Image from "next/dist/client/image";
import { useState, useEffect, createRef } from "react";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { isContext } from "vm";
import { useMainContext } from "../MainContext";

const Gallery = ({
  images,
  maxheight = 0,
  postMode,
  mediaRef,
  uniformHeight = false,
}) => {
  const context: any = useMainContext();
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [imgtall, setimgtall] = useState<{
    url: string;
    height: number;
    width: number;
  }>();
  const [imgwide, setimgwide] = useState<{
    url: string;
    height: number;
    width: number;
  }>();
  const [imagesRender, setImagesRender] = useState(images);
  const [prevIndex, setPrevIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStart - touchEnd > 50) {
      advance(e);
      //console.log("right");
    } else if (touchStart - touchEnd < -50) {
      previous(e);
      //console.log("left");
    }
  };

  useEffect(() => {
    let ratio = 1;
    let tallest = images[0];
    let widest = images[0];
    if (images.length > 0) {
      if (maxheight > 0) {
        let newimages = [];
        images.forEach((img, i) => {
          if (img.height > maxheight) {
            ratio = maxheight / img.height;
            newimages.push({
              url: img.url,
              height: Math.floor(img.height * ratio),
              width: Math.floor(img.width * ratio),
            });
          } else {
            newimages.push({
              url: img.url,
              height: img.height,
              width: img.width,
            });
          }
          if (images[i].height > images?.[tallest]?.height) {
            tallest = images[i];
          }
          if (images[i].width > images?.[widest]?.width) {
            widest = images[i];
          }
        });
        setImagesRender(newimages);
        setimgtall(tallest);
        setimgwide(widest);
      } else {
        setImagesRender(images);
      }
    }
    setLoaded(true);
    return () => {
      setIndex(0);
      setLoaded(false);
    };
  }, [images, maxheight]);

  const advance = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (index < images.length - 1) {
      setPrevIndex(index);
      setIndex(index + 1);
    }
  };
  const previous = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (index > 0) {
      setPrevIndex(index);
      setIndex(index - 1);
    }
  };

  // Tailwind styles. Most importantly notice position absolute, this will sit relative to the carousel's outer div.
  const arrowStyle =
    "absolute text-lightText text-xl z-10 bg-black h-10 w-10 rounded-full flex items-center justify-center bg-opacity-50";

  const sliderControl = (isLeft) => (
    <>
      {images.length > 1 && (
        <button
          type="button"
          onClick={isLeft ? previous : advance}
          className={`${arrowStyle} ${isLeft ? "left-2" : "right-2"} ${
            isLeft && index === 0 && "hidden"
          } ${!isLeft && index === images.length - 1 && "hidden"}`}
          // style={{ top: '40%' }}
        >
          <span role="img" aria-label={`Arrow ${isLeft ? "left" : "right"}`}>
            {isLeft ? <AiOutlineLeft /> : <AiOutlineRight />}
          </span>
        </button>
      )}
    </>
  );

  if (loaded) {
    return (
      <div
        className={
          "relative flex flex-row items-center min-w-full justify-center"
        }
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => handleTouchMove(e)}
        onTouchEnd={(e) => handleTouchEnd(e)}
      >
        {/* <button className={index === 0 ? "opacity-0" : ""} onClick={(e) => previous(e)}>
          {"<"}
        </button> */}
        {images.length > 1 && (
          <div className="absolute z-10 p-2 text-white bg-black bg-opacity-50 rounded-lg top-2 right-2">
            <h1>{index + 1 + "/" + images.length}</h1>
          </div>
        )}

        {sliderControl(true)}
        <div className="">
          {imagesRender.map((image, i) => {
            if (i < index + 3 || i > index - 3) {
              return (
                <div
                  key={image.url}
                  className={`${
                    i === index
                      ? postMode || context.columns == 1
                        ? " flex items-center "
                        : " block "
                      : " hidden "
                  }`}
                  style={
                    uniformHeight && imgtall 
                      ? postMode || context.columns == 1
                        ? {
                            height: `${
                              maxheight >
                              imgtall.height *
                                ((mediaRef?.current?.clientWidth ??
                                  imgtall.width) /
                                  imgtall.width)
                                ? imgtall.height *
                                  ((mediaRef?.current?.clientWidth ??
                                    imgtall.width) /
                                    imgtall.width)
                                : maxheight
                            }px`,
                          }
                        : {
                            height: `${
                              (mediaRef?.current?.clientWidth && imgwide?.width)
                                ? imgtall.height *
                                  (mediaRef.current.clientWidth / imgwide.width)
                                : image.height
                            }px`,
                          }
                      : {}
                  }
                >
                  {/* <Transition
                   show={i === index}
                   enter="transition ease-in-out duration-300 transform"
                   enterFrom={index > prevIndex ? "translate-x-full" : "-translate-x-full"}
                   enterTo={index > prevIndex ? "translate-x-0" : ""}
                   leave="transition ease-in-out duration-300 transform"
                   leaveFrom={"translate-x-0"}
                   leaveTo={"translate-x-full"}
                  > */}
                  <Image
                    src={image.url}
                    height={image.height}
                    width={image.width}
                    alt=""
                    //layout={image.url === "spoiler" ? "fill" : "intrinsic"}
                    layout={
                      image.url === "spoiler" ||
                      (!postMode && context.columns !== 1)
                        ? "fill"
                        : "intrinsic"
                    }
                    objectFit="cover"
                    priority={true}
                    unoptimized={true}
                  ></Image>
                  {/* </Transition> */}
                </div>
              );
            }
          })}
        </div>
        {sliderControl(false)}
      </div>
    );
  } else return <div>loading gallery</div>;
};

export default Gallery;
