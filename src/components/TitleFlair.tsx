import { useState } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";

const TitleFlair = ({ post }) => {
  //const flair_color = post?.link_flair_background_color ?? "#343535";
  //post?.link_flair_text_color == "dark" &&

  if (post?.link_flair_richtext?.length > 0 || post?.link_flair_text)
    return (
      <div
        className={`p-0.5 px-1 rounded-lg inline-block select-none ${
          post?.link_flair_text_color == "light"
            ? " text-lightText "
            : "text-black"
        }`}
        style={{
          backgroundColor: `${
            post?.link_flair_background_color
              ? post?.link_flair_background_color
              : "#EDEFF1"
          }`,
        }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <Link
          href={`/r/${
            post?.subreddit
          }/search?sort=new&q=flair%3A${encodeURIComponent(
            post?.link_flair_text
          )}`}
        >
          <a>
            {post?.link_flair_richtext?.length > 0 ? (
              <div className="flex flex-row items-center justify-center">
                {post?.link_flair_richtext.map((e, i) => (
                  <div key={i}>
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
                    {e?.e == "text" && (
                      <h1 className="px-0.5 hover:underline">{e?.t}</h1>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="hover:underline">{post?.link_flair_text}</div>
            )}
          </a>
        </Link>
      </div>
    );
  return <></>;
};

export default TitleFlair;
