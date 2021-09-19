import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiOutlineFire, AiOutlineRocket } from "react-icons/ai";
import { GrNew } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { RiBarChart2Line } from "react-icons/ri";
import { BsCircle, BsChevronDown } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SortMenu2 = ({ hide = false }) => {
  const [show, setShow] = useState(false);
  const [sort, setSort] = useState<any>("hot");
  const [range, setRange] = useState("");

  const router = useRouter();
  useEffect(() => {
    //console.log(router.query);
    if (router.query?.slug?.[1] ?? false) setSort(router.query.slug[1]);
    if (router.query?.frontsort ?? false) setSort(router.query.frontsort);
    if (router?.query?.t ?? false) {
      //console.log(router.query.t);
      setRange(router.query.t.toString());
    }
    return () => {
      setSort("hot");
    };
  }, [router.query]);

  const updateSort = (e, s) => {
    e.preventDefault();
    setSort(s);
    if (s !== "top") {
      //console.log(`r/${router?.query ?? "popular"}/${s}`);

      if (router.query?.slug?.[0] ?? false) {
        router.push(`/r/${router.query?.slug?.[0] ?? "popular"}/${s}`);
      } else {
        router.push(`/${s}`);
      }
    }
  };

  const updateRange = (e, r) => {
    e.preventDefault();
    //console.log(router.query);
    setRange(r);
    if (router.query?.slug?.[0] ?? false) {
      router.push(
        `/r/${router.query?.slug?.[0] ?? "popular"}/top/?t=${encodeURI(r)}`
      );
    } else if (router.query.frontsort) {
      router.push({
        pathname: "/top",
        query: {
          //frontsort: router.query.frontsort,
          t: encodeURI(r),
        },
      });
    } else {
      router.push({
        pathname: "/top",
        query: {
          //sort: router.query?.slug?.[1] ?? "",
          t: encodeURI(r),
        },
      });
    }
  };

  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center flex-grow w-full h-full"
    >
      {({ open }) => (
        <>
          <div className="flex-grow w-full">
            <Menu.Button
              name="Sort Page By"
              className="flex flex-row items-center justify-between w-full h-full px-2 bg-white border border-white rounded-md dark:border-darkBG hover:border-lightBorder dark:hover:border-darkBorder focus:outline-none dark:bg-darkBG"
            >
              <BsChevronDown
                className={
                  open
                    ? "rotate-180"
                    : "rotate-0" + "transform transition duration-200 flex-none"
                }
              />

              {sort === "best" ? (
                <div className="flex flex-row items-center justify-between">
                  <AiOutlineRocket className="flex-none w-6 h-6 mr-1" />
                </div>
              ) : (
                ""
              )}
              {sort === "hot" ? (
                <div className="flex flex-row items-baseline justify-between">
                  <AiOutlineFire className="flex-none w-6 h-6 mr-1" />
                </div>
              ) : (
                ""
              )}
              {sort === "" ? (
                <div className="flex flex-row items-baseline justify-between">
                  <AiOutlineFire className="flex-none w-6 h-6 mr-1" />
                </div>
              ) : (
                ""
              )}
              {sort === "top" ? (
                <div className="flex flex-row items-baseline justify-between">
                  <RiBarChart2Line className="flex-none w-6 h-6 mr-1" />
                </div>
              ) : (
                ""
              )}
              {sort === "new" ? (
                <div className="flex flex-row items-baseline justify-between">
                  <BsCircle className="flex-none w-6 h-6 mr-1" />
                </div>
              ) : (
                ""
              )}
              {sort === "rising" ? (
                <div className="flex flex-row items-baseline justify-between">
                  <IoMdTrendingUp className="flex-none w-6 h-6 mr-1" />
                </div>
              ) : (
                ""
              )}
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
                "absolute right-0 w-40 mt-11 origin-top-right bg-white dark:bg-darkBG rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-lightBorder dark:border-darkBorder " +
                (hide && " hidden")
              }
            >
              <div className="py-1">
                {/* Best */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => updateSort(e, "best")}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center justify-between h-10">
                        <AiOutlineRocket className="flex-none w-5 h-5" />{" "}
                        <span> Best </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Hot */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => updateSort(e, "hot")}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center justify-between h-10">
                        <AiOutlineFire className="flex-none w-5 h-5" />{" "}
                        <span> Hot </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Top */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className="group"
                      onClick={(e) => updateRange(e, "day")}
                    >
                      <div
                        className={classNames(
                          active
                            ? "bg-lightHighlight dark:bg-darkHighlight"
                            : "",
                          "block px-4 py-1 text-sm"
                        )}
                      >
                        <div className="flex flex-row items-center justify-between h-10">
                          <RiBarChart2Line className="flex-none w-5 h-5" />{" "}
                          <span> Top </span>{" "}
                        </div>
                      </div>
                      <ul
                        className={
                          (active ? "block " : "hidden ") +
                          "absolute top-24 w-32 -left-32 group-hover:block group-focus:block bg-white dark:bg-darkBG rounded-md shadow-lg border border-lightBorder dark:border-darkBorder text-right"
                        }
                      >
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={
                                (range === "hour" ? `font-bold` : "") +
                                " px-3 py-3.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight mt-1"
                              }
                              onClick={(e) => updateRange(e, "hour")}
                            >
                              Now
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={
                                (range === "today" ? `font-bold` : "") +
                                " px-3 py-3.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight "
                              }
                              onClick={(e) => updateRange(e, "today")}
                            >
                              Today
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={
                                (range === "week" ? `font-bold` : "") +
                                " px-3 py-3.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight "
                              }
                              onClick={(e) => updateRange(e, "week")}
                            >
                              Week
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={
                                (range === "month" ? `font-bold` : "") +
                                " px-3 py-3.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight "
                              }
                              onClick={(e) => updateRange(e, "month")}
                            >
                              Month
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={
                                (range === "year" ? `font-bold` : "") +
                                " px-3 py-3.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight "
                              }
                              onClick={(e) => updateRange(e, "year")}
                            >
                              Year
                            </div>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <div
                              className={
                                (range === "all" ? `font-bold ` : "") +
                                " px-3 py-3.5 text-sm mb-1 hover:bg-lightHighlight dark:hover:bg-darkHighlight "
                              }
                              onClick={(e) => updateRange(e, "all")}
                            >
                              All
                            </div>
                          )}
                        </Menu.Item>
                      </ul>
                    </div>
                  )}
                </Menu.Item>
                {/* New */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => updateSort(e, "new")}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center justify-between h-10">
                        <BsCircle className="flex-none w-5 h-5" />{" "}
                        <span> New </span>
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {/* Rising */}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => updateSort(e, "rising")}
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-1 text-sm "
                      )}
                    >
                      <div className="flex flex-row items-center justify-between h-10">
                        <IoMdTrendingUp className="flex-none w-5 h-5" />{" "}
                        <span> Rising </span>
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

export default SortMenu2;
