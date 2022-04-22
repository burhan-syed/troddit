import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCollectionContext } from "./CollectionContext";
import CollectionOptions from "./CollectionOptions";
import { MdClear } from "react-icons/md";
import { BsArrowRight } from "react-icons/bs";
import { AiOutlinePlus } from "react-icons/ai";

const SelectedSubs = () => {
  const myCollections: any = useCollectionContext();
  const { selected, clearAll, toggleSelected } = myCollections;

  if (selected?.length < 1) {
    return <></>;
  }

  return (
    <div
      className={
        "p-2 px-4 text-sm transition-colors border border-gray-300 rounded-md shadow-md bg-lightPost hover:shadow-2xl dark:bg-darkBG dark:border-trueGray-700 select-none"
      }
    >
      <div className="flex flex-row items-center gap-2">
        <h1 className="mr-auto text-lg">{selected.length} Selected</h1>
        <button
          className="flex items-center justify-center w-10 border rounded-md h-9 dark:hover:bg-darkPostHover dark:border-darkBorder dark:hover:border-darkBorderHighlight hover:border-lightBorderHighlight hover:bg-lightHighlight "
          onClick={clearAll}
        >
          <MdClear className="flex-none w-4 h-4" />
        </button>
        <CollectionOptions subArray={selected} />

        <Link href={`r/${selected.join("+")}`}>
          <a className="flex items-center justify-center w-16 p-2 border rounded-md h-9 dark:hover:bg-darkPostHover dark:border-darkBorder dark:hover:border-darkBorderHighlight hover:bg-lightHighlight hover:border-lightBorderHighlight">
            {/* <span className="mr-1">Go</span> */}
            <BsArrowRight className="flex-none w-6 h-5 " />
          </a>
        </Link>
      </div>
      <div className="my-2"></div>
      <div
        className={
          "flex flex-row flex-wrap gap-1 overflow-y-scroll max-h-32 " +
          " scrollbar-thin  scrollbar-thumb-lightScroll scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-darkScroll "
        }
      >
        {selected
          ?.sort((a, b) => {
            let A = a?.toUpperCase();
            let B = b?.toUpperCase();
            return A < B ? -1 : A > B ? 1 : 0;
          })
          ?.map((s) => (
            <div
              key={s}
              className={
                "flex  items-center px-2 text-sm py-1 gap-1 border rounded-full select-none dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover group cursor-pointer "
              }
              onClick={() => toggleSelected(s)}
            >
              <div className="  rounded-full p-0.5 dark:group-border-darkPostHover dark:group-hover:bg-trueGray-900  ">
                <AiOutlinePlus className="flex-none w-4 h-4 transition rotate-45 group-hover:scale-125 " />
              </div>
              <h1 className="mr-1 -mt-0.5">{s}</h1>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SelectedSubs;
