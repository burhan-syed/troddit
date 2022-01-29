import SubButton from "./SubButton";
import SubInfoModal from "./SubInfoModal";

import { useState, useEffect, useRef } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";
import { useSession } from "next-auth/client";
import { loadSubredditInfo } from "../RedditAPI";
import { BsBoxArrowInUpRight } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { useSubsContext } from "../MySubs";
import router, { useRouter } from "next/router";
import SubMultiButton from "./SubMultiButton";
import SubOptButton from "./SubOptButton";
import { AiOutlinePlus } from "react-icons/ai";
import { join } from "path";

const SubredditBanner = ({ subreddits }) => {
  const router = useRouter();
  const subsContext: any = useSubsContext();
  const { currSubInfo, loadCurrSubInfo, multi } = subsContext;
  const [session] = useSession();
  const [subreddit, setSubreddit] = useState("");
  const [multiSub, setMultiSub] = useState("");
  const [currMulti, setCurrMulti] = useState("");
  const [subArray, setSubArray] = useState([]);
  const [keepInMultiArray, setKeepInMultiArray] = useState(false);
  const context: any = useMainContext();
  const [hideNSFW, sethideNSFW] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [openDescription, setOpenDescription] = useState(0);
  const [thumbURL, setThumbURL] = useState("");
  const [banner, setBanner] = useState({});

  const pillsRef: any = useRef();
  useEffect(() => {
    const el = pillsRef.current;
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY == 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY * 2,
          behavior: "smooth",
        });
      };
      el.addEventListener("wheel", onWheel);
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);

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

  //entry point
  useEffect(() => {
    let s = subreddits.sort((a, b) => {
      let aUpper = a.toUpperCase();
      let bUpper = b.toUpperCase();
      if (aUpper < bUpper) return -1;
      if (aUpper > bUpper) return 1;
      return 0;
    });
    setSubreddit(s?.[0]);
    if (
      !keepInMultiArray ||
      subreddits?.length > 1 ||
      subreddits?.[0].toUpperCase() !== multiSub.toUpperCase()
    ) {
      setSubArray(s);
      setCurrMulti(multi);
      setKeepInMultiArray(false);
    }
  }, [subreddits]);

  useEffect(() => {
    currSubInfo?.over18 && context.nsfw == "false"
      ? sethideNSFW(true)
      : sethideNSFW(false);
  }, [context.nsfw, currSubInfo.over18]);

  useEffect(() => {
    if (multi) {
      setCurrMulti(multi);
    } else {
      setCurrMulti("");
    }
  }, [multi]);

  const goToMulti = (e) => {
    e.preventDefault();
    e.stopPropagation();
    router.push(`${subArray.join("+")}${currMulti ? `?m=${currMulti}` : ""}`);
  };

  const goToMultiSub = (e, s) => {
    e.preventDefault();
    e.stopPropagation();
    setMultiSub(s);
    setKeepInMultiArray(true);
    //console.log(router);
    if (router.route === "/r/[...slug]") {
      router.push(s);
    } else {
      router.push(`/r/${s}`, `/r/${s}`);
    }
  };

  const removeSub = (s) => {
    if (router.route === "/r/[...slug]") {
      let curr: string = router.query.slug[0];
      let currsubs = curr.split("+");
      let filtered = currsubs.filter(
        (c) => c.toUpperCase() !== s.toUpperCase()
      );
      let filteredSubAry = subArray.filter(
        (c) => c.toUpperCase() !== s.toUpperCase()
      );
      setSubArray((c) =>
        c.filter((sub) => sub.toUpperCase() !== s.toUpperCase())
      );
      //console.log(currsubs);
      if (filtered.length > 1) {
        router.push(`/r/${filtered.join("+")}`);
      } else if (filteredSubAry.length > 0) {
        router.push(`/r/${filteredSubAry.join("+")}`);
      } else {
        router.push("/");
      }
    }
  };

  return (
    <div
      className={
        "w-full h-full -mt-2 " +
        (subArray.length === 1 && multi === ""
          ? "mb-2  md:mb-8 lg:mb-10"
          : " space-y-2 mb-2 md:space-y-3 md:mb-3  ")
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
            <Link href={currSubInfo?.display_name ?? "/"}>
              <a>
                <div
                  className="flex flex-row items-center w-24 h-24 -mt-12 overflow-hidden border-4 rounded-full cursor-pointer border-lightBorder bg-lightPost dark:bg-trueGray-900"
                  style={{ backgroundColor: currSubInfo?.primary_color }}
                  onClick={() => {
                    context.setForceRefresh((p) => p + 1);
                  }}
                >
                  {thumbURL?.includes("https") ? (
                    <Image
                      src={thumbURL}
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
              </a>
            </Link>
            <div className="flex items-center justify-center w-full h-12 pt-2 pb-1 md:justify-between">
              {loaded ? (
                <>
                  <h1 className="flex items-start text-4xl">
                    <Link href={currSubInfo?.display_name ?? "/"}>
                      <a onClick={() => context.setForceRefresh((p) => p + 1)}>
                        {currSubInfo?.display_name_prefixed}
                      </a>
                    </Link>
                    <a
                      href={`https://www.reddit.com/${currSubInfo?.display_name_prefixed}`}
                      target={"_blank"}
                      rel="noreferrer"
                      className="mt-2 ml-2 rounded dark:hover:bg-darkPostHover hover:bg-lightHighlight"
                    >
                      <span className="">
                        <BsBoxArrowInUpRight className="w-4 h-4" />
                      </span>
                    </a>
                  </h1>
                  <div className="items-center justify-end hidden space-x-0.5 md:flex">
                    <SubButton sub={session ? currSubInfo.name : subreddit} />
                    <SubOptButton
                      subInfo={currSubInfo}
                      currMulti={currMulti}
                      subArray={subArray}
                    />
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
                    {currSubInfo?.subscribers?.toLocaleString("en-US")} members
                    <span className="px-2">•</span>
                    {currSubInfo?.active_user_count?.toLocaleString(
                      "en-US"
                    )}{" "}
                    here
                  </p>
                  {currSubInfo?.over18 && (
                    <>
                      <span>•</span>
                      <p className="text-red-400 text-color dark:text-red-700">
                        NSFW
                      </p>
                    </>
                  )}
                </>
              )}
            </div>
            <div className="flex items-end my-1 space-x-1 space-y-1 md:hidden">
              <SubButton sub={session ? currSubInfo.name : subreddit} />
              <SubOptButton
                subInfo={currSubInfo}
                currMulti={currMulti}
                subArray={subArray}
              />
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

      {(multi || subArray.length > 1 || currMulti) && (
        <div className="">
          <div
            className={
              (subArray?.length < 12 ? "md:w-11/12 mx-auto " : " ") +
              " flex items-center justify-start text-sm space-x-2"
            }
          >
            <div onClick={(e) => goToMulti(e)} className="flex-none">
              <a
                href={`${subArray.join("+")}${
                  currMulti ? `?m=${currMulti}` : ""
                }`}
              >
                <div className="items-center px-4 py-1.5 text-center border rounded-md select-none  dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover">
                  {`${currMulti ? `${currMulti}` : "Multi"} (${
                    subArray.length
                  })`}
                </div>
              </a>
            </div>
            <div
              ref={pillsRef}
              className="flex space-x-2 overflow-x-scroll capitalize scrollbar-none"
            >
              {subArray.map((s) => (
                <div
                  onClick={(e) => {
                    goToMultiSub(e, s);
                  }}
                  key={s}
                >
                  <a href={`${s}`}>
                    <div className="flex items-center px-3 py-1 space-x-2 border rounded-full select-none dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover">
                      <h1 className="">{s}</h1>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          removeSub(s);
                        }}
                        className=" border rounded-full p-0.5 dark:border-darkPostHover dark:hover:bg-trueGray-900 hover:ring-1"
                      >
                        <AiOutlinePlus className="flex-none w-4 h-4 rotate-45 " />
                      </button>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubredditBanner;
