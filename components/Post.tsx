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
          console.log(post.preview.images[0].source.url.replace('amp;', ''));
          setImageInfo({
            url: post.preview.images[0].source.url.replace('amp;', ''),
            height: post.preview.images[0].source.height,
            width: post.preview.images[0].source.width,
          });
          //console.log(imageInfo);
          setLoadImage(true);
        }
      }
    }
  }, [post]);
  
  return (
    <div>
      {loadImage ? <Image 
      src={imageInfo.url}
      height={imageInfo.height}
      width={imageInfo.width}
      alt="thumbnail"
      /> : ""}

      <p className="mt-1 text-2xl transition-all duration-100 ease-in-out group-hover:font-bold">
        {post.title}
      </p>
    </div>
  );
};

export default Post;
