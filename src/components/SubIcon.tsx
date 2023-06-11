import Image from "next/legacy/image";
import { useState, useEffect } from "react";
import { useMainContext } from "../MainContext";

const SubIcon = ({ subname = "", subInfo = {}, isUser = false, size = 6 }) => {
  const [thumbURL, setThumbURL] = useState("");
  const [hideNSFW, setHideNSFW] = useState(true);
  const context: any = useMainContext();
  useEffect(() => {
    const subData: any = subInfo;
    if (subData?.over_18 && context.nsfw !== true) {
      setHideNSFW(true);
    } else {
      setHideNSFW(false);
    }
  }, [context.nsfw, subInfo]);

  useEffect(() => {
    const subData: any = subInfo;
    if (subData?.icon_url) {
      setThumbURL(subData.icon_url);
    } else {
      subData?.community_icon?.length > 1
        ? setThumbURL(subData?.community_icon?.replaceAll("amp;", ""))
        : subData?.icon_img?.length > 1
        ? setThumbURL(subData?.icon_img)
        : setThumbURL("");
    }
    return () => {
      //
    };
  }, [subInfo]);

  return (
    <>
      {thumbURL?.includes("https") && !hideNSFW ? (
        <Image
          src={thumbURL}
          alt=""
          height={50}
          width={50}
          unoptimized={true}
          objectFit="cover"
          className={"rounded-full "}
        />
      ) : (
        <div
          className={
            "rounded-full bg-th-accent " +
            " w-full h-full  text-white  overflow-hidden items-center justify-center flex !no-underline border-2 " +
            (hideNSFW ? " text-md " : " text-xl")
          }
        >
          {hideNSFW ? "18+" : isUser ? "u/" : "r/"}
          {/* {hideNSFW && (
            <span className="absolute ml-16 text-xs opacity-70 ">{"18+"}</span>
          )} */}
        </div>
      )}
    </>
  );
};

export default SubIcon;
