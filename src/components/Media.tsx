import Image from "next/dist/client/image";
import Gallery from "./Gallery";
import VideoHandler from "./VideoHandler";
import React, { useEffect, useRef, useState } from "react";
import { useMainContext } from "../MainContext";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { useTheme } from "next-themes";
import { useWindowSize } from "@react-hook/window-size";
import { findMediaInfo } from "../../lib/utils";
import { AiOutlineTwitter } from "react-icons/ai";
import ParseBodyHTML from "./ParseBodyHTML";
import { ImEmbed, ImSpinner2 } from "react-icons/im";
import { BsBoxArrowInUpRight } from "react-icons/bs";
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
  imgFull = false,
  forceMute = 0,
  portraitMode = false,
  postMode = false,
  read = false,
  card = false,
  containerDims = undefined,
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
      if (post["mediaInfo"].isVideo && !post?.selftext_html) {
        b = await findVideo();
        if (b && !context.preferEmbeds) {
          setAllowIFrame(false);
        }
      }
      if (post["mediaInfo"].isIframe) {
        c = await findIframe();
      }
      if (!b && !post?.selftext_html) {
        a = await findImage();
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
      if (videoInfo.url === "self") {
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
        if (postMode) {
          optimize = "720";
        } else if (context?.columns >= 3 && context?.columns < 5) {
          optimize = "480";
        } else if (context?.columns === 2) {
          optimize = "480"; //"1080";
        } else if (context?.columns === 5) {
          optimize = "360";
        } else if (context?.columns > 5) {
          optimize = "360";
        }
      }

      if (post?.mediaInfo?.videoInfo) {
        url = post.mediaInfo.videoInfo.url;
        if (url.includes("DASH_1080") && !imgFull) {
          url = url.replace("DASH_1080", `DASH_${optimize}`);
        }
        if (url.includes("DASH_720") && !imgFull) {
          url = url.replace("DASH_720", `DASH_${optimize}`);
        }
        setVideoInfo({
          url: url,
          height: post.mediaInfo.videoInfo.height,
          width: post.mediaInfo.videoInfo.width,
          hasAudio: post.mediaInfo.videoInfo?.hasAudio,
        });
        setPlaceholderInfo({
          url: checkURL(post?.thumbnail),
          height: post.mediaInfo.videoInfo.height,
          width: post.mediaInfo.videoInfo.width,
        });
        // setImageInfo({
        //   url: checkURL(post?.thumbnail),
        //   height: post.mediaInfo.videoInfo.height,
        //   width: post.mediaInfo.videoInfo.width,
        // });
        await findImage();
        if (url.includes("v.redd.it")) {
          findAudio(post.mediaInfo.videoInfo.url);
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
      if (post.url.includes("twitter.com")) {
        setIsTweet(true);
        setIsIFrame(true);
        //return true;
      }

      if (post?.mediaInfo?.gallery) {
        setGalleryInfo(post.mediaInfo.gallery);
        setIsGallery(true);
        return true;
      } else if (post?.mediaInfo?.imageInfo) {
        let num = post.mediaInfo.imageInfo.length - 1;

        //choose smallest image possible
        let done = false;
        let width = windowWidth; // screen.width;
        if (!imgFull) {
          if (containerDims?.[0]) {
            width = containerDims?.[0];
          } else if (
            !context.saveWideUI &&
            context.cardStyle !== "row1" &&
            (context.columns === 1 || postMode)
          ) {
            width = 768; //3xl width
          } else if (postMode) {
            width = windowWidth;
          } else {
            width = width / (context?.columns ?? 1);
          }
        }
        post.mediaInfo.imageInfo.forEach((res, i) => {
          if (!done) {
            if (res.width > width) {
              num = i;
              done = true;
            }
          }
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
  }, [post, context?.columns, imgFull]);

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
      cropamount = 0.5;
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
  //scale images
  const [imgWidthHeight, setImageWidthHeight] = useState([
    imageInfo.width,
    imageInfo.height,
  ]);
  useEffect(() => {
    if (
      mediaRef.current &&
      mediaRef.current.clientWidth &&
      imageInfo.height &&
      imageInfo.width
    ) {
      let r = mediaRef.current.clientWidth / imageInfo.width;
      let height = r * imageInfo.height;
      setImageWidthHeight([mediaRef.current.clientWidth, height]);
    }
  }, [imageInfo, mediaRef?.current?.clientWidth]);
  const [tweetLoaded, setTweetLoaded] = useState(false);

  const externalLink = (
    <a
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
    <div className="block select-none group" ref={mediaRef}>
      {loaded ? (
        <>
          {isIFrame && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setAllowIFrame((f) => !f);
              }}
              className="absolute z-10 items-center hidden gap-1 p-1 text-xs text-white bg-black rounded-md group-hover:flex left-1 bottom-24 bg-opacity-20 hover:bg-opacity-40"
            >
              <ImEmbed />
              switch embed
            </button>
          )}

          {isTweet && allowIFrame && (
            <div
              className={
                " bg-transparent " +
                scrollStyle +
                (!postMode || (!imgFull && !containerDims?.[1])
                  ? " h-96 max-h-96 overflow-auto "
                  : "")
              }
            >
              <TwitterTweetEmbed
                placeholder={
                  <div className="relative mx-auto border rounded-lg border-th-border w-60 h-96 animate-pulse bg-th-base">
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
          )}
          {isIFrame && allowIFrame && !isTweet ? (
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
            </div>
          ) : (
            ""
          )}

          {isGallery && (
            <Gallery
              images={galleryInfo}
              maxheight={imgFull ? 0 : maxheightnum}
              postMode={postMode}
              mediaRef={mediaRef}
              uniformHeight={containerDims ? false : true}
            />
          )}

          {isImage && (!allowIFrame || !isIFrame) && !isMP4 && (
            <div
              className={
                "relative  " +
                ((imgFull || (!postMode && context.columns !== 1)) &&
                !post?.mediaInfo?.isTweet
                  ? " block "
                  : post?.mediaInfo?.isTweet
                  ? "flex items-center justify-center  relative overflow-hidden rounded-lg " +
                    (containerDims?.[1] ? "" : " h-96  border border-[#E7E5E4] ")
                  : " flex items-center justify-center relative ")
              } //flex items-center justify-center "}
              style={
                containerDims?.[1] && post.mediaInfo?.isTweet
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
              {post?.mediaInfo?.isLink && (
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
                  !postMode && context.columns > 1 && !post?.mediaInfo?.isTweet
                    ? //layout in fill mode, no height needed
                      undefined
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
                  !postMode && context.columns > 1 && !post?.mediaInfo?.isTweet
                    ? undefined
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
                alt=""
                layout={
                  !postMode && context.columns > 1 && !post?.mediaInfo?.isTweet
                    ? "fill"
                    : imgFull && !post?.mediaInfo?.isTweet
                    ? "responsive"
                    : "intrinsic"
                }
                onLoadingComplete={onLoaded}
                lazyBoundary={imgFull ? "0px" : "2000px"}
                objectFit={
                  imgFull || (context?.columns == 1 && !post.mediaInfo?.isTweet)
                    ? "contain"
                    : "fill"
                }
                priority={postMode}
                unoptimized={true}
                className={post?.mediaInfo?.isTweet ? "object-contain  " : ""}
              />
            </div>
          )}

          {isMP4 && (!allowIFrame || !isIFrame) ? (
            showMP4 ? (
              <div className="flex flex-col items-center flex-none ">
                <VideoHandler
                  thumbnail={placeholderInfo}
                  placeholder={imageInfo} //{placeholderInfo}
                  videoInfo={videoInfo}
                  maxHeight={maxheight}
                  maxHeightNum={maxheightnum}
                  imgFull={imgFull}
                  audio={videoAudio}
                  postMode={postMode}
                  containerDims={containerDims}
                />
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
        post?.mediaInfo?.dimensions?.[1] > 0 &&
        mediaRef?.current &&
        mediaRef?.current?.clientWidth > 0 &&
        maxheightnum && (
          <div
            className=""
            style={{
              height: `${
                (mediaRef.current.clientWidth / post.mediaInfo.dimensions[0]) *
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
          <div className="">
            <a
              onClick={(e) => e.stopPropagation()}
              className="flex items-center flex-grow gap-1 px-2 py-2 mt-auto text-xs bg-opacity-50 bg-black/80 text-th-link hover:text-th-linkHover "
              target={"_blank"}
              rel="noreferrer"
              href={post?.url}
            >
              <span className="opacity-100 ">{post?.url?.split("?")?.[0]}</span>
              <BsBoxArrowInUpRight className="flex-none w-6 h-6 ml-auto text-white group-hover:scale-110 " />
            </a>
          </div>
        )}
    </div>
  );
};

export default Media;
