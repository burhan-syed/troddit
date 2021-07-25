import Image from "next/image";

const Post = ({ post }) => {
  console.log(post);
  return (
    <div>
     {/*  {post.url.includes(".jpg") ? <Image
        layout='responsive'
        src={post.url}
        height={post.thumbnail_height}
        width={post.thumbnail_weight}
        alt="thumbnail"
      /> : "fail2"} */}
      
      <p className="mt-1 text-2xl transition-all duration-100 ease-in-out group-hover:font-bold">
        {post.title}
      </p>
    </div>
  );
};

export default Post;
