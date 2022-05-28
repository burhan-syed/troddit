import { Tab } from "@headlessui/react";
import { useState, useRef, useEffect, createRef } from "react";

import { BiImages, BiComment, BiDetail, BiCog } from "react-icons/bi";
import { BsColumnsGap } from "react-icons/bs";
import { FiFilter } from "react-icons/fi";
import FilterSubs from "../FilterSubs";

import ToggleFilters from "../ToggleFilters";
import CardStyleDemo from "./CardStyleDemo";
import ColumnCardOptions from "./ColumnCardOptions";
import Toggles from "./Toggles";

const Settings = () => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const icons = "w-6 h-6 flex-none ";

  const [categories] = useState({
    Layout: {
      icon: <BsColumnsGap className={icons} />,
      //[
      settings: [
        ...[
          "theme",
          "wideUI",
          "syncWideUI",
          "postWideUI",
          "expandedSubPane",
        ].map((s: any) => (
          <Toggles
            key={s}
            setting={s}
            withSubtext={true}
            externalStyles="rounded-lg group dark:hover:bg-darkPostHover hover:bg-lightHighlight p-2 cursor-pointer"
          />
        )),
        <label className="flex flex-row items-center justify-between w-full p-2 my-2">
          <span className="flex flex-col gap-0.5">
            <span>Column Count</span>
            <span className="mr-2 text-xs opacity-70">
              Sets column count in your feeds. "Auto" changes columns by window
              width
            </span>
          </span>
          <ColumnCardOptions mode="columns" />
        </label>,
        <label className="flex flex-row items-center justify-between w-full p-2 my-2">
          <span className="flex flex-col gap-0.5">
            <span>Card Style</span>
            <span className="mr-2 text-xs opacity-70">
              <CardStyleDemo />
            </span>
          </span>
          <ColumnCardOptions mode="cards" />
        </label>,
      ],
      // "auto hide nav bar",
    },
    Media: {
      icon: <BiImages className={icons} />,
      settings: [
        ...["autoplay", "hoverplay", "audioOnHover", "nsfw"].map((s: any) => (
          <Toggles
            key={s}
            setting={s}
            withSubtext={true}
            externalStyles="rounded-lg group dark:hover:bg-darkPostHover hover:bg-lightHighlight p-2 cursor-pointer"
          />
        )),
      ],
    },
    // Cards: {
    //   icon: <BiDetail className={icons} />,
    //   settings: [
    //     "show sub icons",
    //     "dim read cards",
    //     "rounded corners",
    //     "Show text body",
    //   ],
    // },
    Comments: {
      icon: <BiComment className={icons} />,
      settings: [
        ...[
          "showUserIcons",
          "showUserFlairs",
          "collapseChildrenOnly",
          "defaultCollapseChildren",
        ].map((s: any) => (
          <Toggles
            key={s}
            setting={s}
            withSubtext={true}
            externalStyles="rounded-lg group dark:hover:bg-darkPostHover hover:bg-lightHighlight p-2 cursor-pointer"
          />
        )),
      ],
    },
    Filters: {
      icon: <FiFilter className={icons} />,
      settings: [
        ...[
          "self",
          "links",
          "images",
          "videos",
          "portrait",
          "landscape",
          "read",
        ].map((f, i) => (
          <div key={i}>
            {/* <div className={"block px-4  text-sm "}> */}
            <ToggleFilters filter={f} withSubtext={true} />
            {/* </div> */}
          </div>
        )),
        <div className={"flex flex-col gap-4 py-2 "}>
          <div className="flex flex-col px-2">
            <h2>Subreddit Filters</h2>
            <h4 className="mb-1 text-xs opacity-70">
              Hide posts from specific subreddits except when directly viewing
            </h4>
            <FilterSubs mode="subs" />
          </div>
          <div className="flex flex-col px-2">
            <h2>User Filters</h2>
            <h4 className="mb-1 text-xs opacity-70">
              Hide posts from specific users everywhere except their user
              profile
            </h4>
            <FilterSubs mode="users" />
          </div>
        </div>,
      ],
    },
    Other: {
      icon: <BiCog className={icons} />,
      settings: [
        ...["showAwardings", "showFlairs"].map((s: any) => (
          <Toggles
            key={s}
            setting={s}
            withSubtext={true}
            externalStyles="rounded-lg group dark:hover:bg-darkPostHover hover:bg-lightHighlight p-2 cursor-pointer"
          />
        )),
      ],
    },
  });

  const refs = Object.keys(categories).reduce((acc, value) => {
    acc[value] = createRef();
    return acc;
  }, {});

  const handleCategoryChange = (id) => {
    refs[id].current.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <Tab.Group
      as={"div"}
      vertical
      className="relative flex w-full max-w-3xl "
      selectedIndex={selectedIndex}
      onChange={(index) => {
        setSelectedIndex(index);
        handleCategoryChange(Object.keys(categories)[index]);
      }}
    >
      <h1 className="absolute ml-0.5 mr-auto text-xl font-semibold -top-20">
        Settings
      </h1>
      <Tab.List
        className={
          "flex flex-col border rounded-lg  py-4 w-16 sm:w-44 px-0 pb-0 flex-none  sm:mr-4 overflow-hidden border-r-0 sm:border-r  rounded-r-none sm:rounded-r-lg  bg-lightPost  border-gray-300 shadow-md dark:bg-darkBG dark:border-trueGray-700"
        }
      >
        {Object.keys(categories).map((category, i) => (
          <Tab key={category} className={" outline-none "}>
            {({ selected }) => (
              <div
                className={
                  (selected
                    ? " font-bold opacity-100 dark:bg-darkPostHover bg-lightPostHover "
                    : "") +
                  " cursor-pointer opacity-50 hover:opacity-80 select-none flex my-1 "
                }
              >
                <div className="w-1 h-12 mt-0 mr-2 dark:bg-darkScroll bg-lightScroll"></div>

                <div className="flex items-center justify-start py-2 pl-1">
                  <span className="">{categories[category]?.icon}</span>
                  <span className="hidden sm:block sm:pl-3">{category}</span>
                </div>
              </div>
            )}
          </Tab>
        ))}
      </Tab.List>
      <Tab.Panels
        className={
          "border bg-lightPost  border-gray-300 shadow-md dark:bg-darkBG dark:border-trueGray-700 rounded-lg rounded-l-none sm:rounded-l-lg p-2 max-h-[60vh]  overflow-y-auto  flex-grow select-none outline-none" +
          " scrollbar-thin scrollbar-thumb-lightScroll scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-darkScroll "
        }
      >
        {Object.keys(categories).map((category, i) => (
          <div key={category} className={"pb-10 sm:px-5"}>
            <h1 ref={refs[category]} className="py-4 text-xl font-semibold">
              {category}
            </h1>
            {categories[category]?.settings?.map((setting) => (
              <div key={setting}>{setting}</div>
            ))}
          </div>
        ))}
      </Tab.Panels>
    </Tab.Group>
  );
};

export default Settings;
