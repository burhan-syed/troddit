import { Menu, Transition } from "@headlessui/react";
import { COMMENT_SORTS } from "../CommentSort.tsx";
import { useMainContext } from "../../MainContext";
import React, { Fragment, useEffect, useState } from "react";

// This module borrows heavily from ThemeSelector.tsx
// It would be ideal to refactor the two files and create a generic Selector
// menu for the settings screen that could be reused.

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SortSelector = (mode: "posts" | "comments") => {
  const context: any = useMainContext();

  let SORTS, sort, setSort;

  if (mode === "posts") {
    throw Error("Not implemented")
    /* TODO: Implement default post sort order
    SORTS = POST_SORTS;
    sort = context.defaultSortPosts;
    setSort = context.setDefaultSortPosts.bind(context);
    */
  } else {
    SORTS = COMMENT_SORTS;
    sort = context.defaultSortComments;
    setSort = context.setDefaultSortComments.bind(context);
  }

  let sortFriendlyName = SORTS[sort];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Menu as={"div"} className="relative w-full">
      <Menu.Button
        aria-label="options"
        title={"options"}
        name="Options"
        className="w-full py-2 capitalize border rounded-md focus:outline-none hover:bg-th-highlight border-th-border hover:border-th-borderHighlight"
      >
        {mounted ? sortFriendlyName : ""}
      </Menu.Button>
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
            "absolute z-10 right-0 mt-1 py-2 w-full origin-top   rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border bg-th-background2 "
          }
        >
          {Object.entries(SORTS).map(([key, friendlyName]) => (
            <Menu.Item key={key}>
              {({ active, disabled }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4 py-2 text-sm cursor-pointer",
                    disabled ? "hidden" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setSort(key);
                  }}
                >
                  <div className="flex flex-row items-center justify-center h-6 capitalize">
                    {friendlyName}
                  </div>
                </div>
              )}
            </Menu.Item>

          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default SortSelector;
