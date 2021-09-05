/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";

import LazyLoad from "react-lazyload";
import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";
import Gallery from "./Gallery";
import VideoHandler from "./VideoHandler";
import ImageHandler from "./ImageHandler";

import { useMainContext } from "../MainContext";

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

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const onLoaded = () => {
    console.log("loaded");
    setMediaLoaded(true);
  };

  //console.log(post);
  useEffect(() => {
    if (shouldLoad()) {
      initialize();
      setToLoad(true);
    } else {
      console.log("ERRRRRR");
    }
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

  return (
    <div className="p-2 text-sm text-white bg-black shadow-sm">
      {toLoad && !hide ? (
        <div className="p-1 ">
          <h1>
            <a
              className="text-base"
              href={`https://www.reddit.com/${post?.permalink ?? ""}`}
              target="_blank"
              rel="noreferrer"
            >
              {post?.title ?? "ERR"}
            </a>
          </h1>
          <div className="flex flex-row text-xs text-gray">
            <Link
              href={{
                pathname: "/r/[slug]",
                query: { slug: post?.subreddit ?? "" },
              }}
            >
              <a className="mr-1">r/{post?.subreddit ?? "ERR"}</a>
            </Link>
            <p>•</p>
            <Link
              href={{
                pathname: "/u/[slug]",
                query: { slug: post?.author ?? "" },
              }}
            >
              <a className="ml-1 mr-1">u/{post?.author ?? ""}</a>
            </Link>
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
            {isGallery ? <Gallery images={galleryInfo} /> : ""}

            {isImage ? (
              // <ImageHandler placeholder={placeholderInfo} imageInfo={imageInfo} />
              <div className="relative ">
                {mediaLoaded ? (
                  ""
                ) : (
                  <div className="absolute w-16 h-16 -mt-8 -ml-8 border-b-2 border-gray-900 rounded-full top-1/2 left-1/2 animate-spin"></div>
                )}

                <Image
                  src={imageInfo.url}
                  height={imageInfo.height}
                  width={imageInfo.width}
                  alt="image"
                  layout="responsive"
                  onLoadingComplete={onLoaded}
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
                <div>
                  <LazyLoad
                    height={videoInfo.height}
                    once={true}
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
              <p className="truncate ...">{post.selftext}</p>
            ) : (
              ""
            )}
          </div>
          {/* <p>{post?.url ?? "ERR"}</p> */}

          <div className="flex flex-row text-xs align-bottom">
            <p className="">{post?.score ?? "0"}</p>

            <a
              className="ml-auto"
              href={`https://www.reddit.com/${post?.permalink ?? ""}`}
              target="_blank"
              rel="noreferrer"
            >
              {`${post.num_comments} comments`}
            </a>
          </div>
        </div>
      ) : (
        "NSFW"
      )}
    </div>
  );
};

export default Post;
