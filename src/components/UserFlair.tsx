import React from "react";
import { useTheme } from "next-themes";
import Image from "next/legacy/image";
import { useEffect, useState } from "react";

const UserFlair = ({ post }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  if (post?.author_flair_richtext?.length > 0 || post?.author_flair_text)
    return (
      <div
        className={`px-1 rounded-lg inline-block select-none ${
          post?.author_flair_text_color == "light"
            ? " text-white "
            : post?.author_flair_text_color == "dark"
            ? "text-black"
            : resolvedTheme === "light"
            ? "text-black"
            : "text-white"
        }`}
        style={{
          backgroundColor: `${
            post?.author_flair_background_color
              ? post?.author_flair_background_color
              : resolvedTheme === "light"
              ? ""
              : " #bbbb "
          }`,
        }}
      >
        {post?.author_flair_richtext?.length > 0 ? (
          <div className="flex flex-row items-center justify-center ">
            {post?.author_flair_richtext.map((e, i) => (
              <div key={i} className="">
                {e?.e == "emoji" && (
                  <Image
                    src={e?.u}
                    alt=""
                    unoptimized={true}
                    layout="intrinsic"
                    width={15}
                    height={15}
                    className="translate-y-0.5"
                  />
                )}
                {e?.e == "text" && <h1 className="">{e?.t}</h1>}
              </div>
            ))}
          </div>
        ) : (
          <div className="">{post?.author_flair_text}</div>
        )}
      </div>
    );
  return <></>;
};

export default UserFlair;
