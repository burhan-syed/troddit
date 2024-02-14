/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import Carousel from "nuka-carousel";
import Image from "next/legacy/image";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const GalleryCarousel = ({
  media,
  height,
  objectFit,
  layout = "fill",
  mediaMode = false,
  checkCardHeight,
}: {
  media: any[];
  height?: number;
  layout: "fill" | "intrinsic";
  objectFit?: "cover" | "contain";
  mediaMode?: boolean;
  checkCardHeight?: () => void;
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hideArrows, setHideArrows] = useState(0);
  useEffect(() => {
    let interval;
    if (hideArrows) {
      interval = setTimeout(() => setHideArrows(0), 2000);
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [hideArrows]);
  useEffect(() => {
    height && checkCardHeight && checkCardHeight();
  }, [height, checkCardHeight]);

  const arrowStyle = mediaMode
    ? "absolute text-white z-10 bg-black/40 backdrop-blur-lg h-10 w-10 rounded-full flex items-center justify-center md:h-12 md:w-12 md:border md:border-transparent md:hover:border-th-accent md:rounded-md "
    : `absolute text-white text-xl z-10 bg-black h-8 w-8 rounded-full flex items-center justify-center bg-opacity-50 backdrop-blur-lg`;

  return (
    <>
      <Carousel
        speed={200}
        onDragStart={() => {
          setAnimate(true);
        }}
        onDragEnd={() => {
          setHideArrows((p) => (p += 1));
        }}
        wrapAround={true}
        disableAnimation={!animate}
        swiping={true}
        disableEdgeSwiping={true}
        dragThreshold={0.2}
        dragging={false}
        afterSlide={(index) => setSlideIndex(index)}
        defaultControlsConfig={{
          nextButtonClassName: "hidden",
          prevButtonClassName: "hidden",
          pagingDotsClassName: "hidden",
          pagingDotsContainerClassName: "hidden",
          pagingDotsOnClick: () => {},
        }}
        renderTopCenterControls={({ currentSlide }) => (
          <div
            className={
              (media.length < 2 ? "hidden " : "") +
              " z-10  md:p-2 text-white text-[10px] md:text-xs bg-black bg-opacity-50 rounded-lg backdrop-blur-lg " +
              (mediaMode
                ? "fixed bottom-[32.5rem] right-1.5 p-2 md:top-6 md:bottom-auto md:right-24  "
                : " absolute top-2 right-2 p-1 ")
            }
          >
            <span>{currentSlide + 1 + "/" + media.length}</span>
          </div>
        )}
        renderCenterLeftControls={({ previousDisabled, previousSlide }) => (
          <button
            disabled={previousDisabled || !!hideArrows}
            aria-label="next"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAnimate(true);
              previousSlide();
            }}
            className={`
            ${media.length < 2 ? "hidden" : ""} 
            ${arrowStyle} ${
              mediaMode
                ? "bottom-[29rem] right-1.5 md:bottom-1/2  md:left-1.5 md:right-auto"
                : "left-2 -translate-y-1/2"
            } ${
              previousDisabled || hideArrows ? " opacity-0 " : ""
            } transition-opacity ease-out duration-400 `}
          >
            <span role="img" aria-label={`Arrow left`}>
              <AiOutlineLeft
                className={
                  mediaMode ? "md:w-6 md:h-6" : " w-3 h-3 md:w-4 md:h-4 "
                }
              />
            </span>
          </button>
        )}
        renderCenterRightControls={({ nextDisabled, nextSlide }) => (
          <button
            disabled={nextDisabled || !!hideArrows}
            aria-label="next"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAnimate(true);
              nextSlide();
            }}
            className={`
            ${media.length < 2 ? "hidden" : ""} 
            ${arrowStyle} ${
              mediaMode
                ? "bottom-[25.5rem] right-1.5 md:bottom-1/2 md:right-1.5 "
                : "right-2 -translate-y-1/2"
            } ${
              nextDisabled || hideArrows ? " opacity-0 " : " "
            } transition-opacity ease-out duration-400`}
          >
            <span role="img" aria-label={`Arrow right`}>
              <AiOutlineRight
                className={
                  mediaMode ? "md:w-6 md:h-6" : " w-3 h-3 md:w-4 md:h-4 "
                }
              />
            </span>
          </button>
        )}
        className="h-full min-h-full"
      >
        {media?.map((image, i) => (
          <div
            style={
              mediaMode
                ? { height: "100vh", minHeight: "100vh", maxHeight: "100vh" }
                : {
                    height: `${height}px`,
                  }
            }
            className={"flex items-center justify-center relative  "}
            key={image.src}
          >
            {Math.abs(i - slideIndex) < 2 ? (
              <>
                <Image
                  src={image.src}
                  height={image.height}
                  width={image.width}
                  alt=""
                  layout={layout}
                  objectFit={objectFit}
                  priority={true}
                  unoptimized={true}
                  className={""}
                ></Image>
                {i === slideIndex && image.caption && (
                  <div className="absolute bottom-0 left-0 z-20 flex text-sm p-0.5 py-1 bg-black/50 bg-opacity-80 w-full text-white text-left">
                    {image.caption}
                  </div>
                )}
                <div
                  style={
                    mediaMode
                      ? {
                          backgroundImage: `url(${image.src})`,
                          height: "100vh",
                          width: "100vw",
                          minHeight: "100vh",
                          maxHeight: "100vh",
                        }
                      : {
                          height: `${height}px`,
                          //width: `${(height/image.height)*image.width}px`,
                          backgroundImage: `url(${image.src})`,
                        }
                  }
                  className="absolute inset-0 w-full brightness-[0.2] -z-10 bg-center bg-no-repeat bg-cover blur-md "
                ></div>
              </>
            ) : (
              <></>
            )}
          </div>
        ))}
      </Carousel>
    </>
  );
};

export default GalleryCarousel;
