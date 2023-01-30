import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiOutlineFire, AiOutlineRocket } from "react-icons/ai";
import { GrNew } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { RiBarChart2Line } from "react-icons/ri";
import { BsCircle, BsChevronDown } from "react-icons/bs";
import { useState, useEffect } from "react";
import React from "react";
import { useMainContext } from "../MainContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

// Mapping of internal key to friendly display
export const COMMENT_SORTS = {
  confidence: "Best",
  top: "Top",
  new: "New",
  controversial: "Controversial",
  old: "Old",
  qa: "Q&A"
};

const CommentSort = ({ updateSort, sortBy }) => {
  const context: any = useMainContext();
  sortBy ??= context.defaultSortComments;

  const [sort, setSort] = useState(sortBy);
  //confidence (best),top,new,controversial,old,qa (Q&A)

  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center w-full h-full "
    >
      {({ open }) => (
        <>
          <div className="flex-grow ">
            <Menu.Button
              aria-label="Sort Comments By"
              name="Sort Comments By"
              className="flex flex-row items-center justify-between h-full px-2 border rounded-md border-th-border bg-th-background2 focus:outline-none hover:border-th-borderHighlight"
            >
              <div className="flex gap-1 mr-2">
                <span className="hidden sm:block">{"sort comments by"}</span>
                <span className="block sm:hidden">{"sort by"}</span>
                <span>{COMMENT_SORTS[sort]}</span>
              </div>
              <BsChevronDown
                className={
                  open
                    ? "-rotate-180"
                    : "rotate-0" + "transform transition duration-200 flex-none"
                }
              />
            </Menu.Button>
          </div>

          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items
              className={
                "absolute right-0 w-40 mt-11 origin-top-right rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border ring-th-base border-th-border bg-th-background2 select-none cursor-pointer "
                // + (hide && " hidden")
              }
            >
              <div className="py-1">
                {Object.entries(COMMENT_SORTS).map(([k, friendlyName]) =>
                  <Menu.Item key={k}>
                      {({ active }) => (
                          <div
                              onClick={(e) => {
                                  updateSort(e, k);
                                  setSort(k);
                              }}
                              className={classNames(
                                  active ? "bg-th-highlight" : "",
                                  "block px-4 py-1 text-sm"
                              )}
                          >
                              <div className="flex flex-row items-center h-6">
                                  <span>{friendlyName}</span>
                              </div>
                          </div>
                      )}
                  </Menu.Item>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default CommentSort;
