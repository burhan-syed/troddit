import SubButton from "./SubButton";
import SubInfoModal from "./SubInfoModal";

import { useState, useEffect } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import { loadSubredditInfo } from "../RedditAPI";
import { BsBoxArrowInUpRight } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { useSubsContext } from "../MySubs";
import router, { useRouter } from "next/router";
import SubMultiButton from "./SubMultiButton";

const SubredditBanner = ({ subreddits }) => {
  const router = useRouter();
  const subsContext: any = useSubsContext();
  const { currSubInfo, loadCurrSubInfo, multi } = subsContext;
  const [session] = useSession();
  const [subreddit, setSubreddit] = useState("");
  const [multiSub, setMultiSub] = useState("");
  const [subArray, setSubArray] = useState([]);
  const context: any = useMainContext();
  const [hideNSFW, sethideNSFW] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [openDescription, setOpenDescription] = useState(0);
  const [thumbURL, setThumbURL] = useState("");
  const [banner, setBanner] = useState({});
  // const [currSubInfo, setcurrSubInfo] = useState({
  //   submit_text_html: "",
  //   display_name: "",
  //   header_img: "",
  //   title: "",
  //   icon_size: [256, 256],
  //   primary_color: "",
  //   active_user_count: 0,
  //   icon_img: "",
  //   display_name_prefixed: "",
  //   accounts_active: 0,
  //   public_traffic: false,
  //   subscribers: 0,
  //   user_flair_richtext: [],
  //   name: "",
  //   quarantine: false,
  //   hide_ads: false,
  //   public_description: "",
  //   community_icon: "",
  //   banner_background_image: "",
  //   submit_text: "",
  //   description_html: "",
  //   spoilers_enabled: true,
  //   key_color: "",
  //   created: 0,
  //   wls: 6,
  //   submission_type: "",
  //   public_description_html: "",
  //   banner_img: "",
  //   banner_background_color: "",
  //   id: "",
  //   over18: false,
  //   description: "",
  //   lang: "",
  //   whitelist_status: "",
  //   url: "",
  //   created_utc: 0,
  //   banner_size: 0,
  //   mobile_banner_image: "",
  // });
  useEffect(() => {
    //loadcurrSubInfo(subreddit);
    if (subreddit.toUpperCase() === currSubInfo?.display_name?.toUpperCase()) {
      setBanner({
        backgroundImage: `url("${currSubInfo?.banner_background_image}")`,
        backgroundColor:
          currSubInfo?.banner_background_color.length > 1
            ? currSubInfo.banner_background_color
            : currSubInfo?.key_color,
      });

      setLoaded(true);
    }
  }, [currSubInfo, subreddit]);

  useEffect(() => {
    const loadSubInfo = async (sub) => {
      const info = await loadCurrSubInfo(sub);
      if (info?.name) {
        //setcurrSubInfo(info);
        //console.log(info);
        setBanner({
          backgroundImage: `url("${info?.banner_background_image}")`,
          backgroundColor:
            info?.banner_background_color.length > 1
              ? info.banner_background_color
              : info?.key_color,
        });
        setLoaded(true);
      }
    };

    if (multiSub.toUpperCase() !== currSubInfo?.display_name?.toUpperCase()) {
      loadSubInfo(multiSub);
    }
  }, [multiSub]);

  useEffect(() => {
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
  }, [currSubInfo]);

  useEffect(() => {
    setSubArray(subreddits);
    setSubreddit(subreddits?.[0]);
  }, [subreddits]);

  useEffect(() => {
    currSubInfo?.over18 && context.nsfw == "false"
      ? sethideNSFW(true)
      : sethideNSFW(false);
  }, [context.nsfw, currSubInfo.over18]);

  return (
    <div
      className={
        "w-full h-full -mt-2 " +
        (subArray.length === 1  && multi === ""
          ? "mb-2  md:mb-8 lg:mb-10"
          : " space-y-2 mb-2 md:space-y-3 md:mb-3 ")
      }
    >
      <div className="relative border-b shadow-xl dark:bg-trueGray-900 bg-lightPost border-lightBorder dark:border-darkBorder">
        <SubInfoModal
          toOpen={openDescription}
          descriptionHTML={currSubInfo?.description_html}
          displayName={currSubInfo?.display_name_prefixed}
        />
        <div className="">
          <div
            className={
              (hideNSFW && " blur-xl overflow-hidden") +
              ` w-full h-[150px] bg-cover bg-center flex items-center justify-center border-b-4 border-lightBorder `
            }
            style={banner}
          ></div>
          <div className="flex flex-col items-center justify-center w-11/12 mx-auto md:items-start">
            <div
              className="flex flex-row items-center w-24 h-24 -mt-12 overflow-hidden border-4 rounded-full border-lightBorder bg-lightPost dark:bg-trueGray-900"
              style={{ backgroundColor: currSubInfo?.primary_color }}
            >
              {thumbURL?.includes("https") ? (
                <Image
                  src={
                    // currSubInfo?.community_icon?.length > 1
                    //   ? currSubInfo?.community_icon
                    //   : currSubInfo?.icon_img?.length > 1
                    //   ? currSubInfo?.icon_img
                    //   : currSubInfo?.header_img?.length > 1
                    //   ? currSubInfo?.header_img
                    //     ? currSubInfo?.banner_img?.length > 1
                    //     : currSubInfo.banner_img
                    //   : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Flag_placeholder.svg/320px-Flag_placeholder.svg.png"
                    thumbURL
                  }
                  alt=""
                  height={currSubInfo?.icon_size?.[0] ?? 256}
                  width={currSubInfo?.icon_size?.[1] ?? 256}
                  unoptimized={true}
                  objectFit="cover"
                  className={"rounded-full " + (hideNSFW && " blur-xl ")}
                />
              ) : (
                <div
                  className="rounded-full dark:bg-trueGray-900 bg-lightPost"
                  style={{ backgroundColor: currSubInfo?.primary_color }}
                ></div>
              )}
            </div>
            <div className="flex items-center justify-center w-full pt-2 pb-1 md:justify-between">
              {loaded ? (
                <>
                  <h1 className="text-4xl">
                    {currSubInfo?.display_name_prefixed}
                  </h1>
                  <div className="hidden space-x-2 md:flex">
                    <SubButton sub={session ? currSubInfo.name : subreddit} />
                    {/* <SubMultiButton subreddits={subArray}/> */}
                  </div>
                </>
              ) : (
                <h1 className="text-4xl text-transparent">r/</h1>
              )}
            </div>
            <div className="flex p-1 space-x-2 text-gray-700 dark:text-gray-500">
              {loaded && (
                <>
                  <p>
                    {currSubInfo?.subscribers?.toLocaleString("en-US")} members,{" "}
                    {currSubInfo?.active_user_count?.toLocaleString("en-US")}{" "}
                    here
                  </p>
                  {currSubInfo?.over18 && (
                    <p className="text-red-400 text-color dark:text-red-700">
                      NSFW
                    </p>
                  )}
                </>
              )}
            </div>
            <div className="my-1 space-y-1 md:hidden">
              <SubButton sub={session ? currSubInfo.name : subreddit} />
              {/* <SubMultiButton subreddits={subArray}/> */}
            </div>
            <div className="p-1 pb-5 text-center md:text-left">
              {loaded ? (
                <p>{currSubInfo?.public_description}</p>
              ) : (
                <p className="py-2"></p>
              )}
              <div className="p-1"></div>
              <button
                className="px-2 py-1 text-sm border rounded-md dark:bg-darkBG border-lightBorder bg-lightPostHover dark:border-darkPostHover dark:border-2 hover:bg-lightHighlight dark:hover:bg-darkPostHover"
                onClick={() => setOpenDescription((s) => s + 1)}
              >
                Full Description
              </button>
            </div>
          </div>
        </div>
      </div>

      {(multi || subArray.length > 1)  && (
        <div
          className={
            (subArray?.length < 12 ? "md:w-11/12 mx-auto " : " ") + " flex items-center justify-start text-sm "
          }
        >
         
          <div className="flex space-x-2 overflow-x-scroll capitalize scrollbar-none">
            {subArray.map((s) => (
              <div
                onClick={() => setMultiSub(s)}
                className="flex items-center px-3 py-1 space-x-1 border rounded-full select-none dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover"
                key={s}
              >
                <h1>{s}</h1>
                <Link href={`${s}`}>
                  <a className="-mb-1">
                    <button className="rounded hover:cursor-pointer hover:ring-1 ring-gray-300 dark:ring-gray-600 dark:hover:ring-2 bg-lightPost dark:bg-trueGray-900">
                      <BsBoxArrowInUpRight className="w-4 h-4" />
                    </button>
                  </a>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubredditBanner;
