import { useState } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";

const TitleFlair = ({ post }) => {
  //const flair_color = post?.link_flair_background_color ?? "#343535";
  //post?.link_flair_text_color == "dark" && 

  return (
    <div
      className={`p-0.5 px-1 rounded-lg inline-block select-none ${
        (post?.link_flair_text_color == "light" ? " text-lightText " : "text-black")
      }`}
      style={{ backgroundColor: `${post?.link_flair_background_color ? post?.link_flair_background_color : "#EDEFF1"}` }}
    >
      {/* <Link href={`/r/${post?.subreddit}?f=flair_name%3A"${post?.link_flair_text}"`}> */}
      
      
      <div className="flex flex-row items-center justify-center" >
        {post?.link_flair_richtext.map((e) => (
          <>
            {e?.e == "emoji" && (
              <Image
                src={e?.u}
                alt=""
                unoptimized={true}
                layout="intrinsic"
                width={15}
                height={15}
              />
            )}
            {e?.e == "text" && <h1 className="px-0.5">{e?.t}</h1>}
          </>
        ))}
      </div>
      {/* </Link> */}
    </div>
  );
};

export default TitleFlair;
