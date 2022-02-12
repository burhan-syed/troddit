import Image from "next/dist/client/image";
//import MyImage from './Image';
import LazyLoad from "react-lazyload";
import Gallery from "./Gallery";
import VideoHandler from "./VideoHandler";
import ImageHandler from "./ImageHandler";
import { forceCheck } from "react-lazyload";
import { useEffect, useState } from "react";
import { useMainContext } from "../MainContext";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { useTheme } from "next-themes";
import { useWindowSize } from "@react-hook/window-size";
import { findMediaInfo } from "../../lib/utils";
import { AiOutlineTwitter } from "react-icons/ai";
const TWITCH_PARENT = "www.troddit.com"; //'localhost'

let regex = /([A-Z])\w+/g;
async function fileExists(url) {
  // try{
  // let http = new XMLHttpRequest();
  // http.open('HEAD', url, false);
  // http.send();
  // // console.log(http.status);
  // return http.status != (403 || 404);

  // } catch (e) {
  //   console.log('err',e)
  //   return false;
  // }
  return true;
}

const Media = ({
  post,
  allowIFrame = false,
  imgFull = false,
  forceMute = 0,
  portraitMode = false,
  postMode = false,
  containerDims = undefined,
}) => {
  const context: any = useMainContext();
  const [windowWidth, windowHeight] = useWindowSize();

  const [isPortrait, setIsPortrait] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [isTweet, setIsTweet] = useState(false);
  const [showMP4, setShowMP4] = useState(true);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoAudio, setvideoAudio] = useState("");
  const [placeholderInfo, setPlaceholderInfo] = useState({
    url: "",
    height: 0,
    width: 0,
  });

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toLoad, setToLoad] = useState(false);

  const onLoaded = () => {
    setMediaLoaded(true);
  };

  const [isIFrame, setIsIFrame] = useState(false);
  const [iFrame, setIFrame] = useState<Element>();
  const [isYTVid, setisYTVid] = useState(false);
  const [ytVidHeight, setytVidHeight] = useState({});
  useEffect(() => {
    //
    return () => {
      setIsIFrame(false);
      setIFrame(null);
      setisYTVid(false);
      setytVidHeight({});
    };
  }, [post]);

  useEffect(() => {
    const shouldLoad = () => {
      if (!post) return false;
      if (!post.url) return false;
      if (!post.title) return false;
      if (!post.subreddit) return false;
      return true;
    };

    const initialize = async () => {
      if (!post.mediaInfo) {
        let m = await findMediaInfo(post);
        post["mediaInfo"] = m;
      }
      let a, b, c;
      b = await findVideo();
      if (!b) {
        a = await findImage();
      }
      if (context.columnOverride == 1 || allowIFrame) {
        c = await findIframe();
      }
      //console.log(a,b,c)
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
          return { ...imageInfo, url: placeholder };
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
      if (!url) return placeholder;
      if (!url.includes("http")) return placeholder;
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
      //console.log("find iframe", post?.title);
      //console.log(post?.mediaInfo?.iFrameHTML.src);
      if (post?.mediaInfo?.iFrameHTML) {
        if (
          post?.mediaInfo?.iFrameHTML.src.includes("youtube.com")
          // || post?.mediaInfo?.iFrameHTML.src.includes("twitch.tv/embed")
        ) {
          setytVidHeight({ height: `${Math.floor(windowHeight * 0.75)}px` });
          setisYTVid(true);
        }
        setIFrame(post.mediaInfo.iFrameHTML);
        (context.columnOverride === 1 || allowIFrame) && setIsIFrame(true);
        return true;
      } else {
        return false;
      }
    };

    const findImage = async () => {
      if (post.url.includes("twitter.com") && (postMode || allowIFrame)) {
        setIsTweet(true);
        return true;
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
          width = width / (context?.columns ?? 1);
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
        //console.log('img',post.mediaInfo)
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
      setToLoad(true);
    } else {
    }
    forceCheck();
    return () => {
      setIsGallery(false);
      setGalleryInfo([]);
      setIsImage(false);
      setIsMP4(false);
      setIsTweet(false);
      setShowMP4(true);
      setImageInfo({ url: "", height: 0, width: 0 });
      setVideoInfo({ url: "", height: 0, width: 0 });
      setPlaceholderInfo({ url: "", height: 0, width: 0 });
      setMediaLoaded(false);
      setLoaded(false);
      setToLoad(false);
    };
  }, [post, allowIFrame, context?.columnOverride, imgFull]);

  const [imgheight, setimgheight] = useState({});
  const [maxheight, setmaxheight] = useState({});
  const [maxheightnum, setmaxheightnum] = useState<number>();
  useEffect(() => {
    let cropamount = 0.77;
    // if (portraitMode) {
    //   cropamount = containerDims?.[1]
    //     ? containerDims?.[1] / windowHeight
    //     : 0.93;
    // }
    let imgheight = imageInfo.height;
    // if (
    //   context?.columnOverride == 1 &&
    //   !imgFull &&
    //   imgheight > Math.floor(windowHeight * 0.75)
    // ) {
    //   imgheight = windowHeight * 0.75;
    // }
    containerDims?.[1]
      ? setimgheight({
          height: `${imgheight}px`,
          maxHeight: `${Math.floor(containerDims?.[1])}px`,
        })
      : context.columnOverride === 1 && !postMode
      ? setimgheight({ maxHeight: Math.floor(windowHeight * 0.75) })
      : "";

    // !post?.mediaInfo?.isPortrait
    //   ? setimgheight({
    //       //height: `${imgheight}px`,
    //       maxHeight: `${Math.floor(
    //         windowHeight *
    //           (context?.columnOverride == 1 && !imgFull ? 0.75 : cropamount)
    //       )}px`,
    //     })
    //   : setimgheight({
    //       height: `${imgheight}px`,
    //       maxHeight: `${
    //         containerDims?.[1]
    //           ? containerDims?.[1]
    //           : Math.floor(
    //               windowHeight *
    //                 (postMode
    //                   ? 0.5
    //                   : context?.columnOverride == 1 && !imgFull
    //                   ? 0.75
    //                   : cropamount)
    //             )
    //       }px`,
    //     });
    setmaxheight({
      maxHeight: `${Math.floor(
        windowHeight *
          (context?.columnOverride == 1 && !imgFull ? 0.75 : cropamount)
      )}px`,
    });
    containerDims?.[1]
      ? setmaxheightnum(containerDims?.[1])
      : setmaxheightnum(
          Math.floor(
            windowHeight *
              (context?.columnOverride == 1 && !imgFull ? 0.75 : cropamount)
          )
        );
    return () => {
      setimgheight({});
      setmaxheight({});
      setmaxheightnum(0);
    };
  }, [
    imageInfo,
    context?.columnOverride,
    imgFull,
    portraitMode,
    windowHeight,
    containerDims,
  ]);

  const [tweetLoaded, setTweetLoaded] = useState(false);

  return (
    <div className="block select-none group">
      {loaded && (
        <>
          {isTweet && (
            <div
              className={!imgFull && "flex justify-center " + " bg-transparent"}
            >
              {/* {!tweetLoaded && (
                <div className="my-5 bg-gray-300 border rounded-lg w-60 h-96 animate-pulse dark:bg-gray-800"></div>
              )} */}
              <TwitterTweetEmbed
                // onLoad={() => setTweetLoaded(true)}
                placeholder={
                  <div className="relative my-5 bg-gray-300 border rounded-lg dark:border-darkBorder border-lightBorder w-60 h-96 animate-pulse dark:bg-gray-800">
                    <div className="absolute w-full h-full">
                      <AiOutlineTwitter className="absolute w-7 h-7 right-2 top-2 fill-[#1A8CD8]" />
                    </div>
                  </div>
                }
                options={{
                  theme: theme,
                  conversation: "none",
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
          {isIFrame && (allowIFrame || context?.columnOverride === 1) ? (
            <div
              className="relative"
              // style={
              //   postMode && isYTVid
              //     ? ytVidHeight
              //     : true ||
              //       context?.columnOverride == 1 ||
              //       windowHeight > windowWidth
              //     ? {
              //         height: `${
              //           windowHeight < windowWidth
              //             ? Math.floor(windowHeight * 0.75)
              //             : Math.floor(windowHeight * 0.4)
              //         }px`,
              //       }
              //     : {}
              // }
              //filling IFrames in postmode portrait pane or aproximating a 16:9 ratio elsewhere
              style={
                containerDims?.[1]
                  ? { height: `${Math.floor(containerDims[1])}px` }
                  : {
                      height: `${Math.floor(
                        (!context.saveWideUI
                          ? 768
                          : windowWidth *
                            (windowWidth < 768
                              ? 1
                              : windowWidth >= 1024
                              ? 3 / 4
                              : 10 / 12)) *
                          (9 / 16)
                      )}px`,
                    }
              }
            >
              <div
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: iFrame.outerHTML }}
              ></div>
            </div>
          ) : (
            ""
          )}

          {isGallery ? (
            <div
              className="flex flex-col items-center"
              // style={
              //   imgFull || (context?.columnOverride == 1 && !postMode)
              //     ? maxheight
              //     : {}
              // }
            >
              <Gallery
                images={galleryInfo}
                maxheight={
                  imgFull ? 0 : maxheightnum // postMode && imgFull
                  // ? // || (context.columnOverride == 1 && !postMode)
                  //   maxheightnum
                  // : 0
                }
              />
            </div>
          ) : (
            ""
          )}

          {isImage && !isIFrame && !isMP4 && (
            // <ImageHandler placeholder={placeholderInfo} imageInfo={imageInfo} />
            <div
              className={
                "relative  " +
                (imgFull ? " block" : " flex items-center justify-center ") +
                (post?.mediaInfo?.isTweet ? " py-14 " : " ")
              } //flex items-center justify-center "}
              style={
                (containerDims?.[1] && !imgFull) || //to match image height to portrait postmodal container
                (context.columnOverride === 1 && !postMode) || //to prevent images from being greater than 75% of window height in single column mode
                (postMode && !imgFull) //to prevent iamges from being greater than 75% of window height in post mode w/oimgfull
                  ? imgheight
                  : {}
              }
            >
              {!mediaLoaded && (
                <div className="absolute w-8 h-8 -mt-8 -ml-8 border-b-2 rounded-full top-1/2 left-1/2 animate-spin"></div>
              )}
              {post?.mediaInfo?.isTweet && (
                <div className="absolute flex w-full h-full   bg-[#1A8CD8] rounded-lg  ">
                  <AiOutlineTwitter className="absolute right-2 top-2 w-10 h-10 fill-[#E7E5E4] group-hover:scale-125 transition-all " />
                </div>
              )}
              <Image
                src={imageInfo.url}
                height={
                  (context?.columnOverride === 1 || (postMode && !imgFull)) &&
                  imageInfo.height > maxheightnum &&
                  !imgFull
                    ? maxheightnum
                    : imageInfo.height
                }
                width={
                  (context?.columnOverride === 1 || (postMode && !imgFull)) &&
                  imageInfo.height > maxheightnum &&
                  !imgFull
                    ? Math.floor(
                        imageInfo.width * (maxheightnum / imageInfo.height)
                      )
                    : imageInfo.width
                }
                alt=""
                layout={
                  // (imgFull && !(context?.cardStyle === "row1")) ||
                  // context?.columnOverride == 1 ||
                  // (postMode && !imgFull) || // && post?.mediaInfo?.isPortrait
                  // imageInfo.url === "spoiler"
                  //   ? "fixed" //"fill" //fitting image to above container
                  imgFull ? "responsive" : "intrinsic" //"responsive"
                }
                onLoadingComplete={onLoaded}
                lazyBoundary={imgFull ? "0px" : "2000px"}
                objectFit={
                  imgFull || context?.columnOverride == 1
                    ? "contain"
                    : "contain"
                }
                priority={postMode}
                unoptimized={true}
                // placeholder="blur"
                // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKF5YDwADJAGVKdervwAAAABJRU5ErkJggg=="
              />
            </div>
          )}

          {isMP4 && !isIFrame ? (
            showMP4 ? (
              <div
                className="flex flex-col items-center flex-none "
                style={
                  //imgFull ||
                  context?.columnOverride == 1 && !postMode ? maxheight : {}
                }
              >
                {/* <LazyLoad
                  height={videoInfo.height}
                  once={true}
                  offset={2000}
                  unmountIfInvisible={false}
                > */}
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
                {/* </LazyLoad> */}
              </div>
            ) : (
              ""
            )
          ) : (
            ""
          )}

          {post?.selftext_html &&
          (!context.mediaOnly || imgFull) &&
          (context.cardStyle !== "card2" || imgFull) ? (
            <div
              className={
                "p-1 overflow-y-auto select-text  overscroll-auto scrollbar-thin scrollbar-thumb-blue-400 dark:scrollbar-thumb-red-800" +
                (!imgFull &&
                  " max-h-96 border-b dark:border-darkBorderHighlight")
              }
            >
              <div
                className="mr-1.5"
                id="innerhtml"
                dangerouslySetInnerHTML={{ __html: post?.selftext_html }}
              ></div>
            </div>
          ) : !context.mediaOnly ? (
            ""
          ) : (
            // (
            //   // <p className="overflow-y-scroll max-h-60 overflow-ellipsis overscroll-contain">{post.selftext}</p>
            //   <div className={"overflow-y-auto  overscroll-contain scrollbar-thin scrollbar-thumb-blue-400 dark:scrollbar-thumb-red-800" + (!imgFull && " max-h-96 ")}>
            //     <p>
            //       {post?.selftext}
            //     </p>
            //   </div>
            // )
            ""
          )}
        </>
      )}
    </div>
  );
};

export default Media;
