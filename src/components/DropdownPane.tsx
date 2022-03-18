import axios from "axios";
import router, { useRouter } from "next/router";
import { useState, useEffect, useRef, Fragment } from "react";
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
import DropDownItems from "./DropDownItems";
import { Menu, Transition } from "@headlessui/react";

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
  const [filter, setFilter] = useState("");
  const filterRef = useRef(null);
  // useEffect(() => {
  //   let subs = [];
  //   let follows = [];
  //   //console.log(myLocalSubs);
  //   if (myLocalSubs?.length > 0) {
  //     myLocalSubs.forEach((s) => {
  //       if (s.data.url.substring(0, 3) === "/u/") {
  //         follows.push(s);
  //       } else {
  //         subs.push(s);
  //       }
  //     });
  //     setMyLocalSubsFiltered(subs);
  //     setMyLocalFollows(follows);
  //   }
  // }, [myLocalSubs]);

  const [session, loading] = useSession();
  // const [subInfo, setSubInfo] = useState({});

  const handleClick = async () => {
    // !show &&
    // setShow((show) => !show);
    tryLoadAll();
  };

  // useEffect(() => {
  //   show && filterRef.current.focus();
  // }, [show]);

  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center w-full h-full select-none"
    >
      {/* Close when clicking outside element */}
      {/* <div
        className={
          (show && !hide ? "" : "w-0 h-0") +
          "absolute  top-0 left-0 w-screen h-screen bg-transparent "
        }
        onClick={() => setShow((show) => !show)}
      ></div> */}
      {({ open }) => (
        <>
          {/* Main Button */}
          <Menu.Button
            as="div"
            className={
              "flex flex-row items-center justify-between flex-none w-full h-full px-2 border border-transparent rounded-md hover:cursor-pointer hover:border-lightBorder rounded-2 dark:bg-darkBG dark:hover:border-darkBorder dark:border-darkBG" +
              (open ? " border-lightBorder dark:border-darkBorder" : "")
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
                          name: multi,
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
                (open ? "-rotate-180" : "rotate-0") +
                " transform transition duration-200"
              }
            />
          </Menu.Button>
          {/* Dropdown */}
          <Transition
            as={Fragment}
            // enter="transition ease-out duration-100"
            // enterFrom="transform opacity-0 scale-95"
            // enterTo="transform opacity-100 scale-100"
            // leave="transition ease-in duration-75"
            // leaveFrom="transform opacity-100 scale-100"
            // leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              as="div"
              className={
                " flex outline-none flex-col w-full border dark:bg-darkBG bg-white dark:border-darkBorder border-lightBorder mt-1 rounded-md shadow-sm " +
                `${open && !hide ? " block" : " hidden"}`
                //transform transition border duration-150 ease-in-out origin-top
              }
            >
              {/* scroll */}
              <div
                className={
                  "grid grid-cols-1 overflow-y-auto overscroll-contain scrollbar-thin transition-all scrollbar-thumb-lightScroll scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-darkScroll " +
                  (expand ? " max-h-[90vh]" : "  max-h-[30rem] ")
                }
              >
                <DropDownItems show={open} />
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setExpand((s) => !s);
                }}
                className="flex items-center justify-center border-t border-lightBorder dark:border-darkBorder hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkPostHover"
              >
                <HiOutlineMinus className="w-6 h-3 " />
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default DropdownPane;
