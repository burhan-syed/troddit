import { useSession } from "next-auth/client";
import Image from "next/image";
import Link from "next/dist/client/link";
import router from "next/router";
import { useEffect, useState } from "react";
import { numToString, secondsToDate } from "../../../lib/utils";
import { useMainContext } from "../../MainContext";
import SubButton from "../SubButton";
import SubOptButton from "../SubOptButton";

const SubCard = ({ data }) => {
  const context: any = useMainContext();
  const [thumbURL, setThumbURL] = useState("");
  const [subBanner, setBanner] = useState<any>({});
  const [hideNSFW, setHideNSFW] = useState(false);
  const [session, sessloading] = useSession();
  useEffect(() => {
    let currSubInfo = data?.data;
    if (data.kind === "t2" && data?.data?.subreddit)
      currSubInfo = data.data.subreddit;
    let bannerurl = "";
    if (currSubInfo?.banner_background_image?.length > 0) {
      bannerurl = currSubInfo?.banner_background_image?.replaceAll("amp;", "");
    } else if (currSubInfo?.banner_img?.length > 0) {
      bannerurl = currSubInfo?.banner_img?.replaceAll("amp;", "");
    }
    setBanner({
      zIndex: -1,
      backgroundImage: `url("${bannerurl}")`,
      backgroundColor:
        currSubInfo?.banner_background_color?.length > 1
          ? currSubInfo.banner_background_color
          : currSubInfo?.key_color?.length > 1
          ? currSubInfo.key_color
          : "",
    });

    if (currSubInfo?.icon_url) {
      setThumbURL(currSubInfo.icon_url);
    } else {
      currSubInfo?.community_icon?.length > 1
        ? setThumbURL(currSubInfo?.community_icon?.replaceAll("amp;", ""))
        : currSubInfo?.icon_img?.length > 1
        ? setThumbURL(currSubInfo?.icon_img)
        : setThumbURL("");
      // : currSubInfo?.header_img?.length > 1 &&
      //   setThumbURL(currSubInfo?.header_img);
    }
    return () => {
      setThumbURL("");
      setBanner({});
    };
  }, [data]);

  useEffect(() => {
    if (data?.data?.over18 && context.nsfw !== "true") {
      setHideNSFW(true);
    } else {
      setHideNSFW(false);
    }
  }, [context.nsfw]);

  return (
    <Link
      href={
        data?.kind === "t5"
          ? data?.data?.url
          : data?.data?.subreddit?.url?.replace("/user/", "/u/")
      }
    >
      <a>
        <div
          className={
            "relative z-0 transition-colors bg-contain border border-gray-300 shadow-md bg-lightPost hover:bg-lightPostHover dark:hover:bg-darkPostHover hover:cursor-pointer hover:shadow-2xl dark:bg-darkBG dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-400 group" +
            (context?.cardStyle === "row1" ||
            context?.cardStyle === "card2" ||
            context?.mediaOnly
              ? "  "
              : " rounded-md ")
          }
          //   onClick={(e) => {
          //     e.preventDefault();
          //     router.push(
          //       data?.kind === "t5"
          //         ? data?.data?.url
          //         : data?.data?.subreddit?.url?.replace("/user/", "/u/")
          //     );
          //   }}
        >
          <div
            className={
              ` absolute  w-full h-16 bg-cover bg-center bg-blue-400 dark:bg-red-800 ` +
              (context?.cardStyle === "row1" ||
              context?.cardStyle === "card2" ||
              context?.mediaOnly
                ? "  "
                : " rounded-t-md ")
            }
            style={hideNSFW ? {} : subBanner}
          ></div>

          <div className="flex flex-col h-24 mx-2 my-2 ">
            <div className="flex flex-row translate-y-6 ">
              <div className="z-10 flex-none w-16 h-16 border-2 rounded-full dark:bg-darkBG bg-lightPost">
                {thumbURL?.includes("https") && !hideNSFW ? (
                  <Image
                    src={thumbURL}
                    alt=""
                    height={data?.data?.icon_size?.[0] ?? 256}
                    width={data?.data?.icon_size?.[1] ?? 256}
                    unoptimized={true}
                    objectFit="cover"
                    className={"rounded-full "}
                  />
                ) : (
                  <div
                    className={
                      "rounded-full bg-blue-700" +
                      " w-full h-full  text-lightText text-6xl overflow-hidden items-center justify-center flex"
                    }
                  >
                    {data?.kind === "t5" ? "r/" : "u/"}
                  </div>
                )}
              </div>
              <div className="flex flex-col ">
                <div className="flex flex-row items-baseline p-1 pb-2 pl-5 pr-2 space-x-2 -translate-x-3 translate-y-2 rounded-tr-md pl-auto dark:bg-darkBG bg-lightPost dark:group-hover:bg-darkPostHover group-hover:bg-lightPostHover">
                  <h1 className="font-semibold group-hover:underline">
                    {data?.kind === "t5"
                      ? data?.data?.display_name_prefixed
                      : `u/${data?.data?.name}`}
                  </h1>
                  <h1 className="text-xs font-semibold">
                    {data?.kind === "t5"
                      ? `${data?.data?.subscribers?.toLocaleString(
                          "en-US"
                        )} members`
                      : `${numToString(
                          data?.data?.comment_karma ??
                            0 + data?.data?.link_karma ??
                            0,
                          1000
                        )} karma`}
                  </h1>
                  {(data?.data?.over18 || data?.data?.subreddit?.over_18) && (
                    <>
                      <p>•</p>
                      <span className="text-xs text-red-400 text-color dark:text-red-700">
                        NSFW
                      </span>
                    </>
                  )}
                </div>
                {/* <h1>{secondsToDate(data?.data?.created)}</h1> */}
              </div>
            </div>
            <div className="flex flex-row pl-5 ml-16 -translate-x-3 ">
              <h1 className="h-8 overflow-x-hidden overflow-y-scroll text-xs scrollbar-none">
                {data?.data?.public_description}
              </h1>
              <div className="mb-auto ml-auto  -translate-y-0.5 flex flex-row relative ">
                <SubButton
                  sub={
                    data?.kind == "t5"
                      ? session
                        ? data?.data?.name
                        : data?.data?.display_name
                      : session
                      ? data?.data?.subreddit?.name
                      : data?.data?.subreddit?.display_name
                  }
                  userMode={data?.kind === "t2"}
                />
                {/* {data?.kind === "t5" && (
              <div className="z-50">
                <SubOptButton
                  subInfo={data.data}
                  currMulti={undefined}
                  subArray={[data?.data?.display_name]}
                />
              </div>
            )} */}
              </div>
            </div>
          </div>
        </div>
      </a>
    </Link>
  );
};

export default SubCard;
