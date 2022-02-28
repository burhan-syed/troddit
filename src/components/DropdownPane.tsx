import axios from "axios";
import router, { useRouter } from "next/router";
import { useState, useEffect } from "react";
import Image from "next/dist/client/image";

import { BsChevronDown } from "react-icons/bs";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { CgLivePhoto } from "react-icons/cg";
import { BiRightTopArrowCircle } from "react-icons/bi";
import {
  HiOutlineMinus,
  HiOutlinePlusSm,
  HiOutlineMinusSm,
} from "react-icons/hi";
// import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import { signIn, useSession } from "next-auth/client";
import DropdownItem from "./DropdownItem";
import DropdownSubCard from "./DropdownSubCard";
import { useSubsContext } from "../MySubs";
import { useWindowHeight } from "@react-hook/window-size";

const DropdownPane = ({ hide }) => {
  const subsContext: any = useSubsContext();
  const {
    mySubs,
    myFollowing,
    myLocalSubs,
    myLocalMultis,
    myMultis,
    multi,
    loadedSubs,
    loadedMultis,
    error,
    currSubInfo,
    currLocation,
    tryLoadAll,
  } = subsContext;

  const [show, setShow] = useState(false);
  const [expand, setExpand] = useState(false);
  const [expandMultis, setExpandMultis] = useState(true);
  const [expandSubs, setExpandSubs] = useState(true);
  const [expandFollowing, setExpandFollowing] = useState(true);
  const windowHeight = useWindowHeight();
  const router = useRouter();
  //const [location, setLocation] = useState("home");
  const [myLocalSubsFiltered, setMyLocalSubsFiltered] = useState([]);
  const [myLocalFollows, setMyLocalFollows] = useState([]);
  useEffect(() => {
    let subs = [];
    let follows = [];
    //console.log(myLocalSubs);
    if (myLocalSubs?.length > 0) {
      myLocalSubs.forEach((s) => {
        if (s.data.url.substring(0, 3) === "/u/") {
          follows.push(s);
        } else {
          subs.push(s);
        }
      });
      setMyLocalSubsFiltered(subs);
      setMyLocalFollows(follows);
    }
  }, [myLocalSubs]);

  const [session, loading] = useSession();
  // const [subInfo, setSubInfo] = useState({});

  const handleClick = async () => {
    !show && tryLoadAll();
    setShow((show) => !show);
  };

  return (
    <div className="flex flex-col items-center w-full h-full select-none">
      {/* Close when clicking outside element */}
      <div
        className={
          (show && !hide ? "" : "w-0 h-0") +
          "absolute  top-0 left-0 w-screen h-screen bg-transparent "
        }
        onClick={() => setShow((show) => !show)}
      ></div>
      {/* Main Button */}
      <div
        className={
          "flex flex-row items-center justify-between flex-none w-full h-full px-2 border border-white rounded-md hover:cursor-pointer hover:border-lightBorder rounded-2 dark:bg-darkBG dark:hover:border-darkBorder dark:border-darkBG" +
          (show ? " border-lightBorder dark:border-darkBorder" : "")
        }
        onClick={handleClick}
      >
        <div className="flex flex-row items-center">
          {
            currLocation === "HOME" ? (
              <AiOutlineHome className="w-6 h-6" />
            ) : currLocation === "POPULAR" ? (
              <BiRightTopArrowCircle className="w-6 h-6" />
            ) : currLocation === "ALL" ? (
              <CgLivePhoto className="w-6 h-6" />
            ) : currLocation === "SEARCH" ? (
              <AiOutlineSearch className="w-6 h-6" />
            ) : multi ? (
              <div>
                <DropdownItem
                  sub={{
                    data: {
                      display_name: multi,
                      subreddits: ["", ""],
                    },
                  }}
                  preventNav={true}
                />
              </div>
            ) : currSubInfo ? (
              <div>
                <DropdownItem
                  sub={{
                    kind: "t5",
                    data: currSubInfo?.data?.subreddit ?? currSubInfo?.data,
                  }}
                  isUser={router.pathname.includes("/u/")}
                  preventNav={true}
                />
              </div>
            ) : (
              <div>
                {router.pathname.includes("/u/")
                  ? `u/${router?.query?.slug?.[0]}`
                  : "r/"}
              </div>
            )
            //
          }
          {(currLocation == "HOME" ||
            currLocation == "POPULAR" ||
            currLocation == "ALL" ||
            currLocation === "SEARCH") && (
            <h1 className="ml-2 capitalize truncate">
              {currLocation.toLowerCase()}
            </h1>
          )}
        </div>
        <BsChevronDown
          className={
            (show ? "-rotate-180" : "rotate-0") +
            " transform transition duration-200"
          }
        />
      </div>
      {/* Dropdown */}
      <div
        className={
          " flex flex-col w-full transform transition border duration-150 ease-in-out origin-top dark:bg-darkBG bg-white dark:border-darkBorder border-lightBorder mt-1 rounded-md shadow-sm " +
          `${show && !hide ? " block" : " hidden"}`
        }
      >
        {/* scroll */}
        <div
          className={
            "grid grid-cols-1 overflow-y-auto overscroll-contain scrollbar-thin transition-all   scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800 " +
            (expand ? " max-h-[90vh]" : "  max-h-96 ")
          }
        >
          {/* Quick Links */}
          <div className="flex flex-col py-2 font-light">
            {(router.pathname.includes("/r/") ||
              router.pathname.includes("/u/")) &&
              currSubInfo &&
              mySubs &&
              !multi &&
              currLocation !== "HOME" &&
              currLocation !== "ALL" &&
              currLocation !== "POPULAR" && (
                <div className="py-2 pl-3 pr-4 hover:bg-lightHighlight dark:hover:bg-darkHighlight">
                  <DropdownSubCard
                    sub={{
                      kind: "t5",
                      data: currSubInfo?.data?.subreddit ?? currSubInfo?.data,
                    }}
                    userMode={router.pathname.includes("/u/") ? true : false}
                    // mySubs={mySubs.length > 0 ? mySubs : myLocalSubs}
                    // // refresh={loadAllSubs}
                    // refresh={undefined}
                    // subsLoaded={loadedSubs}
                  />
                </div>
              )}
            <Link href="/" passHref>
              <a>
                <div className="flex flex-row items-center py-1.5 space-x-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight pl-4 cursor-pointer">
                  <AiOutlineHome className="w-6 h-6" />
                  <h1 className="">Home</h1>
                </div>
              </a>
            </Link>
            <Link href="/r/popular" passHref>
              <a>
                <div className="flex flex-row items-center py-1.5 space-x-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight pl-4 cursor-pointer">
                  <BiRightTopArrowCircle className="w-6 h-6" />
                  <h1>Popular</h1>
                </div>
              </a>
            </Link>
            <Link href="/r/all" passHref>
              <a>
                <div className="flex flex-row items-center  py-1.5 space-x-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight pl-4 cursor-pointer">
                  <CgLivePhoto className="w-6 h-6" />
                  <h1>All</h1>
                </div>
              </a>
            </Link>
          </div>
          {!session && (
            <>
              {myLocalMultis?.length > 0 && (
                <>
                  {/* <div className="pl-2 text-xs tracking-widest">
                      local multis
                    </div> */}
                  <div
                    onClick={() => setExpandMultis((m) => !m)}
                    className={
                      "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                      (expandMultis ? " " : " mb-2")
                    }
                  >
                    <p>multis</p>
                    <BsChevronDown
                      className={
                        (expandMultis ? "-rotate-180 " : "rotate-0 ") +
                        "transform transition duration-200"
                      }
                    />
                  </div>
                  <div
                    className={
                      " " +
                      (expandMultis
                        ? " max-h-full"
                        : " max-h-0 overflow-hidden")
                    }
                  >
                    <div className="py-2">
                      {myLocalMultis
                        ? myLocalMultis.map((multi, i) => {
                            return (
                              <div
                                className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                                key={i}
                              >
                                <DropdownItem sub={multi} />
                              </div>
                            );
                          })
                        : ""}
                    </div>
                  </div>
                </>
              )}
              {myLocalSubs?.length > 0 ? (
                <>
                  {/* <div className="pl-2 text-xs tracking-widest">
                      local subs
                    </div> */}
                  <div
                    onClick={() => setExpandSubs((m) => !m)}
                    className={
                      "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                      (expandSubs ? " " : " mb-2")
                    }
                  >
                    <p>local subs</p>
                    <BsChevronDown
                      className={
                        (expandSubs ? "-rotate-180 " : "rotate-0 ") +
                        "transform transition duration-200"
                      }
                    />
                  </div>
                  <div
                    className={
                      " " +
                      (expandSubs ? " max-h-full" : " max-h-0 overflow-hidden")
                    }
                  >
                    <div className="py-2">
                      {myLocalSubsFiltered
                        ? myLocalSubsFiltered.map((sub, i) => {
                            return (
                              <div
                                className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                                key={i}
                              >
                                <DropdownItem sub={sub} />
                              </div>
                            );
                          })
                        : ""}
                    </div>
                  </div>
                  {myLocalFollows?.length > 0 && (
                    <>
                      <div
                        onClick={() => setExpandFollowing((m) => !m)}
                        className={
                          "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                          (expandFollowing ? " " : " mb-2")
                        }
                      >
                        <p>local follows</p>
                        <BsChevronDown
                          className={
                            (expandFollowing ? "-rotate-180 " : "rotate-0 ") +
                            "transform transition duration-200"
                          }
                        />
                      </div>
                      <div
                        className={
                          " " +
                          (expandFollowing
                            ? " max-h-full"
                            : " max-h-0 overflow-hidden")
                        }
                      >
                        <div className="py-2">
                          {myLocalFollows
                            ? myLocalFollows.map((sub, i) => {
                                return (
                                  <div
                                    className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                                    key={i}
                                  >
                                    <DropdownItem sub={sub} isUser={true} />
                                  </div>
                                );
                              })
                            : ""}
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <button
                  className="p-2 m-2 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
                  onClick={() => signIn("reddit")}
                >
                  <span className="text-blue-300 dark:text-blue-600">
                    Login
                  </span>{" "}
                  to see your subs
                </button>
              )}
            </>
          )}

          {session && (
            <>
              {/* Multis */}
              {/* onClick={() => {setloadedMultis(m => !m);setloadedSubs(s => !s)}} */}
              <div
                onClick={() => setExpandMultis((m) => !m)}
                className={
                  "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                  (expandMultis ? " " : " mb-2")
                }
              >
                <p>multis</p>
                <BsChevronDown
                  className={
                    (expandMultis ? "-rotate-180 " : "rotate-0 ") +
                    "transform transition duration-200"
                  }
                />{" "}
              </div>
              <div
                className={
                  " " +
                  (expandMultis ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                {!loadedMultis ? (
                  // Loading pane
                  <>
                    <div className="py-2">
                      <div className="px-4 py-1 ">
                        {/* Repeated rows */}
                        {[...Array(3)].map((u, i) => (
                          <div key={i} className="py-1">
                            <div className="flex flex-row items-center text-sm text-center animate-pulse ">
                              {/* Image */}
                              <div className="flex flex-row items-center w-6 h-6 ml-1 ">
                                <div className="w-6 h-6 text-center bg-red-400 rounded text-lightText ">
                                  {"m"}
                                </div>
                              </div>
                              {/* Text */}
                              <div className="w-full h-6 ml-2 bg-gray-300 rounded dark:bg-gray-800 "></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="py-2">
                      {myMultis
                        ? myMultis.map((multi, i) => {
                            return (
                              <div
                                className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                                key={`${i}_${multi.data.display_name}`}
                              >
                                <DropdownItem sub={multi} />
                              </div>
                            );
                          })
                        : ""}
                    </div>
                  </>
                )}
              </div>

              {/* Subs */}
              <div
                onClick={() => setExpandSubs((e) => !e)}
                className={
                  "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-lightHighlight dark:hover:bg-darkHighlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
                  (expandSubs ? " " : " mb-2")
                }
              >
                <p>subs</p>
                <BsChevronDown
                  className={
                    (expandSubs ? "-rotate-180 " : "rotate-0 ") +
                    "transform transition duration-200"
                  }
                />{" "}
              </div>
              <div
                className={
                  " " +
                  (expandSubs ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                {!loadedSubs ? (
                  <>
                    <div className="py-2">
                      <div className="px-4 py-1 ">
                        {/* Repeated rows */}
                        {[...Array(5)].map((u, i) => (
                          <div key={i} className="py-1">
                            <div className="flex flex-row items-center text-sm text-center animate-pulse ">
                              {/* Image */}
                              <div className="flex flex-row items-center w-6 h-6 ml-1 ">
                                <div className="w-6 h-6 text-center bg-blue-700 rounded-full text-lightText ">
                                  {"r/"}
                                </div>
                              </div>
                              {/* Text */}
                              <div className="w-full h-6 ml-2 bg-gray-300 rounded dark:bg-gray-800 "></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className={"py-2"}>
                    {mySubs
                      ? mySubs.map((sub, i) => {
                          return (
                            <div
                              className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                              key={i}
                            >
                              <DropdownItem sub={sub} />
                            </div>
                          );
                        })
                      : ""}
                  </div>
                )}
              </div>

              {/* Follows */}
              {myFollowing?.length > 0 && (
                <>
                  <div
                    onClick={() => setExpandFollowing((e) => !e)}
                    className={
                      "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-lightHighlight dark:hover:bg-darkHighlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
                      (expandFollowing ? " " : " mb-2")
                    }
                  >
                    <p>follows</p>
                    <BsChevronDown
                      className={
                        (expandFollowing ? "-rotate-180 " : "rotate-0 ") +
                        "transform transition duration-200"
                      }
                    />
                  </div>
                  <div
                    className={
                      " " +
                      (expandFollowing
                        ? " max-h-full"
                        : " max-h-0 overflow-hidden")
                    }
                  >
                    <div className={"py-2"}>
                      {myFollowing
                        ? myFollowing.map((sub, i) => {
                            return (
                              <div
                                className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                                key={i}
                              >
                                <DropdownItem sub={sub} isUserLink={true} />
                              </div>
                            );
                          })
                        : ""}
                    </div>
                  </div>
                </>
              )}
            </>
          )}
          {session && error && (
            <>
              <div className="flex flex-row items-center justify-center p-4">
                {"Can't connect to Reddit. Try refreshing."}
              </div>
            </>
          )}
        </div>
        {true && (
          <div
            onClick={() => setExpand((e) => !e)}
            className="flex items-center justify-center border-t border-lightBorder dark:border-darkBorder hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkPostHover"
          >
            <HiOutlineMinus className="w-6 h-3 " />
          </div>
        )}
      </div>
    </div>
  );
};

export default DropdownPane;
