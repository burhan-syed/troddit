import React from "react";
import Image from "next/legacy/image";
import Link from "next/link";
import router from "next/router";
import { useEffect, useState } from "react";
import { numToString, secondsToDate } from "../../../lib/utils";
import { useMainContext } from "../../MainContext";
import SubButton from "../SubButton";
import SubOptButton from "../SubOptButton";
import { BsBoxArrowInUpRight } from "react-icons/bs";
import Login from "../Login";
import SubIcon from "../SubIcon";
import useRefresh from "../../hooks/useRefresh";
import { useSession } from "next-auth/react";
import { GrRefresh } from "react-icons/gr";
import { IoMdRefresh } from "react-icons/io";

const SubCard = ({
  data,
  link = true,
  tall = false,
  subInfo = undefined,
  currMulti = undefined,
  subArray = undefined,
  openDescription = () => {},
  isSelf = false,
}) => {
  const context: any = useMainContext();
  const session = useSession();
  const { invalidateKey, refreshCurrent } = useRefresh();
  const [thumbURL, setThumbURL] = useState("");
  const [subBanner, setBanner] = useState<any>({});
  const [hideNSFW, setHideNSFW] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    //console.log(data);
    let currSubInfo = data?.data;
    if (data.kind === "t2" && data?.data?.subreddit) {
      currSubInfo = data.data.subreddit;
    }
    let bannerurl = "";
    if (currSubInfo?.banner_background_image?.length > 0) {
      bannerurl = currSubInfo?.banner_background_image?.replaceAll("amp;", "");
    } else if (currSubInfo?.banner_img?.length > 0) {
      bannerurl = currSubInfo?.banner_img?.replaceAll("amp;", "");
    }
    setBanner({
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
    //data?.kind === 't2' || data?.kind === 't5' &&
    setLoading(false);
    return () => {
      setThumbURL("");
      setBanner({});
      setLoading(true);
    };
  }, [data, link]);

  useEffect(() => {
    if (data?.data?.over18 && context.nsfw !== true) {
      setHideNSFW(true);
    } else {
      setHideNSFW(false);
    }
  }, [context.nsfw, data]);

  const main = (
    <div
      className={
        "relative  transition-colors bg-contain border  shadow-md bg-th-post  " +
        (tall ? "  " : " rounded-lg ") +
        (tall
          ? " border-transparent  border-b-th-border "
          : " group hover:bg-th-postHover border-th-border hover:shadow-2xl  hover:cursor-pointer ")
      }
    >
      <div
        className={
          ` absolute  w-full  bg-cover bg-center  ` +
          (tall ? " " : " rounded-t-lg ") +
          (tall ? " h-[121px] border-b " : " h-16") +
          (hideNSFW ||
          (subBanner?.backgroundImage?.length < 9 &&
            subBanner?.backgroundColor?.length < 2)
            ? "  bg-th-scrollbar "
            : "")
        }
        style={hideNSFW ? {} : subBanner}
      ></div>

      <div
        className={
          "flex flex-col my-2 " +
          (tall ? " md:h-40 mx-6 md:mx-16 " : "  h-24  mx-2 ")
        }
      >
        <div
          className={
            "flex  " +
            (tall ? " mt-[4.5rem] flex-col md:flex-row " : " mt-6 flex-row")
          }
        >
          <div
            className={
              "z-20 flex-none  border-4 hover:cursor-pointer rounded-full bg-th-post " +
              (tall ? " -mt-2 w-24 h-24 mx-auto md:mx-0" : " w-16 h-16")
            }
            onClick={() => {
              !link && openDescription(); //context.setForceRefresh((p) => p + 1);
            }}
          >
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
                  "rounded-full bg-th-scrollbar " +
                  " w-full h-full  text-white text-6xl overflow-hidden items-center justify-center flex relative "
                }
              >
                {data?.kind === "t2" ? "u/" : data?.kind === "t5" ? "r/" : " "}
                {hideNSFW && (
                  <span
                    className="absolute right-0 opacity-70 "
                    style={{ fontSize: "0.5rem" }}
                  >
                    {"18+"}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex flex-col ">
            <div
              className={
                "z-10 flex flex-row mx-auto    space-x-2  pl-auto bg-th-post " +
                (tall
                  ? " md:border-t  md:border-r md:pt-[6px] md:pb-[-3px] items-end mt-4 md:mt-[10px] md:rounded-tr-md md:pl-5 md:pr-2  md:-ml-3.5 md:mx-0"
                  : " items-baseline group-hover:bg-th-postHover pt-0.5 mt-2 rounded-tr-md pl-5 pr-2  -ml-3.5")
              }
            >
              {loading ? (
                <>
                  <div className="h-6 w-52"></div>
                </>
              ) : (
                <>
                  <Link
                    legacyBehavior
                    href={
                      data?.kind === "t2"
                        ? `/u/${data?.data?.name}`
                        : `/r/${data?.data?.display_name}`
                    }
                    passHref
                  >
                    <a>
                      <h1
                        className={
                          "font-semibold hover:cursor-pointer hover:underline group-hover:underline" +
                          (tall
                            ? ` ${data?.kind ? "mb-[-0.075rem]" : ""} `
                            : " ")
                        }
                        onClick={() => {
                          !link && data?.kind === "t2"
                            ? invalidateKey([
                                "feed",
                                session?.data?.user?.name === data?.data?.name
                                  ? "SELF"
                                  : "USER",
                                data?.data?.name,
                              ])
                            : invalidateKey([
                                "feed",
                                "SUBREDDIT",
                                data?.data?.display_name,
                              ]); //context.setForceRefresh((p) => p + 1);
                        }}
                      >
                        {data?.kind === "t2"
                          ? `u/${data?.data?.name}`
                          : data?.data?.display_name_prefixed ?? (
                              <div className="w-16 text-transparent">
                                {"loading.."}
                              </div>
                            )}
                      </h1>
                    </a>
                  </Link>
                  {!link && (data?.data?.url || data?.data?.subreddit?.url) && (
                    <a
                      href={`https://www.reddit.com${
                        data?.data?.url ?? data?.data?.subreddit?.url
                      }`}
                      target={"_blank"}
                      rel="noreferrer"
                      className="mb-3 ml-2 rounded hover:bg-th-postHover"
                    >
                      <BsBoxArrowInUpRight className="w-3 h-3 -ml-1 hover:scale-110 " />
                    </a>
                  )}

                  <h1 className="text-xs font-semibold pb-0.5">
                    {data?.kind === "t2" &&
                    (data?.data?.comment_karma || data?.data?.link_karma) ? (
                      `${numToString(
                        parseInt(data?.data?.comment_karma) +
                          parseInt(data?.data?.link_karma),
                        1000
                      )} karma`
                    ) : data?.data?.subscribers ? (
                      `${data?.data?.subscribers?.toLocaleString(
                        "en-US"
                      )} members`
                    ) : (
                      <div className={"w-40"}></div>
                    )}
                  </h1>
                  {!link && data?.data?.active_user_count && (
                    <span className="text-xs font-semibold opacity-70 pb-0.5">
                      {data?.data?.active_user_count?.toLocaleString("en-US")}{" "}
                      here
                    </span>
                  )}
                  {(data?.data?.over18 || data?.data?.subreddit?.over_18) && (
                    <>
                      <span className="text-xs text-th-red pb-0.5">NSFW</span>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        <div
          className={
            "flex flex-row   " +
            (tall ? " md:ml-[6.25rem]  mt-2  md:-mt-3 " : " pl-5 ml-[3.25rem]")
          }
        >
          <h1
            className={
              " text-xs overflow-x-hidden overflow-y-scroll scrollbar-none md:mx-0" +
              (tall
                ? " text-center md:text-left md:h-8 md:-mt-6 mx-auto "
                : " -mt-6 h-8")
            }
          >
            {data?.data?.subreddit?.public_description ??
              data?.data?.public_description}
          </h1>
          <div
            className={
              "relative  mb-auto ml-auto mt-[-1.6rem] space-x-1 " +
              (tall ? " hidden md:flex  flex-row  " : " ")
            }
          >
            {isSelf ? (
              <div
                className={
                  "w-24 text-center flex justify-center items-center rounded-md bg-th-background2 border border-th-border hover:border-th-borderHighlight  focus:outline-none  p-1"
                }
              >
                <Login />
              </div>
            ) : (
              <div className="flex-none w-24 h-full ml-2">
                <SubButton
                  sub={
                    data?.kind == "t5"
                      ? data?.data?.display_name
                      : data?.data?.subreddit?.display_name
                  }
                  userMode={data?.kind === "t2"}
                />
              </div>
            )}
            {data?.kind == "t5" && !link && (
              <SubOptButton
                subInfo={subInfo}
                currMulti={currMulti}
                subArray={subArray}
                openDescription={openDescription}
              />
            )}
          </div>
        </div>
        {tall && (
          <div
            className={
              "z-20 md:hidden flex flex-row mx-auto mt-2 space-x-1  min-w-full justify-between" +
              (tall ? "  " : "")
            }
          >
            {isSelf ? (
              <div
                className={
                  "mx-auto w-24 text-center flex justify-center items-center rounded-md bg-th-background2 border-th-border hover:border-th-borderHighlight border focus:outline-none  p-1"
                }
              >
                <Login />
              </div>
            ) : (
              <div className="w-full">
                <SubButton
                  sub={
                    data?.kind == "t5"
                      ? data?.data?.display_name
                      : data?.data?.subreddit?.display_name
                  }
                  userMode={data?.kind === "t2"}
                />
              </div>
            )}
            {data?.kind == "t5" && !link && (
              <SubOptButton
                subInfo={subInfo}
                currMulti={currMulti}
                subArray={subArray}
                openDescription={openDescription}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (link)
    return (
      <Link
        legacyBehavior
        href={
          data?.kind === "t5"
            ? data?.data?.url
            : data?.data?.subreddit?.url?.replace("/user/", "/u/") ?? "/"
        }
      >
        {main}
      </Link>
    );

  return <>{main}</>;
};

export default SubCard;
