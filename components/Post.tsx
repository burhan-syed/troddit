import Image from "next/image";
import Link from "next/link";

import LazyLoad from "react-lazyload";
import { useEffect, useState } from "react";
import Placeholder from "./Placeholder";
const Post = ({ post }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadImage, setLoadImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [placeholder, setPlaceholder] = useState({
    url: "",
    height: 0,
    width: 0,
  });
  //console.log(post);
  useEffect(() => {
    findImage();
    // if (post.preview) {
    //   if (post.preview.images) {
    //     if (post.preview.images[0]) {
    //       //console.log(post.preview.images[0].source.url.replace('amp;', ''));
    //       setImageInfo({
    //         url: post.preview?.images[0]?.resolutions[3].url.replace(
    //           "amp;",
    //           ""
    //         ),
    //         height: post.preview?.images[0]?.resolutions[3].height,
    //         width: post.preview?.images[0]?.resolutions[3].width,
    //       });
    //       //console.log(imageInfo);
    //       setLoadImage(true);
    //     }
    //   }
    // }
  }, [loaded]);

  const findImage = () => {
    if (post.preview) {
      //vreddits
      if (post.preview.reddit_video_preview) {
        setImageInfo({
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
        setLoaded(true);
      } else if (post.media) {
        if (post.media.reddit_video) {
          setImageInfo({
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
          setLoaded(true);
        }
      } else if (post.preview.images[0]) {
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
          //console.log(imageInfo);
          setLoadImage(true);
          setLoaded(true);
        }
      }
    }
  };

  return (
    <div className="outline-black">
      {loadImage ? (
        <Image
          src={imageInfo.url}
          height={imageInfo.height}
          width={imageInfo.width}
          alt="thumbnail"
        />
      ) : (
        // <LazyLoad height={imageInfo.height}>
        //   <img src={imageInfo.url} alt="img" />
        // </LazyLoad>
        ""
      )}

      {isMP4 ? (
        <LazyLoad
          height={imageInfo.height}
          placeholder={<Placeholder url={placeholder.url} />}
        >
          <video
            autoPlay
            muted
            loop
            playsInline
            width={imageInfo.width}
            height={imageInfo.height}
          >
            <source src={imageInfo.url} type="video/mp4" />
          </video>
        </LazyLoad>
      ) : (
        ""
      )}

      <p className="mt-1 transition-all duration-100 ease-in-out group-hover:font-bold">
        {post.title}
      </p>
      <p>{post.url}</p>
      <Link href={`r/${post.subreddit}`}>
        <a>r/{post.subreddit}</a>
      </Link>
      <p>{post.score}</p>
    </div>
  );
};

export default Post;
