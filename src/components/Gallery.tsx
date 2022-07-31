/* eslint-disable @next/next/no-img-element */
import { Transition } from "@headlessui/react";
import Image from "next/dist/client/image";
import React from "react";
import { useState, useEffect, createRef } from "react";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { isContext } from "vm";
import { findGreatestsImages } from "../../lib/utils";
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
  const [imgRatio, setImgRatio] = useState<{
    url: string;
    height: number;
    width: number;
  }>();
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
    } else if (touchStart - touchEnd < -50) {
      previous(e);
    }
  };

  useEffect(() => {
    let ratio = 1;

    if (images.length > 0) {
      if (maxheight > 0) {
        const {tallest, widest, ratio, fImages} = findGreatestsImages(images, maxheight) 
        setImagesRender(fImages);

        setimgtall(tallest);
        setimgwide(widest);
        setImgRatio(ratio);
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
    "absolute text-white text-xl z-10 bg-black h-10 w-10 rounded-full flex items-center justify-center bg-opacity-50";

  const sliderControl = (isLeft) => (
    <>
      {images.length > 1 && (
        <button
          aria-label="next"
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
          "relative flex flex-row items-center min-w-full justify-center overflow-hidden"
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
        <div>
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
                      : postMode || context.columns == 1 ? ` flex absolute top-0 items-center ` : ' hidden'
                  }`}
                  style={
                    imgRatio?.height && (postMode || context.columns === 1)
                      ? {
                          height: `${Math.min(
                            maxheight,
                            imgRatio?.height *
                              (mediaRef.current.clientWidth / imgRatio.width)
                          )}px`,
                        }
                      : imgtall?.height
                      ? {
                          height: `${
                            mediaRef?.current?.clientWidth && imgwide?.width
                              ? imgtall.height *
                                (mediaRef.current.clientWidth / imgwide.width)
                              : image.height
                          }px`,
                        }
                      : {}
                  }
                >
                  {postMode || context?.columns === 1 ? (
                    <Transition
                      show={i === index}
                      enter="transition ease-in-out duration-200 transform "
                      enterFrom={
                        (index > prevIndex
                          ? "translate-x-full"
                          : "-translate-x-full") + " opacity-0 "
                      }
                      enterTo={(index > prevIndex ? "" : "") + " opacity-100 "}
                      leave="transition ease-in-out duration-200 transform"
                      leaveFrom={""}
                      leaveTo={
                        (index > prevIndex
                          ? "-translate-x-full"
                          : "translate-x-full") + " opacity-0 "
                      }
                    >
                      <Image
                        src={image.url}
                        height={image.height}
                        width={image.width}
                        alt=""
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
                    </Transition>
                  ) : (
                    <Image
                      src={image.url}
                      height={image.height}
                      width={image.width}
                      alt=""
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
                  )}
                  {i === index && image.caption && <div className="absolute bottom-0 left-0 z-20 flex text-sm p-0.5 py-1 bg-black/50 bg-opacity-80 w-full text-white text-left">{image.caption}</div>}
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
