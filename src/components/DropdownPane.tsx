import { useRouter } from "next/router";
import React, { useState, Fragment, useEffect, useMemo } from "react";
import Image from "next/legacy/image";

import { BsChevronDown } from "react-icons/bs";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { CgLivePhoto, CgPlayListSearch } from "react-icons/cg";
import { BiRightTopArrowCircle } from "react-icons/bi";
import { HiOutlineMinus } from "react-icons/hi";
import DropdownItem from "./DropdownItem";
import { useSubsContext } from "../MySubs";
import DropDownItems from "./DropDownItems";
import { Menu, Transition } from "@headlessui/react";
import { useMainContext } from "../MainContext";

const scrollStyle =
  "scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full";

const DropdownPane = ({ hide }) => {
  const subsContext: any = useSubsContext();
  const { multi, currSubInfo, currLocation, tryLoadAll, myMultis } =
    subsContext;
  const context: any = useMainContext();
  const [expand, setExpand] = useState<boolean>();
  const router = useRouter();

  const handleClick = async () => {
    tryLoadAll();
  };

  const multi_icon = useMemo(() => {
    let icon = "";
    if (multi && myMultis) {
      myMultis?.forEach((myMulti) => {
        if (myMulti?.data?.name?.toUpperCase() == multi?.toUpperCase()) {
          icon = myMulti?.data?.icon_url;
        }
      });
    }
    return icon;
  }, [multi, myMultis]);

  useEffect(() => {
    context.expandedSubPane ? setExpand(true) : setExpand(false);
  }, [context.expandedSubPane]);

  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center w-full h-full select-none"
    >
      {({ open }) => (
        <>
          {/* Main Button */}
          <Menu.Button
            aria-label="Open Nav Dropdown"
            as="button"
            className={
              "flex flex-row items-center justify-between outline-none flex-none w-full h-full px-2 border border-transparent rounded-md hover:cursor-pointer rounded-2  hover:border-th-border " +
              (open ? " border-th-border " : "")
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
                ) : currLocation === "SUBREDDITS" ? (
                  <CgPlayListSearch className="mt-1 -mr-1 w-7 h-7" />
                ) : multi ? (
                  <div>
                    <DropdownItem
                      sub={{
                        data: {
                          display_name: multi,
                          name: multi,
                          subreddits: ["", ""],
                          icon_url: multi_icon,
                        },
                      }}
                      showFavorite={false}
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
                      showFavorite={false}
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
                currLocation === "SEARCH" ||
                currLocation === "SUBREDDITS") && (
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
                " flex outline-none flex-col w-full border bg-th-background2 border-th-border ring-1 ring-th-base mt-1 rounded-md shadow-sm origin-top z-50" +
                `${open && !hide ? " block" : " hidden"}`
              }
            >
              {/* scroll */}
              <div
                className={
                  `grid grid-cols-1 overflow-y-auto overscroll-contain transition-all ${scrollStyle}` +
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
                className="flex items-center justify-center border-t border-th-border hover:cursor-pointer hover:bg-th-highlight"
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
