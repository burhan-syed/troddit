import Image from "next/image";
import { useEffect, useState } from "react";
const Post = ({ post }) => {
  const [loadImage, setLoadImage] = useState(false);

  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  //console.log(post);
  useEffect(() => {
    if (post.preview) {
      if (post.preview.images) {
        if (post.preview.images[0]) {
          //console.log(post.preview.images[0].source.url.replace('amp;', ''));
          setImageInfo({
            url: post.preview.images[0]?.resolutions[3].url.replace("amp;", ""),
            height: post.preview.images[0]?.resolutions[3].height,
            width: post.preview.images[0]?.resolutions[3].width,
          });
          //console.log(imageInfo);
          setLoadImage(true);
        }
      }
    }
  }, [post]);

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
        ""
      )}

      <p className="mt-1 transition-all duration-100 ease-in-out group-hover:font-bold">
        {post.title}
      </p>
      <p>r/{post.subreddit}</p>
      <p>{post.score}</p>
    </div>
  );
};

export default Post;
