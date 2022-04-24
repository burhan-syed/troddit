import { useRouter } from "next/router";
import { useState, Fragment } from "react";
import Image from "next/dist/client/image";

import { BsChevronDown } from "react-icons/bs";
import { AiOutlineHome, AiOutlineSearch } from "react-icons/ai";
import { CgLivePhoto, CgPlayListSearch } from "react-icons/cg";
import { BiRightTopArrowCircle } from "react-icons/bi";
import { HiOutlineMinus } from "react-icons/hi";
import DropdownItem from "./DropdownItem";
import { useSubsContext } from "../MySubs";
import DropDownItems from "./DropDownItems";
import { Menu, Transition } from "@headlessui/react";

const DropdownPane = ({ hide }) => {
  const subsContext: any = useSubsContext();
  const { multi, currSubInfo, currLocation, tryLoadAll } = subsContext;

  const [expand, setExpand] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    tryLoadAll();
  };

  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center w-full h-full select-none"
    >
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
                        },
                      }}
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
