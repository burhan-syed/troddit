import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { AiOutlineFire, AiOutlineRocket } from "react-icons/ai";
import { GoCommentDiscussion } from "react-icons/go";
import { GrNew } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { RiBarChart2Line } from "react-icons/ri";
import { BsCircle, BsChevronDown } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import React from "react";
import { useWindowWidth } from "@react-hook/window-size";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const SortMenu = ({ hide = false, showDropDownIcon = true }) => {
  const [show, setShow] = useState(false);
  const [sort, setSort] = useState<any>("hot");
  const [range, setRange] = useState("");
  const [isUser, setIsUser] = useState(false);
  const [isUserMulti, setIsUserMulti] = useState(false);
  const [isSubFlair, setIsSubFlair] = useState(false);
  const [extraMenu, setExtraMenu] = useState<
    "" | "TOP" | "RELEVANCE" | "COMMENTS"
  >("");
  const router = useRouter();
  const windowWidth = useWindowWidth();
  useEffect(() => {
    router?.query?.t ? setRange(router.query.t.toString()) : setRange("");
    router.query?.sort && setSort(router.query?.sort);
  }, [router.query]);

  useEffect(() => {
    if (
      router.pathname?.includes("/r/") &&
      router.query?.q?.includes("flair")
    ) {
      setIsSubFlair(true);
      setSort(router.query?.sort);
      setRange(router.query?.t?.toString());
    } else if (router.query?.sort) {
      setSort(router.query?.sort);
      router.query?.t && setRange(router.query?.t?.toString());
    } else if (router.pathname?.includes("/u/")) {
      setIsSubFlair(false);
      if (router.query?.slug?.[1] === "m") {
        setIsUserMulti(true);
        router.query?.slug?.[3] && setSort(router.query.slug[3]);
      } else {
        setIsUserMulti(false);
        setIsUser(true);
      }
    } else {
      setIsSubFlair(false);
      setIsUserMulti(false);
      setIsUser(false);
      if (router.query?.slug?.[1] ?? false) setSort(router.query.slug[1]);
      if (router.query?.frontsort ?? false) setSort(router.query.frontsort);
      if (router?.query?.t ?? false) {
        //console.log(router.query.t);
        setRange(router.query.t.toString());
      }
    }

    return () => {
      setSort("hot");
    };
  }, [router]);

  const updateSort = (e, s) => {
    e.preventDefault();
    setSort(s);
    if (s !== "top") {
      if (router.query?.sort) {
        //console.log(router?.asPath, router?.query?.sort, s);
        let path = router.asPath.replace(
          `sort=${router.query.sort}`,
          `sort=${s}`
        );
        if (router.query?.t) {
          path = path.replace(`&t=${router.query.t}`, "");
        }
        router.push(path);
      } else if (router.route === "/search") {
        let q = router.query;
        q["sort"] = s;
        q["t"] = "";
        //console.log(q);
        router.push({
          pathname: "/search",
          query: q,
        });
      } else if (isUserMulti) {
        router.push(
          `/u/${router.query?.slug?.[0]}/m/${router.query?.slug?.[2]}/${s}`
        );
      } else if (router.query?.slug?.[0] ?? false) {
        if (isUser) {
          //console.log(router.query?.slug?.[0]);
          router.push({
            pathname: `/u/${router.query?.slug?.[0]}${
              router.query?.slug?.[1] ? `/${router.query?.slug?.[1]}` : ``
            }`,
            query: {
              sort: s,
            },
          });
        } else {
          router.push(
            `/${isUser ? "u" : "r"}/${router.query?.slug?.[0] ?? "hot"}/${s}${
              router?.query?.m?.length > 0
                ? `?m=${encodeURI(router?.query?.m?.toString())}`
                : ""
            }`
          );
        }
      } else {
        router.push(`/${s}`);
      }
    }
  };

  const updateRange = (e, r, s = "top") => {
    e.preventDefault();
    //console.log(router);
    setRange(r);
    if (router?.query?.sort) {
      let path = router.asPath.replace(
        `sort=${router.query?.sort}`,
        `sort=${s}`
      );
      if (router?.query?.t) {
        path = path.replace(`t=${router.query?.t}`, `t=${r}`);
      } else {
        path = path.replace("?", `?t=${r}&`);
      }
      router.push(path);
    } else if (router.pathname === "/search") {
      let q = router.query;
      q["sort"] = s;
      q["t"] = r;
      router.push({
        pathname: "/search",
        query: q,
      });
    } else if (router.route === "/") {
      router.push({
        pathname: "/top",
        query: {
          t: encodeURI(r),
        },
      });
    } else if (isSubFlair) {
      router.push(
        `/r/${
          router?.query?.slug?.[0]
        }/search?sort=${s}&t=${r}&q=${encodeURIComponent(
          router?.query?.q?.toString()
        )}`
      );
    } else if (isUserMulti) {
      router.push(
        `/u/${router.query?.slug?.[0]}/m/${router.query?.slug?.[2]}/top/?t=${r}`
      );
    } else if (router.query?.slug?.[0] ?? false) {
      if (isUser) {
        //console.log(router.query?.slug?.[0]);
        router.push({
          pathname: `/u/${router.query?.slug?.[0]}${
            router.query?.slug?.[1] ? `/${router.query?.slug?.[1]}` : ``
          }`,
          query: {
            sort: s,
            t: r,
          },
        });
      } else {
        router.push(
          `/${isUser ? "u" : "r"}/${
            router.query?.slug?.[0] ?? "hot"
          }/top/?t=${encodeURI(r)}${
            router?.query?.m?.length > 0
              ? `&m=${encodeURI(router?.query?.m?.toString())}`
              : ""
          }`
        );
      }
    } else if (router.query.frontsort) {
      router.push({
        pathname: "/top",
        query: {
          //frontsort: router.query.frontsort,
          t: encodeURI(r),
        },
      });
    } else {
      router.push(
        `/r/${router.query?.slug?.[0]}/top/?t=${encodeURI(r)}${
          router?.query?.m?.length > 0
            ? `&m=${encodeURI(router?.query?.m?.toString())}`
            : ""
        }`
      );
      // router.push({
      //   pathname: "/top",
      //   query: {
      //     //sort: router.query?.slug?.[1] ?? "",
      //     t: encodeURI(r),
      //     m: router?.query?.m
      //   },
      // });
    }
  };

  const disabled =
    router.pathname !== "/r/[...slug]" &&
    router.pathname !== "/" &&
    router.pathname !== "/[frontsort]" &&
    router.pathname !== "/u/[...slug]" &&
    router.pathname !== "/search";

  return (
    <>
      <Menu
        as="div"
        className="relative flex flex-col items-center flex-grow w-full h-full select-none"
      >
        {({ open }) => (
          <>
            <div className="flex-grow w-full">
              <Menu.Button
                disabled={disabled}
                aria-label="sort by"
                name="Sort Page By"
                className={
                  (disabled ? "  " : " hover:border-th-border ") +
                  " flex flex-row items-center justify-between w-full h-full px-2 border border-transparent rounded-md focus:outline-none "
                }
              >
                {showDropDownIcon && (
                  <BsChevronDown
                    className={
                      (open ? "rotate-180" : "rotate-0") +
                      " transform transition duration-200 flex-none"
                    }
                  />
                )}

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
                {sort === "rising" || sort === "relevance" ? (
                  <div className="flex flex-row items-baseline justify-between">
                    <IoMdTrendingUp className="flex-none w-6 h-6 mr-1" />
                  </div>
                ) : (
                  ""
                )}
                {router?.query?.sort === "comments" ? (
                  <div className="flex flex-row items-baseline justify-between">
                    <GoCommentDiscussion className="flex-none w-6 h-6 mr-1" />
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
                  "absolute right-0 w-40 mt-10  origin-top-right bg-th-background2 rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border z-50 " +
                  (hide && " hidden") 
                }
              >
                <div className="py-1">
                  {/* Best */}
                  {!isUser && (
                    <Menu.Item disabled={isUser}>
                      {({ active }) => (
                        <div
                          onTouchStart={(e) => setExtraMenu("")}
                          onClick={(e) => updateSort(e, "best")}
                          className={classNames(
                            active ? "bg-th-highlight" : "",
                            "block px-4 py-1 text-sm"
                          )}
                        >
                          <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                            <AiOutlineRocket className="flex-none w-5 h-5" />{" "}
                            <span
                              className={sort === "best" ? " font-bold bg-th-highlight " : ""}
                            >
                              Best
                            </span>
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  )}
                  {/* Hot */}
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        onTouchStart={(e) => setExtraMenu("")}
                        onClick={(e) => updateSort(e, "hot")}
                        className={classNames(
                          active || sort === "hot" ? "bg-th-highlight" : "",
                          "block px-4 py-1 text-sm"
                        )}
                      >
                        <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                          <AiOutlineFire className="flex-none w-5 h-5" />
                          <span className={sort === "hot" ? " font-bold " : ""}>
                            Hot
                          </span>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                  {/* New */}
                  <Menu.Item>
                    {({ active }) => (
                      <div className="group">
                        <div
                          onTouchStart={(e) => setExtraMenu("")}
                          onClick={(e) =>
                            isSubFlair
                              ? updateRange(e, "all", "new")
                              : updateSort(e, "new")
                          }
                          className={classNames(
                            active || sort === "new" ? "bg-th-highlight" : "",
                            "block px-4 py-1 text-sm"
                          )}
                        >
                          <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                            <BsCircle className="flex-none w-5 h-5" />{" "}
                            <span
                              className={sort === "new" ? " font-bold " : ""}
                            >
                              New
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                  {/* Top */}
                  <Menu.Item>
                    {({ active }) => (
                      <div className="group">
                        <button
                          className={classNames(
                            active || sort==="top" ? "bg-th-highlight" : "",
                            "block px-4 py-1 text-sm w-full outline-none "
                          )}
                          onTouchStart={(e) => setExtraMenu("TOP")}
                          onClick={(e) => {
                            if (extraMenu === "TOP") {
                              e.stopPropagation();
                              e.preventDefault();
                            } else {
                              updateRange(e, "all");
                            }
                          }}
                        >
                          <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                            <RiBarChart2Line className="flex-none w-5 h-5" />
                            <span
                              className={sort === "top" ? " font-bold " : ""}
                            >
                              Top
                            </span>
                          </div>
                        </button>
                        <ul
                          className={
                            (active || extraMenu === "TOP"
                              ? "block "
                              : "hidden ") +
                            (isUser ? "top-12 " : "top-24 ") +
                            "absolute  w-32 -left-32  bg-th-background2 rounded-md shadow-lg border border-th-border ring-1 ring-th-base text-right"
                          }
                        >
                          <li>
                            <div
                              className={
                                (range === "hour" && sort === "top"
                                  ? `font-bold bg-th-highlight`
                                  : "") +
                                " px-3 py-3.5 text-sm hover:bg-th-highlight mt-1 cursor-pointer"
                              }
                              onClick={(e) => {
                                updateRange(e, "hour");
                              }}
                            >
                              Hour
                            </div>
                          </li>
                          <li>
                            <div
                              className={
                                (range === "day" && sort === "top"
                                  ? `font-bold bg-th-highlight`
                                  : "") +
                                " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                              }
                              onClick={(e) => {
                                updateRange(e, "day");
                              }}
                            >
                              24 Hours
                            </div>
                          </li>
                          <li>
                            <div
                              className={
                                (range === "week" && sort === "top"
                                  ? `font-bold bg-th-highlight`
                                  : "") +
                                " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                              }
                              onClick={(e) => {
                                updateRange(e, "week");
                              }}
                            >
                              Week
                            </div>
                          </li>
                          <li>
                            <div
                              className={
                                (range === "month" && sort === "top"
                                  ? `font-bold bg-th-highlight`
                                  : "") +
                                " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                              }
                              onClick={(e) => {
                                updateRange(e, "month");
                              }}
                            >
                              Month
                            </div>
                          </li>
                          <li>
                            <div
                              className={
                                (range === "year" && sort === "top"
                                  ? `font-bold bg-th-highlight`
                                  : "") +
                                " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                              }
                              onClick={(e) => {
                                updateRange(e, "year");
                              }}
                            >
                              Year
                            </div>
                          </li>
                          <li>
                            <div
                              className={
                                (range === "all" && sort === "top"
                                  ? `font-bold bg-th-highlight `
                                  : "") +
                                " px-3 py-3.5 text-sm mb-1 hover:bg-th-highlight cursor-pointer "
                              }
                              onClick={(e) => {
                                updateRange(e, "all");
                              }}
                            >
                              All
                            </div>
                          </li>
                        </ul>
                      </div>
                    )}
                  </Menu.Item>
                  {/* Relevance */}
                  {(isSubFlair ||
                    router.route === "/search" ||
                    router.query.q) && (
                    <Menu.Item
                      disabled={
                        !(
                          isSubFlair ||
                          router.route === "/search" ||
                          router.query.q
                        )
                      }
                    >
                      {({ active }) => (
                        <div className="group">
                          <button
                            className={classNames(
                              active || sort==="relevance" ? "bg-th-highlight" : "",
                              "block px-4 py-1 text-sm w-full"
                            )}
                            onTouchStart={(e) => setExtraMenu("RELEVANCE")}
                            onClick={(e) => {
                              if (extraMenu === "RELEVANCE") {
                                e.stopPropagation();
                                e.preventDefault();
                              } else {
                                updateRange(e, "all", "relevance");
                              }
                            }}
                          >
                            <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                              <IoMdTrendingUp className="flex-none w-5 h-5" />
                              <span
                                className={
                                  sort === "relevance" ? " font-bold " : ""
                                }
                              >
                                Relevance
                              </span>
                            </div>
                          </button>
                          {true && (
                            <ul
                              className={
                                (active || extraMenu === "RELEVANCE"
                                  ? "block "
                                  : "hidden ") +
                                (true && "top-36 ") +
                                "absolute  w-32 -left-32  bg-th-background2 rounded-md shadow-lg border border-th-border ring-1 ring-th-base text-right"
                              }
                            >
                              <li>
                                <div
                                  className={
                                    (range === "hour" && sort === "relevance"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight mt-1 cursor-pointer"
                                  }
                                  onClick={(e) => {
                                    updateRange(e, "hour", "relevance");
                                  }}
                                >
                                  Hour
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "day" && sort === "relevance"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) => {
                                    updateRange(e, "day", "relevance");
                                  }}
                                >
                                  24 Hours
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "week" && sort === "relevance"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) => {
                                    updateRange(e, "week", "relevance");
                                  }}
                                >
                                  Week
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "month" && sort === "relevance"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) => {
                                    updateRange(e, "month", "relevance");
                                  }}
                                >
                                  Month
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "year" && sort === "relevance"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) => {
                                    updateRange(e, "year", "relevance");
                                  }}
                                >
                                  Year
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "all" && sort === "relevance"
                                      ? `font-bold bg-th-highlight `
                                      : "") +
                                    " px-3 py-3.5 text-sm mb-1 hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) => {
                                    updateRange(e, "all", "relevance");
                                  }}
                                >
                                  All
                                </div>
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  )}
                  {/* Comments */}
                  {(router.route === "/search" || router.query.q) && (
                    <Menu.Item
                      disabled={!(router.route === "/search" || router.query.q)}
                    >
                      {({ active }) => (
                        <div className="group">
                          <button
                            className={classNames(
                              active || sort === "comments" ? "bg-th-highlight" : "",
                              "block px-4 py-1 text-sm w-full"
                            )}
                            onTouchStart={() => setExtraMenu("COMMENTS")}
                            onClick={(e) => {
                              if (extraMenu === "COMMENTS") {
                                e.stopPropagation();
                                e.preventDefault();
                              } else {
                                updateRange(e, "all", "comments");
                              }
                            }}
                          >
                            <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                              <GoCommentDiscussion className="flex-none w-5 h-5" />
                              <span
                                className={
                                  sort === "comments" ? " font-bold " : ""
                                }
                              >
                                Comments
                              </span>
                            </div>
                          </button>
                          {true && (
                            <ul
                              className={
                                (active || extraMenu === "COMMENTS" ? "block " : "hidden ") +
                                (true && "top-48 ") +
                                "absolute  w-32 -left-32  bg-th-background2 rounded-md shadow-lg border border-th-border ring-1 ring-th-base text-right"
                              }
                            >
                              <li>
                                <div
                                  className={
                                    (range === "hour" && sort === "comments"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight mt-1 cursor-pointer"
                                  }
                                  onClick={(e) => 
                                    updateRange(e, "hour", "comments")
                                  }
                                >
                                  Hour
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "day" && sort === "comments"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) =>
                                    updateRange(e, "day", "comments")
                                  }
                                >
                                  24 Hours
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "week" && sort === "comments"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) =>
                                    updateRange(e, "week", "comments")
                                  }
                                >
                                  Week
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "month" && sort === "comments"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) =>
                                    updateRange(e, "month", "comments")
                                  }
                                >
                                  Month
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "year" && sort === "comments"
                                      ? `font-bold bg-th-highlight`
                                      : "") +
                                    " px-3 py-3.5 text-sm hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) =>
                                    updateRange(e, "year", "comments")
                                  }
                                >
                                  Year
                                </div>
                              </li>
                              <li>
                                <div
                                  className={
                                    (range === "all" && sort === "comments"
                                      ? `font-bold bg-th-highlight `
                                      : "") +
                                    " px-3 py-3.5 text-sm mb-1 hover:bg-th-highlight cursor-pointer "
                                  }
                                  onClick={(e) =>
                                    updateRange(e, "all", "comments")
                                  }
                                >
                                  All
                                </div>
                              </li>
                            </ul>
                          )}
                        </div>
                      )}
                    </Menu.Item>
                  )}
                  {/* Rising */}
                  {!isUser &&
                    !isSubFlair &&
                    router.route !== "/search" &&
                    !router?.query?.q && (
                      <Menu.Item
                        disabled={
                          !(
                            !isUser &&
                            !isSubFlair &&
                            router.route !== "/search" &&
                            !router?.query?.q
                          )
                        }
                      >
                        {({ active }) => (
                          <div
                            onTouchStart={() => setExtraMenu("")}
                            onClick={(e) => updateSort(e, "rising")}
                            className={classNames(
                              active || sort === "rising" ? "bg-th-highlight" : "",
                              "block px-4 py-1 text-sm "
                            )}
                          >
                            <div className="flex flex-row items-center justify-between h-10 cursor-pointer">
                              <IoMdTrendingUp className="flex-none w-5 h-5" />{" "}
                              <span
                                className={
                                  sort === "rising" ? " font-bold" : ""
                                }
                              >
                                Rising
                              </span>
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
    </>
  );
};

export default SortMenu;
