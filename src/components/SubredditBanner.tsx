import SubButton from "./SubButton";
import SubInfoModal from "./SubInfoModal";

import { useState, useEffect } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import { loadSubredditInfo } from "../RedditAPI";
import { BsBoxArrowInUpRight } from "react-icons/bs";
import { useMainContext } from "../MainContext";

const SubredditBanner = ({ subreddits }) => {
  // const { mySubs, myLocalSubs, myMultis, subscribe } = useMySubs();
  const [session] = useSession();
  const [subreddit, setSubreddit] = useState("");
  const [subArray, setSubArray] = useState([]);
  const context:any = useMainContext();
  const [hideNSFW, sethideNSFW] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [openDescription, setOpenDescription] = useState(0);

  const [banner, setBanner] = useState({});
  const [subInfo, setSubInfo] = useState({
    submit_text_html: "",
    display_name: "",
    header_img: "",
    title: "",
    icon_size: [256, 256],
    primary_color: "",
    active_user_count: 0,
    icon_img: "",
    display_name_prefixed: "",
    accounts_active: 0,
    public_traffic: false,
    subscribers: 0,
    user_flair_richtext: [],
    name: "",
    quarantine: false,
    hide_ads: false,
    public_description: "",
    community_icon: "",
    banner_background_image: "",
    submit_text: "",
    description_html: "",
    spoilers_enabled: true,
    key_color: "",
    created: 0,
    wls: 6,
    submission_type: "",
    public_description_html: "",
    banner_img: "",
    banner_background_color: "",
    id: "",
    over18: false,
    description: "",
    lang: "",
    whitelist_status: "",
    url: "",
    created_utc: 0,
    banner_size: 0,
    mobile_banner_image: "",
  });
  useEffect(() => {
    const loadSubInfo = async (sub) => {
      const info = await loadSubredditInfo(sub);
      if (info?.name) {
        setSubInfo(info);
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
    loadSubInfo(subreddit);
  }, [subreddit]);

  useEffect(() => {
    // let sub = subreddits
    //   .split(" ")
    //   .join("+")
    //   .split(",")
    //   .join("+")
    //   .split("%20")
    //   .join("+")
    //   .split("+")?.[0];
    setSubArray(subreddits);
    setSubreddit(subreddits?.[0]);
  }, [subreddits]);


  useEffect(() => {
    subInfo?.over18 && context.nsfw == "false" ? sethideNSFW(true) : sethideNSFW(false);
  
  }, [context.nsfw, subInfo.over18])

  return (
    <div
      className={
        "w-full h-full -mt-2 " +
        (subArray.length === 1
          ? "mb-2  md:mb-8 lg:mb-10"
          : " space-y-2 mb-2 md:space-y-3 md:mb-3 ")
      }
    >
      <div className="relative border-b shadow-xl dark:bg-trueGray-900 bg-lightPost border-lightBorder dark:border-darkBorder">
        <SubInfoModal
          toOpen={openDescription}
          descriptionHTML={subInfo?.description_html}
          displayName={subInfo?.display_name_prefixed}
        />
        <div className="">
          <div
            className={(hideNSFW &&  " blur-xl overflow-hidden") + ` w-full h-[150px] bg-cover bg-center flex items-center justify-center border-b-4 border-lightBorder `}
            style={banner}
          ></div>
          <div className="flex flex-col items-center justify-center w-11/12 mx-auto md:items-start">
            <div
              className="flex flex-row items-center w-24 h-24 -mt-12 overflow-hidden border-4 rounded-full border-lightBorder bg-lightPost dark:bg-trueGray-900"
              style={{ backgroundColor: subInfo?.primary_color }}
            >
              {subInfo?.community_icon?.length > 1 ||
              subInfo?.icon_img?.length > 1 ||
              subInfo?.header_img?.length > 1 ? (
                <Image
                  src={
                    subInfo?.community_icon?.length > 1
                      ? subInfo?.community_icon
                      : subInfo?.icon_img?.length > 1
                      ? subInfo?.icon_img
                      : subInfo?.header_img?.length > 1
                      ? subInfo?.header_img
                      : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dc/Flag_placeholder.svg/320px-Flag_placeholder.svg.png"
                  }
                  alt=""
                  height={subInfo?.icon_size?.[0] ?? 256}
                  width={subInfo?.icon_size?.[1] ?? 256}
                  unoptimized={true}
                  objectFit="cover"
                  className={"rounded-full " + (hideNSFW &&  " blur-xl ")}
                />
              ) : (
                <div
                  className="rounded-full dark:bg-trueGray-900 bg-lightPost"
                  style={{ backgroundColor: subInfo?.primary_color }}
                ></div>
              )}
            </div>
            <div className="flex items-center justify-center w-full pt-2 pb-1 md:justify-between">
              {loaded ? (
                <>
                  <h1 className="text-4xl">{subInfo?.display_name_prefixed}</h1>
                  <div className="hidden md:block">
                    <SubButton sub={session ? subInfo.name : subreddit} />
                  </div>
                </>
              ) : (
                <h1 className="text-4xl text-transparent">r/</h1>
              )}
            </div>
            <div className="flex p-1 space-x-2 text-gray-700 dark:text-gray-500">
              <p>{subInfo?.subscribers?.toLocaleString("en-US")} members</p>
              {subInfo?.over18 && <p className="text-red-400 text-color dark:text-red-700">NSFW</p>}
            </div>
            <div className="my-1 md:hidden">
              <SubButton sub={session ? subInfo.name : subreddit} />
            </div>
            <div className="p-1 pb-5 text-center md:text-left">
              {loaded ? (
                <p>{subInfo?.public_description}</p>
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
      {subArray.length > 1 && (
        <div
          className={
            (subArray?.length < 12 ? "md:w-11/12 mx-auto " : " ") +
            " flex  space-x-2 overflow-x-scroll text-sm capitalize scrollbar-none"
          }
        >
          {subArray.map((s) => (
            <div
              onClick={() => setSubreddit(s)}
              className="flex items-center px-3 py-1 space-x-1 border rounded-full select-none dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover"
              key={s}
            >
              <h1>{s}</h1>
              <Link  href={`${s}`}>
                <a className="-mb-1">
                  <button className="rounded hover:cursor-pointer hover:ring-1 ring-gray-300 dark:ring-gray-600 dark:hover:ring-2 bg-lightPost dark:bg-trueGray-900">
                    <BsBoxArrowInUpRight className="w-4 h-4" />
                  </button>
                </a>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubredditBanner;
