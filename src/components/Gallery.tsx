/* eslint-disable @next/next/no-img-element */
import { Transition } from "@headlessui/react";
import Image from "next/dist/client/image";
import React from "react";
import { useState, useEffect, createRef } from "react";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { isContext } from "vm";
import { findGreatestsImages } from "../../lib/utils";
import { useMainContext } from "../MainContext";
import GalleryCarousel from "./GalleryCarousel";

const Gallery = ({
  images,
  maxheight = 0,
  postMode,
  mediaMode,
  mediaRef,
  uniformHeight = false,
  fillHeight = false,
}) => {
  const context: any = useMainContext();
  // const [loaded, setLoaded] = useState(false);
  // const [index, setIndex] = useState(0);
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

  useEffect(() => {
    let ratio = 1;

    if (images.length > 0) {
      if (maxheight > 0) {
        const { tallest, widest, ratio, fImages } = findGreatestsImages(
          images,
          maxheight
        );
        setImagesRender(fImages);

        setimgtall(tallest);
        setimgwide(widest);
        setImgRatio(ratio);
      } else {
        setImagesRender(images);
      }
    }
    //setLoaded(true);
    return () => {
      //setIndex(0);
      //setLoaded(false);
    };
  }, [images, maxheight]);

  return (
    <div
      className={
        (fillHeight ? "min-h-full" : "") +
        (mediaMode && postMode ? " h-screen min-h-full " : " ")
      }
    >
      <GalleryCarousel
        media={imagesRender}
        mediaMode={mediaMode}
        objectFit={postMode || context.columns === 1 ? "contain" : "cover"}
        layout={"fill"}
        height={
          mediaMode
            ? undefined
            : fillHeight && mediaRef?.current?.clientWidth
            ? (mediaRef?.current?.clientWidth / 9) * 16
            : imgRatio?.height && (postMode || context.columns === 1)
            ? Math.min(
                maxheight,
                imgRatio?.height *
                  (mediaRef.current.clientWidth / imgRatio.width)
              )
            : mediaRef?.current?.clientWidth &&
              imgwide?.width &&
              imgtall?.height
            ? imgtall.height * (mediaRef.current.clientWidth / imgwide.width)
            : undefined
        }
      />
    </div>
  );
};

export default Gallery;
