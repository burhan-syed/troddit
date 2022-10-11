import Image from "next/dist/client/image";
import Gallery from "./Gallery";
import VideoHandler from "./VideoHandler";
import React, { useEffect, useRef, useState } from "react";
import { useMainContext } from "../MainContext";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { useTheme } from "next-themes";
import { useWindowSize } from "@react-hook/window-size";
import { findMediaInfo, findOptimalImageIndex } from "../../lib/utils";
import { AiOutlineTwitter } from "react-icons/ai";
import ParseBodyHTML from "./ParseBodyHTML";
import { ImEmbed, ImSpinner2 } from "react-icons/im";
import { BsBoxArrowInUpRight } from "react-icons/bs";
import { BiExpand } from "react-icons/bi";
import toast from "react-hot-toast";
import ToastCustom from "./toast/ToastCustom";
import ExternalLink from "./ui/ExternalLink";
let regex = /([A-Z])\w+/g;
async function fileExists(url) {
  // try{
  // let http = new XMLHttpRequest();
  // http.open('HEAD', url, false);
  // http.send();
  // //console.log(http.status);
  // return http.status != (403 || 404);

  // } catch (e) {
  //   //console.log('err',e)
  //   return false;
  // }
  return true;
}

const scrollStyle =
  " scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full ";

