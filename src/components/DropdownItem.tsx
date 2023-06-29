import { useRouter } from "next/router";
import Image from "next/legacy/image";
import React, { useState, useEffect } from "react";
import { loadSubredditInfo } from "../RedditAPI";
import FavoriteButton from "./FavoriteButton";

const DropdownItem = ({ sub, isUser = false, showFavorite = true }) => {
  const [loaded, setLoaded] = useState(false);
  const [thumbURL, setThumbURL] = useState("");
  const [isMulti, setisMulti] = useState(false);
  const router = useRouter();
  useEffect(() => {
    sub?.data?.subreddits ? setisMulti(true) : setisMulti(false);
    const findThumbnail = (sub) => {
      if (sub?.data?.icon_url) {
        setThumbURL(sub.data.icon_url);
      } else {
        sub?.data?.community_icon?.length > 1
          ? setThumbURL(sub?.data?.community_icon?.replaceAll("amp;", ""))
          : sub?.data?.icon_img?.length > 1
          ? setThumbURL(sub?.data?.icon_img?.replaceAll("amp;", ""))
          : setThumbURL("");
        // : sub?.data?.header_img?.length > 1 &&
        //   setThumbURL(sub?.data?.header_img);
      }
    };


    if (sub?.kind == "t5" || sub?.kind == "t2" || sub?.data?.icon_url) {
      findThumbnail(sub);
    } else if (
      sub?.data?.display_name &&
      !(sub?.data?.subreddits?.length > 0)
    ) {
      setThumbURL("");
      //console.log(sub?.data?.display_name);
      //findSubInfo(sub);
      //causing alot of extra api calls, not doing this for now
    } else setThumbURL("");
    if (sub?.data) {
      setLoaded(true);
    }

    return () => {};
  }, [sub]);

  const Line = (
    <div
      className="flex flex-row items-center text-sm text-center cursor-pointer group"
      // onClick={(e) => !preventNav && goTo(e)}
    >
      {/* Image */}
      <div className="flex flex-row items-center flex-none w-6 h-6 ml-1 ">
        {thumbURL?.includes("https://") ? (
          <Image
            src={thumbURL}
            alt="sub"
            height={sub.data?.icon_size?.[0] ?? 256}
            width={sub.data?.icon_size?.[1] ?? 256}
            unoptimized={true}
            objectFit="cover"
            className={
              (isMulti ? "rounded" : "rounded-full") + " flex-none border "
            }
          />
        ) : (
          loaded && (
            <div
              className={
                (isMulti
                  ? "rounded bg-th-red"
                  : "rounded-full bg-th-accent border-2 ") +
                " w-6 h-6 text-center text-white overflow-hidden flex items-center justify-center  text-lg"
              }
            >
              <span className={isMulti ? "" : "" + "mb-0.5"}>
                {isUser ? "u/" : isMulti ? "f" : "r/"}
              </span>
            </div>
          )
        )}
      </div>
      {/* Text */}
      <h1 className="ml-2 truncate">
        {isMulti
          ? sub.data?.name
          : sub.data?.display_name_prefixed ??
            sub.data?.display_name?.replace("u_", "")}
        {/* {isUser && router?.query?.slug?.[0].toString()} */}
      </h1>
      {showFavorite && !isMulti && (
        <div className="ml-auto">
          <FavoriteButton
            sub={sub}
            favorited={sub?.data?.user_has_favorited}
            isUser={isUser}
          />
        </div>
      )}
    </div>
  );

  return <>{Line}</>;
};

export default DropdownItem;
