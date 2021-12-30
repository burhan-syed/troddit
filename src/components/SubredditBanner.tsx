import SubButton from "./SubButton";

import { useState, useEffect } from "react";
import Image from "next/dist/client/image";
import { useSession } from "next-auth/client";
import { loadSubredditInfo } from "../RedditAPI";

const SubredditBanner = ({ subreddits }) => {
  // const { mySubs, myLocalSubs, myMultis, subscribe } = useMySubs();
  const [session] = useSession();
  const [subreddit, setSubreddit] = useState("");
  const [subs, setSubs] = useState([]);
  const [localSubs, setLocalSubs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [subbed, setSubbed] = useState(false);
  const [subbedLoaded, setSubbedLoaded] = useState(false);

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
          "backgroundImage": `url("${info?.banner_background_image}")`,
          "backgroundColor": info?.banner_background_color,
        });
        setLoaded(true);
      }
    };

    let sub = subreddits
      .split(" ")
      .join("+")
      .split(",")
      .join("+")
      .split("%20")
      .join("+")
      .split("+")?.[0];
    setSubreddit(sub);
    loadSubInfo(sub);
  }, [subreddits]);

  return (
    <div className="relative w-full h-full mb-2 -mt-2 border-b shadow-xl md:mb-8 lg:mb-10 dark:bg-trueGray-900 bg-lightPost border-lightBorder dark:border-darkBorder">
      <div className={""}>
        {/* {localSubs.includes(subreddit.toUpperCase()) ||
          subs.includes(subreddit.toUpperCase()) ? (
            <div>-</div>
          ) : (
            <div>+</div>
          )} */}
        <div
          className={`w-full h-[150px] bg-cover bg-center flex items-center justify-center border-b-4 border-lightBorder`}
          style={banner}
        ></div>
        <div className="flex flex-col items-center justify-center w-11/12 mx-auto md:items-start">
          <div className="flex flex-row items-center w-24 h-24 -mt-12 border-4 rounded-full border-lightBorder bg-darkBG">
            <Image
              src={
                subInfo?.community_icon?.length > 1
                  ? subInfo?.community_icon
                  : subInfo?.icon_img?.length > 1
                  ? subInfo?.icon_img
                  : "https://via.placeholder.com/256"
              }
              alt=""
              height={subInfo?.icon_size?.[0] ?? 256}
              width={subInfo?.icon_size?.[1] ?? 256}
              unoptimized={true}
              objectFit="cover"
              className="rounded-full"
            />
          </div>
          <div className="flex justify-center w-full pt-2 pb-1 text-4xl md:justify-between">
            {loaded ? (
              <>
                <h1>{subInfo?.display_name_prefixed}</h1>
                <div className="hidden md:block">
                  <SubButton sub={session ? subInfo.name : subreddit} />
                </div>
              </>
            ) : (
              <h1>r/</h1>
            )}
          </div>
          <div className="p-1 text-gray-700 dark:text-gray-500">
            {subInfo?.subscribers?.toLocaleString("en-US")} members
          </div>
          <div className="my-1 md:hidden">
                  <SubButton sub={session ? subInfo.name : subreddit} />
                </div>
          <div className="p-1 pb-5 text-center md:text-left">
            {loaded ? subInfo?.public_description : "            "}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubredditBanner;
