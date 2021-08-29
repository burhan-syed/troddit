/* eslint-disable @next/next/no-img-element */
import Image from "next/image";
import Link from "next/link";
import imageToBase64 from "image-to-base64/browser";

import LazyLoad from "react-lazyload";
import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";
import Gallery from "./Gallery";
import image from "next/image";
import VideoHandler from "./VideoHandler";

const Post = ({ post }) => {
  const [loaded, setLoaded] = useState(false);
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({ url: "", height: 0, width: 0 });
  const [placeholderInfo, setPlaceholderInfo] = useState({
    url: "",
    height: 0,
    width: 0,
  });

  //console.log(post);
  useEffect(() => {
    initialize();
  }, [loaded]);

  const initialize = async () => {
    const a = await findImage();
    const b = await findVideo();
    checkURLs();
    a || b ? setLoaded(true) : setLoaded(false);
  };

  //if deleted by copyright notice may be set to 'self'
  const checkURLs = () => {
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

  const findVideo = async () => {
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        setVideoInfo({
          url: post.preview.reddit_video_preview.fallback_url,
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });

        setPlaceholderInfo({
          url: post?.thumbnail,
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
            url: post.thumbnail,
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
              url: image.p[num].u.replace("amp;", ""),
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
            url: post.preview?.images[0]?.resolutions[num].url.replace(
              "amp;",
              ""
            ),
            height: post.preview?.images[0]?.resolutions[num].height,
            width: post.preview?.images[0]?.resolutions[num].width,
          });
          setPlaceholderInfo({
            url: post.thumbnail,
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

  const [videoLoaded, setVideoLoaded] = useState(false);
  const onLoadedData = () => {
    console.log("loaded");
    setVideoLoaded(true);
  };

  return (
    <div className="outline-black">
      <h1 className="">
        <a
          href={`https://www.reddit.com/${post.permalink}`}
          target="_blank"
          rel="noreferrer"
        >
          {post.title}
        </a>
      </h1>

      {isGallery ? <Gallery images={galleryInfo} /> : ""}

      {isImage ? (
        <Image
          src={imageInfo.url} //{loaded ? imageInfo.url : imgPlaceholder}
          height={imageInfo.height}
          width={imageInfo.width}
          alt="thumbnail"
          layout="responsive"
        />
      ) : (
        // <LazyLoad height={imageInfo.height}>
        //   <img src={imageInfo.url} alt="img" />
        // </LazyLoad>
        ""
      )}

      {isMP4 ? (
        <div className="flex flex-wrap content-center">
          <p>{videoInfo.height}</p>
          <LazyLoad
            height={videoInfo.height}
            once={true}
            // placeholder={<Placeholder imageInfo={placeholder} />}
          >
            <VideoHandler placeholder={placeholderInfo} videoInfo={videoInfo} />
          </LazyLoad>
        </div>
      ) : (
        ""
      )}

      <p>{post.url}</p>
      <Link
        href={{
          pathname: "/r/[slug]",
          query: { slug: post.subreddit },
        }}
      >
        <a>r/{post.subreddit}</a>
      </Link>
      <Link
        href={{
          pathname: "/u/[slug]",
          query: { slug: post.author },
        }}
      >
        <a>u/{post.author}</a>
      </Link>
      <p>{post.score}</p>
    </div>
  );
};

export default Post;
