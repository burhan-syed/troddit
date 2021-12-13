import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiOutlineFire, AiOutlineRocket } from "react-icons/ai";
import { GrNew } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { RiBarChart2Line } from "react-icons/ri";
import { BsCircle, BsChevronDown } from "react-icons/bs";
import { useState, useEffect } from "react";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const CommentSort = ({ updateSort, sortBy="top" }) => {
  const [sort, setsort] = useState(sortBy);
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
              name="Sort Comments By"
              className="flex flex-row items-center justify-between h-full px-2 bg-white border border-white rounded-md dark:border-darkBG hover:border-lightBorder dark:hover:border-darkBorder focus:outline-none dark:bg-darkBG"
            >
              <div className="mr-2">{`sort comments by ${sort}`}</div>
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
                "absolute right-0 w-40 mt-11 origin-top-right bg-white dark:bg-darkBG rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-lightBorder dark:border-darkBorder select-none cursor-pointer "
                // + (hide && " hidden")
              }
            >
              <div className="py-1">
                {/* Best */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        updateSort(e, "confidence");
                        setsort("best");
                      }}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center h-6">
                        <span> best </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Top */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        updateSort(e, "top");
                        setsort("top");
                      }}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center h-6">
                        <span> top </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* New */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className="group"
                      onClick={(e) => {
                        updateSort(e, "new");
                        setsort("new");
                      }}
                    >
                      <div
                        className={classNames(
                          active
                            ? "bg-lightHighlight dark:bg-darkHighlight"
                            : "",
                          "block px-4 py-1 text-sm"
                        )}
                      >
                        <div className="flex flex-row items-center h-6">
                          <span> new </span>{" "}
                        </div>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Controversial */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        updateSort(e, "controversial");
                        setsort("controversial");
                      }}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center h-6">
                        <span> controversial </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Old */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        updateSort(e, "old");
                        setsort("old");
                      }}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm "
                      )}
                    >
                      <div className="flex flex-row items-center h-6">
                        <span> old </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Q&A */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        updateSort(e, "qa");
                        setsort("q & a");
                      }}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm "
                      )}
                    >
                      <div className="flex flex-row items-center h-6">
                        <span> {"q & a"} </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
  );
};

export default CommentSort;
