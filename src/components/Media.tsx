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
      let a, b, c;
      b = await findVideo();
      if (!b) {
        a = await findImage();
      }
      if (context.columnOverride == 1 || allowIFrame) {
        c = await findIframe();
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
      let optimize = "1080";
      let url = "";
      if (!postMode) {
        if (context?.columns === 3) {
          optimize = "480";
        } else if (context?.columns === 2) {
          optimize = "1080";
        } else if (context?.columns > 3) {
          optimize = "360";
        }
      }
      if (post.preview) {
        if (post.preview.reddit_video_preview) {
          url = post.preview.reddit_video_preview.fallback_url;
          if (url.includes("DASH_1080") && !postMode) {
            url = url.replace("DASH_1080", `DASH_${optimize}`);
          }
          setVideoInfo({
            url: url,
            height: post.preview.reddit_video_preview.height,
            width: post.preview.reddit_video_preview.width,
          });
          if (
            post.preview.reddit_video_preview.fallback_url.includes("v.redd.it")
          ) {
            findAudio(post.preview.reddit_video_preview.fallback_url);
          }

          setPlaceholderInfo({
            url: checkURL(post?.thumbnail),
            height: post.preview.reddit_video_preview.height,
            width: post.preview.reddit_video_preview.width,
          });
          setImageInfo({
            url: checkURL(post?.thumbnail),
            height: post.preview.reddit_video_preview.height,
            width: post.preview.reddit_video_preview.width,
          });
          setIsMP4(true);
          setIsImage(false);
          return true;
        }
      }
      if (post.media) {
        if (post.media.reddit_video) {
          url = post.media.reddit_video.fallback_url;
          if (url.includes("DASH_1080") && !postMode) {
            url = url.replace("DASH_1080", `DASH_${optimize}`);
          }
          setVideoInfo({
            url: url,
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
          });
          if (post.media.reddit_video.fallback_url.includes("v.redd.it")) {
            findAudio(post.media.reddit_video.fallback_url);
          }
          setPlaceholderInfo({
            url: checkURL(post.thumbnail),
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
          });
          setImageInfo({
            url: checkURL(post?.thumbnail),
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
          });
          setIsMP4(true);
          setIsImage(false);
          return true;
        }
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
      if (post?.media_embed?.content) {
        if (post.media_embed.content.includes("iframe")) {
          let html: Element = stringToHTML(post.media_embed.content);
          html.setAttribute("height", "100%");
          html.setAttribute("width", "100%");
          let htmlsrc = html.getAttribute("src");
          if (htmlsrc.includes("clips.twitch.tv")) {
            html.setAttribute(
              "src",
              `https://clips.twitch.tv/embed?clip=${
                post?.url.split("/")?.[3]
              }&parent=${TWITCH_PARENT}`
            );
          }
          if (htmlsrc.includes("youtube.com")) {
            setytVidHeight({ height: `${Math.floor(windowHeight * 0.75)}px` });
            setisYTVid(true);
          }
          setIFrame(html);
          (context.columnOverride === 1 || allowIFrame) && setIsIFrame(true);
          return true;
        } else {
        }
      }
      return false;
    };

    const findImage = async () => {
      if (post.url.includes("twitter.com")) {
        setIsTweet(true);
        return true;
      }

      if (post.media_metadata) {
        let gallery = [];
        for (let i in post.media_metadata) {
          let image = post.media_metadata[i];
          if (image.p) {
            if (image.p.length > 0) {
              let num = image.p.length - 1;
              //console.log(num);
              gallery.push({
                url: checkURL(image.p[num].u.replace("amp;", "")),
                height: image.p[num].y,
                width: image.p[num].x,
              });
            }
          }
        }
        setGalleryInfo(gallery);
        setIsGallery(true);
        //setLoaded(true);
        return true;
      } else if (post.preview) {
        //images
        if (post.preview.images[0]) {
          if (post.preview.images[0].resolutions.length > 0) {
            let num = post.preview.images[0].resolutions.length - 1;

            //choose smallest image possible
            let done = false;
            let width = windowWidth; // screen.width;
            if (!imgFull) {
              width = width / (context?.columns ?? 1);
            }
            post.preview.images[0].resolutions.forEach((res, i) => {
              //console.log(width,res,i);
              if (!done) {
                if (res.width > width) {
                  num = i;
                  //console.log("DONE",num);
                  done = true;
                }
              }
            });
            let imgheight = post.preview?.images[0]?.resolutions[num].height;
            let imgwidth = post.preview?.images[0]?.resolutions[num].width;

            //if (imgheight = 0 || !imgheight) imgheight = 100;
            //if (imgwidth = 0 || !imgwidth) imgwidth = 100;
            setImageInfo({
              url: checkURL(
                post.preview?.images[0]?.resolutions[num].url.replace(
                  "amp;",
                  ""
                )
              ),
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
          }
        }
      } else if (post.url) {
        let purl: string = post.url;
        if (
          purl.includes(".jpg") ||
          purl.includes(".png") ||
          purl.includes(".gif")
        ) {
          await loadImg(purl);
          return true;
        }
      }
      return false;
    };

    const loadImg = async (purl) => {
      //let img =  Image()
      let img = document.createElement("img");
      setImageInfo({
        url: checkURL(purl),
        height: 1080,
        width: 1080,
      });
      setIsImage(true);
      img.onload = function (event) {
        // console.log("natural:", img.naturalWidth, img.naturalHeight);
        // console.log("width,height:", img.width, img.height);
        // console.log("offsetW,offsetH:", img.offsetWidth, img.offsetHeight);
        setImageInfo({
          url: checkURL(purl),
          height: img.naturalHeight,
          width: img.naturalWidth,
        });
        setIsImage(true);
      };
      img.src = purl;
      //document.body.appendChild(img);
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
  }, [post, allowIFrame, context?.columnOverride]);

  // useEffect(() => {
  //   const checkIfPortrait = () => {
  //     //console.log('media', imageInfo,videoInfo);
  //     if (imageInfo.height > imageInfo.width) {
  //       setIsPortrait(true);
  //       return true;
  //     }
  //     if (videoInfo.height > videoInfo.width) {
  //       setIsPortrait(true);
  //       return true;
  //     } else {
  //       return false;
  //     }
  //   };
  //   checkIfPortrait();
  //   return () => {
  //     setIsPortrait(false);
  //   };
  // }, [imageInfo, videoInfo]);

  const [imgheight, setheight] = useState({});
  const [maxheight, setmaxheight] = useState({});
  const [maxheightnum, setmaxheightnum] = useState<number>();
  useEffect(() => {
    let cropamount = 0.77;
    if (portraitMode) cropamount = 0.93;
    setheight({
      height: `${imageInfo.height}px`,
      maxHeight: `${Math.floor(
        windowHeight *
          (context?.columnOverride == 1 && !imgFull ? 0.75 : cropamount)
      )}px`,
    });
    setmaxheight({
      maxHeight: `${Math.floor(
        windowHeight *
          (context?.columnOverride == 1 && !imgFull ? 0.75 : cropamount)
      )}px`,
    });
    setmaxheightnum(
      Math.floor(
        windowHeight *
          (context?.columnOverride == 1 && !imgFull ? 0.75 : cropamount)
      )
    );
    return () => {
      setheight({});
      setmaxheight({});
      setmaxheightnum(0);
    };
  }, [imageInfo, context?.columnOverride, imgFull, portraitMode, windowHeight]);

  return (
    <div className="block select-none">
      {loaded && (
        <>
          {isTweet && (
            <div
              className={!imgFull && "flex justify-center " + " bg-transparent"}
            >
              <TwitterTweetEmbed
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
              style={
                imgFull && isYTVid
                  ? ytVidHeight
                  : imgFull ||
                    context?.columnOverride == 1 ||
                    windowHeight > windowWidth
                  ? {
                      height: `${
                        windowHeight < windowWidth
                          ? Math.floor(windowHeight * 0.75)
                          : Math.floor(windowHeight * 0.4)
                      }px`,
                    }
                  : {}
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
              style={
                imgFull || (context?.columnOverride == 1 && !postMode)
                  ? maxheight
                  : {}
              }
            >
              <Gallery
                images={galleryInfo}
                maxheight={
                  (postMode && imgFull) ||
                  (context.columnOverride == 1 && !postMode)
                    ? maxheightnum
                    : 0
                }
              />
            </div>
          ) : (
            ""
          )}

          {isImage && !isIFrame && !isMP4 ? (
            // <ImageHandler placeholder={placeholderInfo} imageInfo={imageInfo} />
            <div
              className={"relative block "}
              style={
                imgFull || (context?.columnOverride == 1 && !postMode)
                  ? imgheight
                  : {}
              }
            >
              {mediaLoaded ? (
                ""
              ) : (
                <div className="absolute w-16 h-16 -mt-8 -ml-8 border-b-2 rounded-full top-1/2 left-1/2 animate-spin"></div>
              )}

              <Image
                src={imageInfo.url}
                height={imageInfo.height}
                width={imageInfo.width}
                alt=""
                layout={
                  imgFull ||
                  (context?.columnOverride == 1 && !postMode) ||
                  imageInfo.url === "spoiler"
                    ? "fill"
                    : "responsive"
                }
                onLoadingComplete={onLoaded}
                lazyBoundary={imgFull ? "0px" : "2000px"}
                objectFit={
                  imgFull || context?.columnOverride == 1
                    ? "contain"
                    : "contain"
                }
                priority={imgFull}
                unoptimized={true}
                // placeholder="blur"
                // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKF5YDwADJAGVKdervwAAAABJRU5ErkJggg=="
              />
              {/* <MyImage imageInfo={imageInfo}/> */}
            </div>
          ) : (
            // <LazyLoad height={imageInfo.height}>
            //   <img src={imageInfo.url} alt="img" />
            // </LazyLoad>
            ""
          )}

          {isMP4 && !isIFrame ? (
            showMP4 ? (
              <div
                className="flex flex-col items-center flex-none "
                style={
                  imgFull || (context?.columnOverride == 1 && !postMode)
                    ? maxheight
                    : {}
                }
              >
                <LazyLoad
                  height={videoInfo.height}
                  once={true}
                  offset={2000}
                  unmountIfInvisible={false}
                >
                  <VideoHandler
                    placeholder={placeholderInfo}
                    videoInfo={videoInfo}
                    maxHeight={maxheight}
                    maxHeightNum={maxheightnum}
                    imgFull={imgFull}
                    audio={videoAudio}
                    postMode={postMode}
                  />
                </LazyLoad>
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
