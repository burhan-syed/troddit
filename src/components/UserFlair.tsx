import { useTheme } from "next-themes";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";

const UserFlair = ({ post }) => {
  const { theme } = useTheme();
  if (post?.author_flair_richtext?.length > 0 || post?.author_flair_text)
    return (
      <div
        className={`px-1 rounded-lg inline-block select-none ${
          post?.author_flair_text_color == "light"
            ? " text-lightText "
            : theme === "dark"
            ? "text-lightText"
            : "text-black"
        }`}
        style={{
          backgroundColor: `${
            post?.author_flair_background_color
              ? post?.author_flair_background_color
              : theme === "dark"
              ? " "
              : " "
          }`,
        }}
      >
        {post?.author_flair_richtext?.length > 0 ? (
          <div className="flex flex-row items-center justify-center group ">
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
                {e?.e == "text" && (
                  <h1 className="px-0.5 hidden group-hover:block   ">{e?.t}</h1>
                )}
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
