import Image from "next/image";
import Link from "next/link";
import imageToBase64 from "image-to-base64/browser";

import LazyLoad from "react-lazyload";
import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";
import Gallery from "./Gallery";

const Post = ({ post }) => {
  const [loaded, setLoaded] = useState(false);
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({ url: "", height: 0, width: 0 });
  const [placeholder, setPlaceholder] = useState({
    url: "",
    height: 0,
    width: 0,
  });
  const [base64, setBase64] = useState(
    "iVBORw0KGgoAAAANSUhEUgAAAfQAAAAyCAYAAACqECmXAAAAuElEQVR42u3VMQ0AAAgDMPbi3y9ciCBpTTTpngIAXovQAUDoAIDQAQChAwBCBwChAwBCBwCEDgAIHQCEDgAIHQAQOgAgdAAQOgAgdABA6ACA0AFA6ACA0AEAoQMAQgcAoQMAQgcAhA4ACB0AhA4ACB0AEDoAIHQAEDoAIHQAQOgAgNABQOgAgNABAKEDAEIHAKEDAEIHAIQOAAgdAIQudAAQOgAgdABA6ACA0AFA6ACA0AEAoQMAZwGc6TYbROcIIwAAAABJRU5ErkJggg=="
  );
  //console.log(post);
  useEffect(() => {
   initialize();
  }, [loaded]);

  const initialize = async () => {
    const a = await findImage();
    const b = await findVideo();
    a || b ? setLoaded(true) : setLoaded(false);
  };

  const findVideo = async () => {
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        setVideoInfo({
          url: post.preview.reddit_video_preview.fallback_url,
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });

        setPlaceholder({
          url: post.thumbnail,
          height: post.thumbnail_height,
          width: post.thumbnail_width,
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
          setPlaceholder({
            url: post.thumbnail,
            height: post.thumbnail_height,
            width: post.thumbnail_width,
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
        if (image.p) {if (image.p.length > 0) {
          let num = image.p.length - 1;
          //console.log(num);
          gallery.push({
            url: image.p[num].u.replace("amp;", ""),
            height: image.p[num].y,
            width: image.p[num].x,
          });
        }}
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
          setPlaceholder({
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

  return (
    <div className="outline-black">
      <h1 className="mt-1 transition-all duration-100 ease-in-out group-hover:font-bold">
        <a href={`https://old.reddit.com/${post.permalink}`} target="_blank" rel="noreferrer">{post.title}</a>
      </h1>

      {isGallery ? <Gallery images={galleryInfo} /> : ""}

      {isImage ? (
        <Image
          src={imageInfo.url}
          height={imageInfo.height}
          width={imageInfo.width}
          alt="thumbnail"
          layout="responsive"
          placeholder="blur"
          blurDataURL={
            "iVBORw0KGgoAAAANSUhEUgAAAfQAAAAyCAYAAACqECmXAAAAuElEQVR42u3VMQ0AAAgDMPbi3y9ciCBpTTTpngIAXovQAUDoAIDQAQChAwBCBwChAwBCBwCEDgAIHQCEDgAIHQAQOgAgdAAQOgAgdABA6ACA0AFA6ACA0AEAoQMAQgcAoQMAQgcAhA4ACB0AhA4ACB0AEDoAIHQAEDoAIHQAQOgAgNABQOgAgNABAKEDAEIHAKEDAEIHAIQOAAgdAIQudAAQOgAgdABA6ACA0AFA6ACA0AEAoQMAZwGc6TYbROcIIwAAAABJRU5ErkJggg=="
          }
        />
      ) : (
        // <LazyLoad height={imageInfo.height}>
        //   <img src={imageInfo.url} alt="img" />
        // </LazyLoad>
        ""
      )}

      {isMP4 ? (
        <LazyLoad
          height={videoInfo.height}
          placeholder={<Placeholder imageInfo={imageInfo} />}
        >
          <video
            className=""
            autoPlay={true}
            muted
            loop
            preload="none"
            poster={imageInfo.url}
            playsInline
          >
            <source src={videoInfo.url} type="video/mp4" />
          </video>
        </LazyLoad>
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
      <Link href={{
          pathname: "/u/[slug]",
          query: { slug: post.author },
        }}>
        <a>u/{post.author}</a>
      </Link>
      <p>{post.score}</p>
    </div>
  );
};

export default Post;