const Media = ({
  post,
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
  containerDims = undefined,
  uniformMediaMode = false,
  fill = false,
}) => {
  const context: any = useMainContext();
  const [windowWidth, windowHeight] = useWindowSize();
  const mediaRef = useRef<HTMLDivElement>(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [isTweet, setIsTweet] = useState(false);
  const [showMP4, setShowMP4] = useState(true);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({
    url: "",
    height: 0,
    width: 0,
    hasAudio: false,
  });
  const [videoAudio, setvideoAudio] = useState("");
  const [placeholderInfo, setPlaceholderInfo] = useState({
    url: "",
    height: 0,
    width: 0,
  });

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const onLoaded = () => {
    setMediaLoaded(true);
  };

  const [allowIFrame, setAllowIFrame] = useState<boolean>(postMode);
  const [isIFrame, setIsIFrame] = useState(false);
  const [iFrame, setIFrame] = useState<Element>();
  const [isYTVid, setisYTVid] = useState(false);

  useEffect(() => {
    //
    return () => {
      setIsIFrame(false);
      setIFrame(null);
    };
  }, [post]);

  useEffect(() => {
    if (
      (postMode || context.columns === 1 || context.embedsEverywhere) &&
      !context.disableEmbeds
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
    context.columns,
    context.disableEmbeds,
    context.embedsEverywhere,
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
        !post?.selftext_html &&
        !(uniformMediaMode && windowWidth < 640)
      ) {
        b = await findVideo();
        if (b && !context.preferEmbeds) {
          setAllowIFrame(false);
        }
      }
      if (post["mediaInfo"].isIframe && !uniformMediaMode) {
        c = await findIframe();
      }
      if (!b && !post?.selftext_html) {
        a = await findImage();
        if (a && !context.preferEmbeds && context.mediaMode) {
          setAllowIFrame(false);
        }
      }
      a || b || c || post?.selftext_html ? setLoaded(true) : setLoaded(false);
    };

    //if deleted by copyright notice may be set to 'self'
    const checkURLs = () => {
      //console.log(imageInfo, videoInfo, placeholderInfo);
      const placeholder = "http://goo.gl/ijai22";
      if (imageInfo.url === "self") {
        setImageInfo((imgInfo) => {
          return { ...imageInfo, url: placeholder };
        });
      }
      if (videoInfo?.[0]?.url === "self") {
        setVideoInfo((imgInfo) => {
          return { ...imageInfo, url: placeholder, hasAudio: false };
        });
      }
      if (placeholderInfo.url === "self") {
        setPlaceholderInfo((imgInfo) => {
          return { ...imageInfo, url: placeholder };
        });
      }
    };

    const checkURL = (url) => {
      const placeholder =
        "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"; //"http://goo.gl/ijai22";
      //if (!url) return placeholder;
      if (!url?.includes("http")) return placeholder;
      return url;
    };

    const findAudio = async (url) => {
      let a: string = url;
      a = a.replace(regex, "DASH_audio");
      let status = await fileExists(a);
      //console.log(status);
      if (status) {
        setvideoAudio(a);
      } else {
        a = a.split("DASH")[0] + "audio";
        status = await fileExists(a);
        if (status) setvideoAudio(a);
        else setvideoAudio("");
      }
    };

    const findVideo = async () => {
      let optimize = "720";
      let url = "";
      if (!imgFull) {
        if (fullMediaMode) {
          if (!context.highRes && windowWidth < 640) {
            optimize = "480";
          }
        } else if (postMode) {
          optimize = "720";
        } else if (context?.columns > 1 && windowWidth < 640) {
          optimize = "360";
        } else if (context?.columns >= 3 && context?.columns < 5) {
          optimize = "480";
        } else if (context?.columns === 2) {
          optimize = "480"; //"1080";
        } else if (context?.columns === 5) {
          optimize = "360";
        } else if (context?.columns > 5) {
          optimize = "360";
        } else if (windowWidth < 640) {
          optimize = "480";
        }
      }

      if (post?.mediaInfo?.videoInfo) {
        url = post.mediaInfo.videoInfo?.[0]?.url;
        if (url?.includes("DASH_1080") && !imgFull) {
          url = url.replace("DASH_1080", `DASH_${optimize}`);
        }
        if (url?.includes("DASH_720") && !imgFull) {
          url = url.replace("DASH_720", `DASH_${optimize}`);
        }
        if (post?.mediaInfo?.videoInfo?.[1]?.url && optimize !== "720") {
          url = post.mediaInfo.videoInfo?.[1]?.url;
        }
        setVideoInfo({
          url: url,
          height: post.mediaInfo.videoInfo[0].height,
          width: post.mediaInfo.videoInfo[0].width,
          hasAudio: post.mediaInfo.videoInfo[0]?.hasAudio,
        });
        setPlaceholderInfo({
          url: checkURL(post?.thumbnail),
          height: post.mediaInfo.videoInfo[0].height,
          width: post.mediaInfo.videoInfo[0].width,
        });
        // setImageInfo({
        //   url: checkURL(post?.thumbnail),
        //   height: post.mediaInfo.videoInfo.height,
        //   width: post.mediaInfo.videoInfo.width,
        // });
        await findImage();
        if (url?.includes("v.redd.it")) {
          findAudio(post.mediaInfo.videoInfo[0].url);
        }
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
      if (post.url?.includes("twitter.com")) {
        setIsTweet(true);
        setIsIFrame(true);
      }

      if (post?.mediaInfo?.gallery) {
        setGalleryInfo(post.mediaInfo.gallery);
        setIsGallery(true);
        return true;
      } else if (post?.mediaInfo?.imageInfo) {
        let num = findOptimalImageIndex(post.mediaInfo.imageInfo, {
          windowWidth,
          imgFull,
          fullRes: fullRes || context.highRes,
          containerDims,
          context,
          postMode,
        });

        let imgheight = post.mediaInfo.imageInfo[num].height;
        let imgwidth = post.mediaInfo.imageInfo[num].width;
        setImageInfo({
          url: checkURL(post.mediaInfo.imageInfo[num].url.replace("amp;", "")),
          height: imgheight,
          width: imgwidth,
        });
        setPlaceholderInfo({
          url: checkURL(post.thumbnail),
          height: post.thumbnail_height,
          width: post.thumbnail_width,
        });
        setIsImage(true);
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
      setvideoAudio("");
      setIsGallery(false);
      setIsIFrame(false);
      setGalleryInfo([]);
      setIsImage(false);
      setIsMP4(false);
      setisYTVid(false);
      setIsTweet(false);
      setShowMP4(true);
      setImageInfo({ url: "", height: 0, width: 0 });
      setVideoInfo({ url: "", height: 0, width: 0, hasAudio: false });
      setPlaceholderInfo({ url: "", height: 0, width: 0 });
      setMediaLoaded(false);
      setLoaded(false);
    };
  }, [post, context?.columns, imgFull, fullRes, context.highRes]);

  //scale media
  const [imgheight, setimgheight] = useState({}); //sets style height for image
  const [maxheight, setmaxheight] = useState({}); //sets maxheight style
  const [maxheightnum, setmaxheightnum] = useState<number>(() => {
    let cropamount = 0.95;
    if (postMode) {
      cropamount = 0.5;
    } else if (context?.columns === 1 && !imgFull) {
      cropamount = 0.75;
    }
    return containerDims?.[1]
      ? containerDims?.[1]
      : Math.floor(windowHeight * cropamount);
  }); //maxheight set in style
  useEffect(() => {
    //console.log(postMode, context.columns, imgFull)
    let cropamount = 0.95;
    if (postMode) {
      cropamount = 0.75;
    } else if (context?.columns == 1 && !imgFull) {
      cropamount = 0.75;
    }
    let imgheight = imageInfo.height;
    containerDims?.[1]
      ? setimgheight({
          height: `${imgheight}px`,
          maxHeight: `${Math.floor(containerDims?.[1])}px`,
        })
      : context.columns === 1 && !postMode
      ? setimgheight({ maxHeight: Math.floor(windowHeight * 0.75) })
      : "";
    setmaxheight({
      maxHeight: `${Math.floor(windowHeight * cropamount)}px`,
    });
    containerDims?.[1]
      ? setmaxheightnum(containerDims?.[1])
      : setmaxheightnum(Math.floor(windowHeight * cropamount));
    return () => {
      setimgheight({});
      setmaxheight({});
      setmaxheightnum(0);
    };
  }, [
    imageInfo,
    context?.columns,
    imgFull,
    portraitMode,
    windowHeight,
    containerDims,
  ]);
  const [tweetLoaded, setTweetLoaded] = useState(false);
  useEffect(() => {
    let toastId = "autoPlayWarning";
    if (
      isIFrame &&
      allowIFrame &&
      context?.autoPlayMode &&
      fullMediaMode &&
      post.name === curPostName
    ) {
      toast.remove(toastId);
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Auto play may not work for external sources`}
            mode={"alert"}
          />
        ),
        { position: "top-center", id: toastId, duration: 10000 }
      );
    } else {
      //toast.remove(toastId)
    }
    () => {
      toast.remove(toastId);
    };
  }, [
    isIFrame,
    allowIFrame,
    context?.autoPlayMode,
    fullMediaMode,
    curPostName,
  ]);
  //scale images
  const [imgWidthHeight, setImageWidthHeight] = useState([
    imageInfo?.width, //post?.mediaInfo?.dimensions[0],
    imageInfo?.height, //post?.mediaInfo?.dimensions[1]
  ]);
  useEffect(() => {
    if (
      mediaRef.current &&
      mediaRef.current.clientWidth &&
      imageInfo?.height &&
      imageInfo?.width
      //post?.mediaInfo?.dimensions[0] > 0
    ) {
      let r = mediaRef.current.clientWidth / imageInfo?.width; //post?.mediaInfo?.dimensions[0];
      let height = r * imageInfo?.height; //post?.mediaInfo?.dimensions[1];
      setImageWidthHeight([mediaRef.current.clientWidth, height]);
    }
  }, [mediaRef?.current?.clientWidth, imageInfo]);

  const externalLink = (
    <a
      aria-label="external link"
      onClick={(e) => e.stopPropagation()}
      className="flex flex-grow items-center gap-1 px-0.5 py-2 mt-auto text-xs text-th-link hover:text-th-linkHover bg-black/80 md:bg-black/0 md:group-hover:bg-black/80 bg-opacity-50 "
      target={"_blank"}
      rel="noreferrer"
      href={post?.url}
    >
      <span className="ml-2 md:opacity-0 group-hover:opacity-100">
        {post?.url?.split("?")?.[0]}
      </span>
      <BsBoxArrowInUpRight className="flex-none w-6 h-6 ml-auto mr-2 text-white group-hover:scale-110 " />
    </a>
  );

  return (
    <div
      className={
        fill
          ? "block"
          : uniformMediaMode
          ? "aspect-[9/16] overflow-hidden object-cover object-center"
          : "block select-none group"
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
              className={
                !postMode || (!imgFull && !containerDims?.[1])
                  ? " h-96 max-h-96 overflow-auto w-full  "
                  : ""
              }
            >
              <div className={" bg-transparent w-full  " + scrollStyle}>
                <TwitterTweetEmbed
                  placeholder={
                    <div className="relative mx-auto border rounded-lg border-th-border w-60 h-80 animate-pulse bg-th-base">
                      <div className="absolute w-full h-full">
                        <AiOutlineTwitter className="absolute w-7 h-7 right-2 top-2 fill-[#1A8CD8]" />
                      </div>
                    </div>
                  }
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
          {isIFrame && allowIFrame && !isTweet && !hide ? (
            <div
              className={"relative w-full h-full"}
              //filling IFrames in postmode portrait pane or a 16:9 ratio elsewhere
            >
              <div
                className={
                  "w-full h-full " +
                  (containerDims?.[1]
                    ? ""
                    : postMode || context.columns == 1
                    ? " max-h-[75vh]"
                    : "")
                }
                style={
                  containerDims?.[1]
                    ? { height: `${Math.floor(containerDims[1])}px` }
                    : {
                        aspectRatio: `${
                          post.mediaInfo?.dimensions[1] > 0 && !isYTVid
                            ? `${post.mediaInfo?.dimensions[0]} / ${post.mediaInfo?.dimensions[1]}`
                            : "16 / 9"
                        }`,
                      }
                }
                dangerouslySetInnerHTML={{ __html: iFrame.outerHTML }}
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
            </div>
          ) : (
            ""
          )}

          {isGallery && (
            <Gallery
              images={galleryInfo}
              maxheight={imgFull ? 0 : maxheightnum}
              postMode={postMode}
              mediaMode={fullMediaMode}
              mediaRef={mediaRef}
              uniformHeight={containerDims ? false : true}
              fillHeight={uniformMediaMode ? true : false}
            />
          )}

          {isImage && (!allowIFrame || !isIFrame) && !isMP4 && (
            <div
              className={
                "relative  " +
                (uniformMediaMode ? " min-h-full " : "") +
                ((imgFull || (!postMode && context.columns !== 1)) &&
                !post?.mediaInfo?.isTweet
                  ? " block "
                  : post?.mediaInfo?.isTweet
                  ? "flex items-center justify-center  relative overflow-hidden rounded-lg " +
                    (containerDims?.[1]
                      ? ""
                      : " h-96  border border-[#E7E5E4] ")
                  : " flex items-center justify-center relative ")
              } //flex items-center justify-center "}
              style={
                fill
                  ? {}
                  : containerDims?.[1] && post.mediaInfo?.isTweet
                  ? { height: `${containerDims?.[1]}px` }
                  : (containerDims?.[1] && !imgFull) || //to match image height to portrait postmodal container
                    (context.columns === 1 && !postMode) || //to prevent images from being greater than 75% of window height in single column mode
                    (postMode && !imgFull) //to prevent images from being greater than 75% of window height in post mode w/oimgfull
                  ? imgheight
                  : !post?.mediaInfo?.isTweet
                  ? { height: `${imgWidthHeight?.[1]}px` }
                  : {}
              }
            >
              {!mediaLoaded && (
                <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
                  <ImSpinner2 className="w-8 h-8 animate-spin" />
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
                  {externalLink}
                </div>
              )}
              <Image
                src={imageInfo.url}
                height={
                  uniformMediaMode
                    ? post?.mediaInfo?.dimensions[1]
                    : fill
                    ? imageInfo?.height
                    : !postMode &&
                      context.columns > 1 &&
                      !post?.mediaInfo?.isTweet
                    ? //layout in fill mode, no height needed
                      post?.mediaInfo?.dimensions[1] *
                      (mediaRef?.current?.clientWidth /
                        post?.mediaInfo?.dimensions[0]) //undefined
                    : post?.mediaInfo?.isTweet
                    ? imageInfo.height
                    : (context?.columns === 1 || (postMode && !imgFull)) && //single column or post mode..
                      imageInfo.height *
                        (mediaRef?.current?.clientWidth / imageInfo.width) >
                        maxheightnum && //scale down image to fit in window
                      !imgFull
                    ? maxheightnum
                    : imgWidthHeight[1] //scaled height to eliminate letterboxing
                }
                width={
                  uniformMediaMode
                    ? post?.mediaInfo?.dimensions[0]
                    : fill
                    ? imageInfo?.width
                    : !postMode &&
                      context.columns > 1 &&
                      !post?.mediaInfo?.isTweet
                    ? mediaRef?.current?.clientWidth
                    : post?.mediaInfo?.isTweet
                    ? imageInfo.width
                    : (context?.columns === 1 || (postMode && !imgFull)) && //single column or post mode..
                      imageInfo.height *
                        (mediaRef?.current?.clientWidth / imageInfo.width) >
                        maxheightnum && //scale down image to fit in window
                      !imgFull
                    ? Math.floor(
                        imageInfo.width * (maxheightnum / imageInfo.height)
                      )
                    : imgWidthHeight[0]
                }
                alt={post?.title}
                layout={
                  fill
                    ? "responsive"
                    : !postMode &&
                      context.columns > 1 &&
                      !post?.mediaInfo?.isTweet
                    ? "fill"
                    : imgFull && !post?.mediaInfo?.isTweet
                    ? "responsive"
                    : "intrinsic"
                }
                onLoadingComplete={onLoaded}
                lazyBoundary={imgFull ? "0px" : "2000px"}
                objectFit={
                  uniformMediaMode || fill
                    ? "cover"
                    : imgFull ||
                      (context?.columns == 1 && !post.mediaInfo?.isTweet)
                    ? "contain"
                    : "fill"
                }
                priority={postMode}
                unoptimized={true}
                className={
                  fill
                    ? " "
                    : post?.mediaInfo?.isTweet
                    ? "object-contain  "
                    : ""
                }
              />
            </div>
          )}

          {isMP4 && (!allowIFrame || !isIFrame) ? (
            showMP4 ? (
              <div className="relative flex flex-col items-center flex-none">
                <VideoHandler
                  name={post?.name}
                  curPostName={curPostName}
                  thumbnail={placeholderInfo}
                  placeholder={imageInfo} //{placeholderInfo}
                  videoInfo={videoInfo}
                  maxHeight={maxheight}
                  maxHeightNum={maxheightnum}
                  imgFull={imgFull}
                  audio={videoAudio}
                  postMode={postMode}
                  containerDims={containerDims}
                  fullMediaMode={fullMediaMode}
                  hide={hide}
                  uniformMediaMode={uniformMediaMode}
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
              ""
            )
          ) : (
            ""
          )}

          {post?.selftext_html &&
          ((!context.mediaOnly && context.cardStyle !== "card2") ||
            postMode) ? (
            <div
              className={
                "p-1 overflow-y-auto select-text  overscroll-auto " +
                scrollStyle +
                (!imgFull ? " max-h-96 border-b border-th-border" : " ") +
                (containerDims?.[1] ? " mx-4 my-2 " : "") +
                (read && context.dimRead ? " opacity-50 " : "")
              }
            >
              <ParseBodyHTML
                rows={context.cardStyle == "row1"}
                post={postMode}
                card={card}
                html={post?.selftext_html}
                small={postMode ? false : true}
                limitWidth={postMode && !context.postWideUI}
              />
            </div>
          ) : !context.mediaOnly ? (
            ""
          ) : (
            ""
          )}
        </>
      ) : (
        !fill &&
        !post?.mediaInfo?.isGallery &&
        post?.mediaInfo?.dimensions?.[1] > 0 &&
        mediaRef?.current &&
        mediaRef?.current?.clientWidth > 0 &&
        maxheightnum && (
          <div
            className=""
            style={{
              height: `${
                videoInfo?.height > 0 && videoInfo?.height < maxheightnum
                  ? videoInfo?.height
                  : (mediaRef.current.clientWidth /
                      post.mediaInfo.dimensions[0]) *
                      post.mediaInfo.dimensions[1] >
                    maxheightnum
                  ? maxheightnum
                  : (mediaRef.current.clientWidth /
                      post.mediaInfo.dimensions[0]) *
                    post.mediaInfo.dimensions[1]
              }px`,
            }}
          ></div>
        )
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
