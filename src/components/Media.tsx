/* eslint-disable @next/next/no-img-element */
import Image from "next/legacy/image";
import Gallery from "./Gallery";
import VideoHandler from "./media/video/VideoHandler";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useMainContext } from "../MainContext";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { useTheme } from "next-themes";
import { useWindowSize, useWindowWidth } from "@react-hook/window-size";
import {
  checkImageInCache,
  findMediaInfo,
  findOptimalImageIndex,
} from "../../lib/utils";
import { AiOutlineTwitter } from "react-icons/ai";
import { ImEmbed } from "react-icons/im";
import { BsBoxArrowInUpRight } from "react-icons/bs";
import { BiExpand } from "react-icons/bi";
import ExternalLink from "./ui/ExternalLink";
import { GalleryInfo } from "../../types";
import LoaderPuff from "./ui/LoaderPuff";
import { logApiRequest } from "../RedditAPI";
const scrollStyle =
  " scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full ";

const Media = ({
  post,
  columns,
  cardStyle = undefined as undefined | "card1" | "card2" | "row1" | "default",
  curPostName = undefined,
  handleClick = (a: any, b: any) => {},
  imgFull = false,
  forceMute = 0,
  portraitMode = false,
  fullMediaMode = false,
  postMode = false,
  read = false,
  card = false,
  hide = false,
  fullRes = false,
  xPostMode = false,
  containerDims = undefined as undefined | [number, number],
  mediaDimensions = [0, 0] as undefined | [number, number],
  uniformMediaMode = false,
  inView = true,
  fill = false,
  checkCardHeight = () => {},
}) => {
  const context: any = useMainContext();
  const windowWidth = useWindowWidth();
  const [windowHeight, setWindowHeight] = useState(0);
  useEffect(() => {
    setWindowHeight(window.outerHeight);
    //don't monitor resize
    // const onResize = () => {
    //   setWindowHeight(window.outerHeight);
    // };
    // window.addEventListener("resize", onResize);
    // return () => {
    //   window.removeEventListener("resize", onResize);
    // };
  }, []);
  const mediaRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme } = useTheme();
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState<GalleryInfo[]>();
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [isTweet, setIsTweet] = useState(false);
  const [imageInfo, setImageInfo] = useState({ src: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({
    hlsSrc: "",
    src: "",
    height: 0,
    width: 0,
    hasAudio: false,
  });
  const [placeholderInfo, setPlaceholderInfo] = useState({
    src: "",
    height: 0,
    width: 0,
  });

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const onLoaded = () => {
    setMediaLoaded(true);
    checkCardHeight && checkCardHeight();
  };

  const [allowIFrame, setAllowIFrame] = useState<boolean>(() => !!postMode);
  const [isIFrame, setIsIFrame] = useState(false);
  const [iFrame, setIFrame] = useState<Element>();
  const [isYTVid, setisYTVid] = useState(false);

  useEffect(() => {
    //
    return () => {
      setIsIFrame(false);
      setIFrame(undefined);
    };
  }, [post]);

  useEffect(() => {
    if (
      (postMode || columns === 1 || context.embedsEverywhere) &&
      !context.disableEmbeds &&
      !uniformMediaMode
    ) {
      setAllowIFrame(true);
    } else {
      setAllowIFrame(false);
    }
    // return () => {
    //   setAllowIFrame(false);
    // }
  }, [
    postMode,
    columns,
    context.disableEmbeds,
    context.embedsEverywhere,
    uniformMediaMode,
  ]);

  useEffect(() => {
    const DOMAIN = window?.location?.hostname ?? "www.troddit.com";
    const shouldLoad = () => {
      if (!post) return false;
      if (!post.url) return false;
      if (!post.title) return false;
      if (!post.subreddit) return false;
      return true;
    };

    const initialize = async () => {
      if (!post?.["mediaInfo"]) {
        let m = await findMediaInfo(post, false, DOMAIN);
        post["mediaInfo"] = m;
      }
      let a, b, c;
      if (
        post["mediaInfo"].isVideo &&
        !(uniformMediaMode && columns > 1 && windowWidth < 640) //dont load videos on small devices with multiple columns
      ) {
        b = await findVideo();
        if (b && !context.preferEmbeds) {
          setAllowIFrame(false);
        }
      }
      if (post["mediaInfo"].isIframe && !uniformMediaMode) {
        c = await findIframe();
      }
      if (!b) {
        a = await findImage();
        if (
          a &&
          !context.preferEmbeds &&
          context.autoPlayMode &&
          fullMediaMode
        ) {
          setAllowIFrame(false);
        }
      }
      a || b || c || post?.selftext_html ? setLoaded(true) : setLoaded(false);
    };

    const checkURL = (url) => {
      const placeholder =
        "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"; //"http://goo.gl/ijai22";
      //if (!url) return placeholder;
      if (!url?.includes("http")) return placeholder;
      return url;
    };

    const findVideo = async () => {
      let optimize = "720";
      let src = "";
      if (!imgFull) {
        if (fullMediaMode) {
          if (!context.highRes && windowWidth < 640) {
            optimize = "480";
          }
        } else if (postMode) {
          optimize = "720";
        } else if (columns > 1 && windowWidth < 640) {
          optimize = "360";
        } else if (columns >= 3 && columns < 5) {
          optimize = "480";
        } else if (columns === 2) {
          optimize = "480"; //"1080";
        } else if (columns === 5) {
          optimize = "360";
        } else if (columns > 5) {
          optimize = "360";
        } else if (windowWidth < 640) {
          optimize = "480";
        }
      }

      if (post?.mediaInfo?.videoInfo) {
        src = post.mediaInfo.videoInfo?.[0]?.src;
        if (src?.includes("DASH_1080") && !imgFull) {
          src = src.replace("DASH_1080", `DASH_${optimize}`);
        }
        if (src?.includes("DASH_720") && !imgFull) {
          src = src.replace("DASH_720", `DASH_${optimize}`);
        }
        if (post?.mediaInfo?.videoInfo?.[1]?.src && optimize !== "720") {
          src = post.mediaInfo.videoInfo?.[1]?.src;
        }
        setVideoInfo({
          src: src,
          hlsSrc: post.mediaInfo.videoInfo[0]?.hlsSrc,
          height: post.mediaInfo.videoInfo[0].height,
          width: post.mediaInfo.videoInfo[0].width,
          hasAudio: post.mediaInfo.videoInfo[0]?.hasAudio,
        });
        setPlaceholderInfo({
          src: checkURL(post?.thumbnail),
          height: post.mediaInfo.videoInfo[0].height,
          width: post.mediaInfo.videoInfo[0].width,
        });
        await findImage();
        setIsMP4(true);
        setIsImage(false);
        return true;
      }
      return false;
    };

    const stringToHTML = function (str) {
      let parser = new DOMParser();
      let doc = parser.parseFromString(str, "text/html");
      return doc.body.firstElementChild;
    };

    const findIframe = async () => {
      if (post?.mediaInfo?.iFrameHTML) {
        if (post?.mediaInfo?.iFrameHTML?.src?.includes("youtube.com")) {
          setisYTVid(true);
        }
        setIFrame(post.mediaInfo.iFrameHTML);
        setIsIFrame(true);
        return true;
      } else {
        return false;
      }
    };

    const findImage = async () => {
      if (post?.mediaInfo?.isTweet) {
        setIsTweet(true);
        setIsIFrame(true);
        //return true;
      }

      if (post?.mediaInfo?.isGallery) {
        setGalleryInfo(post.mediaInfo.galleryInfo);
        post.mediaInfo.galleryInfo.forEach((img) => {
          img.media?.[0]?.src &&
            checkImageInCache(img.media?.[0]?.src, (isCached) => {
              if (!isCached) {
                logApiRequest("media");
              }
            });
        });
        setIsGallery(true);
        return true;
      } else if (
        (post?.mediaInfo?.isVideo ||
          post?.mediaInfo?.isImage ||
          post?.mediaInfo?.isTweet ||
          post?.mediaInfo?.isLink) &&
        post?.mediaInfo?.imageInfo
      ) {
        let num = findOptimalImageIndex(post.mediaInfo.imageInfo, {
          windowWidth,
          fullRes: fullRes || context.highRes,
          containerDims,
          context: {
            cardStyle: cardStyle,
            columns: columns,
            saveWideUI: context.saveWideUI,
          },
          postMode,
        });

        let imgheight = post.mediaInfo.imageInfo[num].height;
        let imgwidth = post.mediaInfo.imageInfo[num].width;
        const imgSrc = checkURL(
          post.mediaInfo.imageInfo[num].src.replace("amp;", "")
        );
        setImageInfo({
          src: imgSrc,
          height: imgheight,
          width: imgwidth,
        });
        setPlaceholderInfo({
          src: checkURL(post.thumbnail),
          height: post.thumbnail_height,
          width: post.thumbnail_width,
        });
        setIsImage(true);
        if (imgSrc?.includes("redd") && document) {
          checkImageInCache(imgSrc, (isCached) => {
            if (!isCached) {
              logApiRequest("media");
              if (post.mediaInfo?.isVideo) {
                //account for video here as proxy for cache
                logApiRequest("media");
              }
            }
          });
        }
        return true;
        // }
      }
      return false;
    };

    if (shouldLoad()) {
      initialize();
    } else {
    }
    return () => {
      setIsGallery(false);
      setIsIFrame(false);
      setGalleryInfo([]);
      setIsImage(false);
      setIsMP4(false);
      setisYTVid(false);
      setIsTweet(false);
      setImageInfo({ src: "", height: 0, width: 0 });
      setVideoInfo({
        src: "",
        hlsSrc: "",
        height: 0,
        width: 0,
        hasAudio: false,
      });
      setPlaceholderInfo({ src: "", height: 0, width: 0 });
      setMediaLoaded(false);
      setLoaded(false);
    };
  }, [post, columns, imgFull, fullRes, context.highRes]);

  const [maxheightnum, setMaxheightnum] = useState<number>(() => {
    let yScale = 1;
    if (postMode) {
      yScale = 0.5;
    } else if (columns === 1) {
      yScale = 0.75;
    }
    return containerDims?.[1]
      ? containerDims?.[1]
      : mediaDimensions?.[1]
      ? mediaDimensions?.[1] //media dimensions as prescaled from parent feed
      : windowHeight * yScale;
  });
  useEffect(() => {
    setMaxheightnum(() => {
      let yScale = 1;
      if (postMode && !fullMediaMode) {
        yScale = 0.5;
      } else if (columns === 1) {
        yScale = 0.75;
      }
      return containerDims?.[1]
        ? containerDims?.[1]
        : mediaDimensions?.[1]
        ? mediaDimensions?.[1] //media dimensions as precalced from mymasonic
        : windowHeight * yScale;
    });
  }, [
    columns,
    postMode,
    fullMediaMode,
    windowHeight,
    containerDims,
    mediaDimensions,
  ]);

  const videoQuality = useMemo(
    () =>
      (context.highRes && fullMediaMode) || fullRes
        ? "full"
        : fullMediaMode
        ? windowWidth <= 640
          ? "hd"
          : "full"
        : postMode
        ? windowWidth <= 640
          ? "sd"
          : "full"
        : columns === 1
        ? windowWidth <= 640
          ? "sd"
          : "full"
        : columns > 1 && windowWidth <= 640
        ? "min"
        : columns <= 3
        ? "hd"
        : windowWidth <= 1440 || columns >= 5
        ? "sd"
        : "hd",

    [columns, context.highRes, windowWidth, fullMediaMode, postMode, fullRes]
  );

  const mediaExternalLink = (
    <a
      aria-label="external link"
      onClick={(e) => e.stopPropagation()}
      className={
        "flex flex-grow items-center gap-1 px-0.5 py-2 mt-auto text-xs text-th-link hover:text-th-linkHover bg-th-base  bg-opacity-50 " +
        (postMode || columns === 1
          ? " "
          : " md:bg-black/0 md:group-hover:bg-black/80 ")
      }
      target={"_blank"}
      rel="noreferrer"
      href={post?.url}
    >
      <span
        className={
          "ml-2 " +
          (postMode || columns === 1
            ? ""
            : "md:opacity-0 group-hover:opacity-100")
        }
      >
        {post?.url?.split("?")?.[0]}
      </span>
      <BsBoxArrowInUpRight className="flex-none w-6 h-6 ml-auto mr-2 text-white group-hover:scale-110 " />
    </a>
  );

  return (
    <div
      className={
        uniformMediaMode
          ? "aspect-[9/16] overflow-hidden object-cover object-center"
          : " select-none group"
      }
      ref={mediaRef}
    >
      {loaded ? (
        <>
          {isIFrame && !fill && (
            <button
              aria-label="switch embed"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setAllowIFrame((f) => !f);
              }}
              className={
                "absolute  items-center z-10 gap-1 p-1 text-xs text-white bg-black rounded-md group-hover:flex   bg-opacity-20 hover:bg-opacity-40  " +
                (fullMediaMode
                  ? `bottom-1.5 left-10 md:bottom-24 md:left-1 flex `
                  : "bottom-24 hidden z-10 left-1 ")
              }
            >
              <ImEmbed />
              switch embed
            </button>
          )}

          {isTweet && allowIFrame && !hide && (
            <div
              className={scrollStyle + " overflow-hidden"}
              style={
                mediaDimensions?.[1] || postMode
                  ? {
                      height: `${maxheightnum}px`,
                      maxHeight: `${maxheightnum}px`,
                    }
                  : {
                      height: `24rem`,
                    }
              }
            >
              <div className="">
                <TwitterTweetEmbed
                  placeholder={
                    <div className="relative mx-auto border rounded-lg border-th-border w-60 h-80 animate-pulse bg-th-base">
                      <div className="absolute w-full h-full">
                        <AiOutlineTwitter className="absolute w-7 h-7 right-2 top-2 fill-[#1A8CD8]" />
                      </div>
                    </div>
                  }
                  onLoad={() => {
                    checkCardHeight && checkCardHeight();
                  }}
                  options={{
                    theme: theme === "light" ? "light" : "dark",
                    align: "center",
                  }}
                  tweetId={
                    post.url
                      .split("/")
                      [post.url.split("/").length - 1].split("?")[0]
                  }
                />
              </div>
            </div>
          )}
          {isIFrame && iFrame && allowIFrame && !isTweet && !hide && (
            <>
              <div
                className={
                  "w-full  " +
                  (containerDims?.[1] ? "" : postMode ? " max-h-[50vh]" : "")
                }
                style={
                  containerDims?.[1]
                    ? { height: `${containerDims[1]}px` }
                    : mediaDimensions?.[1]
                    ? { height: `${mediaDimensions[1]}px` }
                    : {
                        aspectRatio: `${
                          post.mediaInfo?.dimensions[1] > 0 && !isYTVid
                            ? `${post.mediaInfo?.dimensions[0]} / ${post.mediaInfo?.dimensions[1]}`
                            : "16 / 9"
                        }`,
                      }
                }
                dangerouslySetInnerHTML={{
                  __html: iFrame.outerHTML,
                }}
              ></div>
              {!postMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClick(e, { toMedia: true });
                  }}
                  className={
                    (uniformMediaMode ? "hidden md:flex" : "flex") +
                    " absolute items-center justify-center w-8 h-8 text-white bg-black rounded-md md:hidden md:group-hover:flex top-2 right-2 bg-opacity-20 hover:bg-opacity-40 "
                  }
                >
                  <BiExpand className="flex-none w-4 h-4" />
                </button>
              )}
            </>
          )}

          {isGallery && (
            <Gallery
              images={galleryInfo}
              columns={columns}
              maxheight={maxheightnum}
              postMode={postMode}
              mediaMode={fullMediaMode}
              mediaRef={mediaRef}
              isXPost={xPostMode}
              fillHeight={
                uniformMediaMode || (postMode && containerDims?.[1])
                  ? true
                  : false
              }
              containerDims={containerDims}
              checkCardHeight={checkCardHeight}
            />
          )}

          {isImage && (!allowIFrame || !isIFrame) && !isMP4 && (
            <div
              className={
                "block relative " +
                (post?.mediaInfo?.isTweet
                  ? " flex items-center justify-center overflow-hidden rounded-lg relative ring-1 ring-[#E7E5E4] "
                  : "") +
                (uniformMediaMode ? " h-full w-full" : " ")
              }
              style={
                fill
                  ? {}
                  : containerDims?.[1]
                  ? { height: `${containerDims?.[1]}px` }
                  : mediaDimensions?.[1]
                  ? { height: `${mediaDimensions?.[1]}px` }
                  : postMode
                  ? { height: `${Math.min(maxheightnum, imageInfo.height)}px` }
                  : {}
              }
            >
              {!mediaLoaded && (
                <div className="absolute z-10 -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                  <LoaderPuff />
                </div>
              )}
              {post?.mediaInfo?.isTweet && (
                <div className="absolute flex w-full h-full bg-[#1A8CD8] rounded-lg  ">
                  <AiOutlineTwitter className="absolute z-20 right-2 top-2 w-10 h-10 fill-[#E7E5E4] group-hover:scale-125 transition-all " />
                </div>
              )}
              {post?.mediaInfo?.isLink && !fill && (
                <div
                  className={
                    "absolute bottom-0 z-20 flex items-end w-full overflow-hidden break-all " +
                    (post?.mediaInfo?.isTweet ? " rounded-b-lg " : "")
                  }
                >
                  {mediaExternalLink}
                </div>
              )}
              <Image
                src={imageInfo.src}
                height={imageInfo.height}
                width={imageInfo.width}
                alt={post?.title}
                layout={
                  fill
                    ? "responsive"
                    : post?.mediaInfo?.isTweet
                    ? "intrinsic"
                    : "fill"
                }
                onLoadingComplete={onLoaded}
                lazyBoundary={imgFull ? "0px" : "2000px"}
                objectFit={
                  uniformMediaMode || fill || post?.mediaInfo?.isYTVid
                    ? "cover"
                    : cardStyle === "card2"
                    ? "fill"
                    : "contain"
                }
                priority={postMode}
                placeholder={
                  post?.mediaInfo?.imageInfo?.[0]?.url && !fullMediaMode
                    ? "blur"
                    : undefined
                }
                blurDataURL={post?.mediaInfo?.imageInfo?.[0]?.url}
                unoptimized={true}
                className={
                  " transition-opacity ease-in duration-300 " +
                  (mediaLoaded || fullMediaMode ? "opacity-100" : "opacity-50")
                }
              />
            </div>
          )}
          {isMP4 && (!allowIFrame || !isIFrame) ? (
            <div className="relative flex flex-col items-center flex-none">
              <VideoHandler
                name={post?.name}
                columns={columns}
                curPostName={curPostName}
                thumbnail={placeholderInfo}
                placeholder={imageInfo} //{placeholderInfo}
                videoInfo={videoInfo}
                maxHeightNum={maxheightnum}
                imgFull={imgFull}
                postMode={postMode}
                containerDims={
                  containerDims?.[1] ? containerDims : mediaDimensions
                }
                fullMediaMode={fullMediaMode}
                hide={hide}
                uniformMediaMode={uniformMediaMode}
                quality={videoQuality}
                setAllowIframe={setAllowIFrame}
                checkCardHeight={checkCardHeight}
              />
              {!postMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleClick(e, { toMedia: true });
                  }}
                  className={
                    (uniformMediaMode ? "hidden md:flex" : "flex") +
                    " absolute items-center justify-center w-8 h-8 text-white bg-black rounded-md md:hidden md:group-hover:flex top-2 right-2 bg-opacity-20 hover:bg-opacity-40 "
                  }
                >
                  <BiExpand className="flex-none w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <></>
          )}
        </>
      ) : (
        <></>
      )}
      {post?.mediaInfo?.isLink &&
        !isImage &&
        !isMP4 &&
        !isIFrame &&
        !isGallery && (
          <div className="overflow-hidden rounded-md">
            <ExternalLink domain={post?.domain} url={post.url} />
          </div>
        )}
    </div>
  );
};

export default Media;
