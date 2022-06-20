import { Transition } from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { BsChevronDown } from "react-icons/bs";
import FilterSubs from "../FilterSubs";

const FilterEntities = () => {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  return (
    <>
      <div
        className="flex flex-row items-center justify-between py-1 rounded-lg cursor-pointer hover:bg-th-highlight "
        onClick={() => setAdvancedOpen((o) => !o)}
      >
        <h1 className="px-2">Advanced</h1>
        <BsChevronDown
          className={
            (advancedOpen ? "-rotate-180" : "rotate-0") +
            " transform transition duration-400 mr-4"
          }
        />
      </div>
      <Transition
            as={Fragment}
            show={advancedOpen}
            enter="transition ease-out duration-100 origin-top"
            enterFrom="transform opacity-0 scale-y-0"
            enterTo="transform opacity-100 scale-y-100"
            leave="transition ease-in duration-100 origin-top"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-y-0"
          >
      {/* {advancedOpen && ( */}
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
        </div>
      {/* )} */}
      </Transition>
    </>
  );
};

export default FilterEntities;
