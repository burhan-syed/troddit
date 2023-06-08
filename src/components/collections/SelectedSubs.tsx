import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useCollectionContext } from "./CollectionContext";
import CollectionOptions from "./CollectionOptions";
import { BsArrowRight } from "react-icons/bs";
import { MdOutlineClear } from "react-icons/md";

const SelectedSubs = () => {
  const myCollections: any = useCollectionContext();
  const { selected, clearAll, toggleSelected } = myCollections;

  if (selected?.length < 1) {
    return <></>;
  }

  return (
    <div
      className={
        "p-2 px-4 text-sm transition-colors border bg-th-post border-th-border rounded-md shadow-md  hover:shadow-2xl  select-none"
      }
    >
      <div className="flex flex-row items-center gap-2">
        <h1 className="mr-auto text-lg">{selected.length} Selected</h1>
        <button
          aria-label="clear selected"
          className="flex items-center justify-center w-10 border rounded-md h-9 hover:bg-th-highlight hover:border-th-borderHighlight border-th-border "
          onClick={clearAll}
        >
          <MdOutlineClear className="flex-none w-4 h-4" />
        </button>
        <CollectionOptions subArray={selected} />

        <Link
          href={`/r/${selected.join("+")}`}
          className="flex items-center justify-center w-16 p-2 border rounded-md h-9 hover:bg-th-highlight border-th-border hover:border-th-borderHighlight ">

          {/* <span className="mr-1">Go</span> */}
          <BsArrowRight className="flex-none w-6 h-5 " />

        </Link>
      </div>
      <div className="my-2"></div>
      <div
        className={
          "flex flex-row flex-wrap gap-1 overflow-y-scroll max-h-32 " +
          " scrollbar-thin  scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-th-scrollbar "
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
                "flex  items-center px-2 text-sm py-1 gap-1 border rounded-full select-none border-th-border hover:border-th-borderHighlight bg-th-post hover:bg-th-highlight group cursor-pointer "
              }
              onClick={() => toggleSelected(s)}
            >
              <div className=" flex items-center justify-center  rounded-full p-0.5  ">
                <MdOutlineClear className="flex-none w-4 h-4 transition group-hover:scale-125 " />
              </div>
              <h1 className="mr-1 -mt-0.5">{s}</h1>
            </div>
          ))}
      </div>
    </div>
  );
};

export default SelectedSubs;
