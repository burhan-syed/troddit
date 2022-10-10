/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import Carousel from "nuka-carousel";
import Image from "next/dist/client/image";
import { AiOutlineLeft, AiOutlineRight } from "react-icons/ai";

const GalleryCarousel = ({
  media,
  height,
  layout,
  mediaMode = false,
}: {
  media: any;
  height?: number;
  layout?: "fixed" | "fill" | "intrinsic" | "responsive" | undefined;
  mediaMode?: boolean;
}) => {
  const [slideIndex, setSlideIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const arrowStyle = mediaMode
    ? "absolute text-white z-10 bg-black/40 backdrop-blur-lg h-10 w-10 rounded-full flex items-center justify-center md:h-12 md:w-12 md:border md:border-transparent md:hover:border-th-accent md:rounded-md "
    : `absolute text-white text-xl z-10 bg-black h-10 w-10 rounded-full flex items-center justify-center bg-opacity-50 backdrop-blur-lg`;

  return (
    <>
      <Carousel
        speed={200}
        onDragStart={() => setAnimate(true)}
        //disableAnimation={!animate}
        swiping={mediaMode === true ? false : true}
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
              " z-10 p-2 text-white bg-black bg-opacity-50 rounded-lg backdrop-blur-lg " +
              (mediaMode
                ? "fixed bottom-[32.5rem] right-1.5 md:top-5 md:bottom-auto md:right-24  "
                : " absolute top-2 right-2 ")
            }
          >
            <span>{currentSlide + 1 + "/" + media.length}</span>
          </div>
        )}
        renderCenterLeftControls={({ previousDisabled, previousSlide }) => (
          <button
            disabled={previousDisabled}
            aria-label="next"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAnimate(false);
              previousSlide();
            }}
            className={`${arrowStyle} ${
              mediaMode
                ? "bottom-[29rem] right-1.5 md:bottom-1/2  md:left-1 md:right-auto"
                : "left-2 -translate-y-1/2"
            } ${previousDisabled ? " hidden " : ""} `}
          >
            <span role="img" aria-label={`Arrow left`}>
              <AiOutlineLeft className={mediaMode ? "md:w-6 md:h-6" : ""} />
            </span>
          </button>
        )}
        renderCenterRightControls={({ nextDisabled, nextSlide }) => (
          <button
            disabled={nextDisabled}
            aria-label="next"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setAnimate(false);
              nextSlide();
            }}
            className={`${arrowStyle} ${
              mediaMode
                ? "bottom-[25.5rem] right-1.5 md:bottom-1/2 md:right-1 "
                : "right-2 -translate-y-1/2"
            } ${nextDisabled ? " hidden " : ""} `}
          >
            <span role="img" aria-label={`Arrow right`}>
              <AiOutlineRight className={mediaMode ? "md:w-6 md:h-6" : ""} />
            </span>
          </button>
        )}
        className="h-full min-h-full"
      >
        {media.map((image, i) => (
          <div
            style={
              mediaMode
                ? { height: "100vh", minHeight: "100vh", maxHeight: "100vh" }
                : {
                    height: `${height}px`,
                  }
            }
            className={"flex items-center justify-center relative  "}
            key={image.url}
          >
            {Math.abs(i - slideIndex) < 2 ? (
              <>
                <Image
                  src={image.url}
                  height={image.height}
                  width={image.width}
                  alt=""
                  layout={"intrinsic"}
                  objectFit="cover"
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
                          backgroundImage: `url(${image.url})`,
                          height: "100vh",
                          width: "100vw",
                          minHeight: "100vh",
                          maxHeight: "100vh",
                        }
                      : {
                          height: `${height}px`,
                          aspectRatio: `${Math.round(
                            image.width
                          )} / ${Math.round(image.height)}`,
                          //width: `${(height/image.height)*image.width}px`,
                          backgroundImage: `url(${image.url})`,
                        }
                  }
                  className="absolute inset-0 brightness-[0.2] -z-10 bg-center bg-no-repeat bg-cover blur-md scale-110 "
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
