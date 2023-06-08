/* eslint-disable @next/next/no-img-element */
import { Transition } from "@headlessui/react";
import Image from "next/legacy/image";
import React from "react";
import { useState, useEffect, createRef } from "react";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { isContext } from "vm";
import { findGreatestsImages } from "../../lib/utils";
import { useMainContext } from "../MainContext";
import GalleryCarousel from "./GalleryCarousel";
import { GalleryInfo } from "../../types";

const Gallery = ({
  images,
  columns,
  maxheight = 0,
  postMode,
  mediaMode,
  mediaRef,
  isXPost = false,
  fillHeight = false,
  checkCardHeight,
  containerDims = [0, 0],
}: {
  images?: GalleryInfo[];
  columns?: number;
  maxheight?: number;
  postMode?: boolean;
  mediaMode?: boolean;
  isXPost?: boolean;
  fillHeight?: boolean;
  mediaRef?: React.RefObject<HTMLDivElement>;
  checkCardHeight?: () => void;
  containerDims?: [number, number];
}) => {
  const context: any = useMainContext();
  // const [loaded, setLoaded] = useState(false);
  // const [index, setIndex] = useState(0);
  const [imgRatio, setImgRatio] = useState<{
    src: string;
    height: number;
    width: number;
  }>();
  const [imgtall, setimgtall] = useState<{
    src: string;
    height: number;
    width: number;
  }>();
  const [imgwide, setimgwide] = useState<{
    src: string;
    height: number;
    width: number;
  }>();
  const [imagesRender, setImagesRender] =
    useState<
      { src: string; height: number; width: number; caption?: string }[]
    >();

  useEffect(() => {
    let ratio = 1;

    if (images && images?.length > 0) {
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
        setImagesRender(
          images.map((i) => ({
            src: i.media?.[0]?.src,
            height: i.media?.[0]?.height,
            width: i.media?.[0]?.width,
            caption: i.caption,
          }))
        );
      }
    }
    //setLoaded(true);
    return () => {
      //setIndex(0);
      //setLoaded(false);
    };
  }, [images, maxheight]);
  if (!imagesRender) {
    return <></>;
  }
  return (
    <div
      className={
        containerDims
          ? "relative"
          : (fillHeight ? "min-h-full " : "") +
            (mediaMode && postMode ? " h-screen min-h-full " : " ")
      }
      style={
        containerDims?.[1]
          ? {
              width: `${containerDims?.[0]}px`,
              height: `${containerDims?.[1]}px`,
            }
          : {}
      }
    >
      <GalleryCarousel
        media={imagesRender}
        mediaMode={mediaMode}
        objectFit={postMode || columns === 1 ? "contain" : "cover"}
        layout={isXPost ? "intrinsic" : "fill"}
        checkCardHeight={checkCardHeight}
        height={
          (containerDims?.[1]
            ? containerDims[1]
            : mediaMode
            ? undefined
            : fillHeight && mediaRef?.current?.clientWidth
            ? (mediaRef?.current?.clientWidth / 9) * 16
            : imgRatio?.height && mediaRef?.current
            ? Math.min(
                maxheight,
                imgRatio?.height *
                  (mediaRef?.current?.clientWidth / imgRatio.width)
              )
            : imgRatio?.height) ?? 0
        }
      />
    </div>
  );
};

export default Gallery;
