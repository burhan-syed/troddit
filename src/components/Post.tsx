/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import LazyLoad from "react-lazyload";
import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";
import Gallery from "./Gallery";
import VideoHandler from "./VideoHandler";
import ImageHandler from "./ImageHandler";
import { forceCheck } from "react-lazyload";
import Markdown from "markdown-to-jsx";

import { useMainContext } from "../MainContext";
import PostModal from "./PostModal";
import { useRouter } from "next/dist/client/router";
import Iframe from "react-iframe";

const Post = ({ post }) => {
  const context: any = useMainContext();
  const [hide, setHide] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toLoad, setToLoad] = useState(false);
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [showMP4, setShowMP4] = useState(true);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({ url: "", height: 0, width: 0 });
  const [placeholderInfo, setPlaceholderInfo] = useState({
    url: "",
    height: 0,
    width: 0,
  });

  const [select, setSelect] = useState(false);

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const onLoaded = () => {
    setMediaLoaded(true);
  };

  const router = useRouter();

  //console.log(post);
  useEffect(() => {
    if (shouldLoad()) {
      initialize();
      setToLoad(true);
    } else {
      console.log("ERRRRRR");
    }
    forceCheck();
  }, [loaded]);

  useEffect(() => {
    !context.nsfw && post.over_18 ? setHide(true) : setHide(false);
    return () => {
      setHide(false);
    };
  }, [context, post]);

  const shouldLoad = () => {
    if (!post) return false;
    if (!post.url) return false;
    if (!post.title) return false;
    if (!post.subreddit) return false;
    //console.log(post);
    return true;
  };

  const initialize = async () => {
    const a = await findImage();
    const b = await findVideo();
    const c = await findIframe();
    //console.log(imageInfo, videoInfo, placeholderInfo);

    //checkURLs();
    a || b ? setLoaded(true) : setLoaded(false);
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
    const placeholder = "http://goo.gl/ijai22";
    if (!url) return placeholder;
    if (!url.includes("http")) return placeholder;
    return url;
  };

  const findVideo = async () => {
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        setVideoInfo({
          url: post.preview.reddit_video_preview.fallback_url,
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });

        setPlaceholderInfo({
          url: checkURL(post?.thumbnail),
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
          //height: post.prevt.thumbnail_height,
          //width: post.thumbnail_width,
        });
        //console.log(`${post.title}: ${imageInfo.url}`);
        setIsMP4(true);
        setIsImage(false);
        return true;
        //setLoaded(true);
      } else if (post.media) {
        if (post.media.reddit_video) {
          setVideoInfo({
            url: post.media.reddit_video.fallback_url,
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
          });
          setPlaceholderInfo({
            url: checkURL(post.thumbnail),
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
            //height: post.thumbnail_height,
            //width: post.thumbnail_width,
          });
          setIsMP4(true);
          setIsImage(false);
          //setLoaded(true);
          return true;
        }
      }
    }
    return false;
  };
  const [isIFrame, setIsIFrame] = useState(false);
  const [iFrame, setIFrame] = useState([]);
  const findIframe = async () => {
    if (post?.media_embed?.content) {
      if (post.media_embed.content.includes("iframe")) {
        post.media_embed.content.split('"').forEach((p) => {
          let a = p.replace('"', "");
          console.log(a);
          setIFrame((prev) => [...prev, a]);
        });
        setIsIFrame(true);
      } else {
        console.log(post.media_embed.content);
      }
    }
  };

  const findImage = async () => {
    //galleries
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
          //console.log(num);

          setImageInfo({
            url: checkURL(
              post.preview?.images[0]?.resolutions[num].url.replace("amp;", "")
            ),
            height: post.preview?.images[0]?.resolutions[num].height,
            width: post.preview?.images[0]?.resolutions[num].width,
          });
          setPlaceholderInfo({
            url: checkURL(post.thumbnail),
            height: post.thumbnail_height,
            width: post.thumbnail_width,
          });
          // try {
          //   const base64 = await imageToBase64(post.thumbnail.replace("amp;", ""));
          //   setBase64(base64);
          // } catch (err) {
          //   console.log(err);
          // }

          //console.log(imageInfo);
          setIsImage(true);
          //setLoaded(true);
          return true;
        }
      }
    }
    return false;
  };
  const [lastRoute, setLastRoute] = useState("");
  const [returnRoute, setReturnRoute] = useState("");

  useEffect(() => {
    if (lastRoute === router.asPath) {
      console.log("match");
      setSelect(false);
    }
    //don't add lastRoute to the array, breaks things
  }, [router.asPath]);

  const handleClick = () => {
    setLastRoute(router.asPath);
    setSelect(true);
    //need to handle pushing to [frontsort].. this kinda works (browser buttons don't work, app buttons do)
    if (router.query?.frontsort) {
      // router.push("/", post.permalink);
      // console.log("FRONSORT");
      setReturnRoute(router.asPath);
    } else {
      router.push("", post.permalink, { shallow: true });
    }
  };

  return (
    <div>
      {select && (
        <PostModal
          permalink={post?.permalink}
          setSelect={setSelect}
          returnRoute={returnRoute}
        />
      )}
      <div
        onClick={() => handleClick()}
        className="p-2 text-sm bg-white border border-gray-300 rounded-md shadow-sm dark:bg-trueGray-900 dark:border-trueGray-700 dark:hover:border-trueGray-500"
      >
        {toLoad && !hide ? (
          <div className="p-1 ">
            <h1>
              <a
                className="text-base"
                href={`https://www.reddit.com${post?.permalink ?? ""}`}
                target="_blank"
                rel="noreferrer"
              >
                {post?.title ?? ""}
              </a>
            </h1>
            <div className="flex flex-row text-xs font-light text-gray">
              <Link href={`/r/${post?.subreddit}`}>
                <a className="mr-1">r/{post?.subreddit ?? "ERR"}</a>
              </Link>
              <p>•</p>
              {/* <Link
              href={{
                pathname: "/u/[slug]",
                query: { slug: post?.author ?? "" },
              }}
            > */}
              <a className="ml-1 mr-1">u/{post?.author ?? ""}</a>
              {/* </Link> */}
              <p>•</p>

              <p className="ml-1">
                {Math.floor(
                  (Math.floor(Date.now() / 1000) - post.created_utc) / 3600
                )}
                hr
              </p>
              <div className="flex flex-row ml-auto">
                <p className="ml-1">{`(${post.domain})`}</p>
              </div>
            </div>
            <div className="pt-2 pb-2">
              {isIFrame ? (
                <div>
                  {/* <Iframe
                    url={iFrame[3]}
                    width={iFrame[5] + "px"}
                    height={iFrame[7 + "px"]}
                    allowFullScreen={true}
                    frameBorder={0}
                    scrolling={"no"}
                    id={"player"}
                  /> */}
                  <iframe
                    src={Iframe[3]}
                    height={Iframe[7]}
                    width={iFrame[5]}
                    allowFullScreen={true}
                  ></iframe>
                </div>
              ) : (
                ""
              )}

              {isGallery ? (
                <div className="flex flex-col items-center">
                  <Gallery images={galleryInfo} />{" "}
                </div>
              ) : (
                ""
              )}

              {isImage ? (
                // <ImageHandler placeholder={placeholderInfo} imageInfo={imageInfo} />
                <div className="relative ">
                  {mediaLoaded ? (
                    ""
                  ) : (
                    <div className="absolute w-16 h-16 -mt-8 -ml-8 border-b-2 rounded-full top-1/2 left-1/2 animate-spin"></div>
                  )}

                  <Image
                    src={imageInfo.url}
                    height={imageInfo.height}
                    width={imageInfo.width}
                    alt="image"
                    layout="responsive"
                    onLoadingComplete={onLoaded}
                    lazyBoundary={"2000px"}
                    // placeholder="blur"
                    // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKF5YDwADJAGVKdervwAAAABJRU5ErkJggg=="
                  />
                </div>
              ) : (
                // <LazyLoad height={imageInfo.height}>
                //   <img src={imageInfo.url} alt="img" />
                // </LazyLoad>
                ""
              )}

              {isMP4 ? (
                showMP4 ? (
                  <div className="flex flex-col items-center flex-none">
                    <LazyLoad
                      height={videoInfo.height}
                      once={true}
                      offset={2000}
                      unmountIfInvisible={false}
                      // placeholder={<Placeholder imageInfo={placeholder} />}
                    >
                      <VideoHandler
                        placeholder={placeholderInfo}
                        videoInfo={videoInfo}
                      />
                    </LazyLoad>
                  </div>
                ) : (
                  ""
                )
              ) : (
                ""
              )}

              {post.selftext ? (
                <Markdown className="overflow-y-scroll react-markdown max-h-60 overflow-ellipsis overscroll-contain">
                  {post.selftext}
                </Markdown>
              ) : (
                // <p className="overflow-y-scroll max-h-60 overflow-ellipsis overscroll-contain">{post.selftext}</p>
                ""
              )}
            </div>
            {/* <p>{post?.url ?? "ERR"}</p> */}

            <div className="flex flex-row text-xs align-bottom">
              <div className="flex flex-row items-center text-sm">
                <div className="flex-none border hover:cursor-pointer active:border-2">
                  <BiUpvote />
                </div>
                <p className="">{post?.score ?? "0"}</p>

                <div className="flex-none border hover:cursor-pointer active:border-2">
                  <BiDownvote />
                </div>
              </div>

              <a
                className="ml-auto hover:underline"
                href={`https://www.reddit.com${post?.permalink ?? ""}`}
                target="_blank"
                rel="noreferrer"
              >
                {`${post.num_comments} ${
                  post.num_comments === 1 ? "comment" : "comments"
                }`}
              </a>
            </div>
          </div>
        ) : (
          "NSFW"
        )}
      </div>
    </div>
  );
};

export default Post;
