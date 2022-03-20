import { Menu, Transition } from "@headlessui/react";
import { signIn, useSession } from "next-auth/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useRef, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BiRightTopArrowCircle } from "react-icons/bi";
import { BsChevronDown, BsList } from "react-icons/bs";
import { CgLivePhoto, CgPlayListSearch } from "react-icons/cg";
import { useSubsContext } from "../MySubs";
import DropdownItem from "./DropdownItem";
import DropdownSubCard from "./DropdownSubCard";

const MyLink = (props) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
};

const DropDownItems = ({ show, hideExtra = false }) => {
  const subsContext: any = useSubsContext();
  const {
    mySubs,
    myFollowing,
    myLocalSubs,
    myLocalMultis,
    myMultis,
    multi,
    loadedSubs,
    loadedMultis,
    error,
    currSubInfo,
    currLocation,
    tryLoadAll,
  } = subsContext;
  const router = useRouter();
  const [session, loading] = useSession();
  const [filter, setFilter] = useState("");
  const filterRef = useRef(null);
  const [expand, setExpand] = useState(false);
  const [expandMultis, setExpandMultis] = useState(true);
  const [expandSubs, setExpandSubs] = useState(true);
  const [expandFollowing, setExpandFollowing] = useState(true);
  const [myLocalSubsFiltered, setMyLocalSubsFiltered] = useState([]);
  const [myLocalFollows, setMyLocalFollows] = useState([]);

  useEffect(() => {
    tryLoadAll();
  }, [show]);

  useEffect(() => {
    show && filterRef?.current?.focus();
  }, [show, filterRef?.current]);

  useEffect(() => {
    let subs = [];
    let follows = [];
    //console.log(myLocalSubs);
    if (myLocalSubs?.length > 0) {
      myLocalSubs.forEach((s) => {
        if (s.data.url.substring(0, 3) === "/u/") {
          follows.push(s);
        } else {
          subs.push(s);
        }
      });
      setMyLocalSubsFiltered(subs);
      setMyLocalFollows(follows);
    }
  }, [myLocalSubs]);

  const constructMultiLink = (multi) => {
    let subs = [];
    multi?.data?.subreddits?.forEach((s) => subs.push(s?.name));
    return `/r/${subs.join("+")}?m=${multi?.data?.name}`;
  };

  return (
    <>
      <div className="flex flex-col py-2 font-light">
        {(router.pathname.includes("/r/") || router.pathname.includes("/u/")) &&
          currSubInfo &&
          mySubs &&
          !multi &&
          currLocation !== "HOME" &&
          currLocation !== "ALL" &&
          currLocation !== "POPULAR" && (
            <div className="py-2 pl-3 pr-4 hover:bg-lightHighlight dark:hover:bg-darkHighlight">
              <DropdownSubCard
                sub={{
                  kind: "t5",
                  data: currSubInfo?.data?.subreddit ?? currSubInfo?.data,
                }}
                userMode={router.pathname.includes("/u/") ? true : false}
                // mySubs={mySubs.length > 0 ? mySubs : myLocalSubs}
                // // refresh={loadAllSubs}
                // refresh={undefined}
                // subsLoaded={loadedSubs}
              />
            </div>
          )}
        <Menu.Item>
          {({ active }) => (
            <MyLink href="/" passHref>
              <div
                className={
                  (active ? "bg-lightHighlight dark:bg-darkHighlight " : " ") +
                  " flex flex-row items-center py-1.5 space-x-2  pl-4 cursor-pointer"
                }
              >
                <AiOutlineHome className="w-6 h-6" />
                <h1 className="">Home</h1>
              </div>
            </MyLink>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <MyLink href="/r/popular" passHref>
              <div
                className={
                  (active ? "bg-lightHighlight dark:bg-darkHighlight " : " ") +
                  " flex flex-row items-center py-1.5 h-9 space-x-2  pl-4 cursor-pointer"
                }
              >
                <BiRightTopArrowCircle className="w-6 h-6" />
                <h1>Popular</h1>
              </div>
            </MyLink>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <MyLink href="/r/all" passHref>
              <div
                className={
                  (active ? "bg-lightHighlight dark:bg-darkHighlight " : " ") +
                  " flex flex-row items-center py-1.5 h-9 space-x-2  pl-4 cursor-pointer"
                }
              >
                <CgLivePhoto className="w-6 h-6" />
                <h1>All</h1>
              </div>
            </MyLink>
          )}
        </Menu.Item>
        <Menu.Item>
          {({ active }) => (
            <MyLink href="/subreddits" passHref>
              <div
                className={
                  (active ? "bg-lightHighlight dark:bg-darkHighlight " : " ") +
                  " flex flex-row items-center py-1.5 h-9 space-x-2  pl-4 cursor-pointer"
                }
              >
                <CgPlayListSearch className="w-7 h-7 -mr-0.5" />
                <h1 className="mb-1">Subreddits</h1>
              </div>
            </MyLink>
          )}
        </Menu.Item>
      </div>
      {!hideExtra && (
        <div className="flex flex-row items-center justify-center mx-1 mb-2">
          <input
            ref={filterRef}
            type="text"
            placeholder="Filter.."
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            className="w-full mx-2 px-2 border py-1.5 outline-none text-sm rounded border-lightBorder bg-transparent dark:bg-darkBG dark:border-darkBorder dark:text-lightText"
          />
        </div>
      )}
      {!session && (
        <>
          {myLocalMultis?.length > 0 && (
            <>
              <Menu.Item>
                <div
                  onClick={() => setExpandMultis((m) => !m)}
                  className={
                    "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                    (expandMultis ? " " : " mb-2")
                  }
                >
                  <p>multis</p>
                  {!hideExtra && (
                    <BsChevronDown
                      className={
                        (expandMultis ? "-rotate-180 " : "rotate-0 ") +
                        "transform transition duration-200"
                      }
                    />
                  )}
                </div>
              </Menu.Item>
              <div
                className={
                  " " +
                  (expandMultis ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                <div className="py-2">
                  {myLocalMultis
                    ? myLocalMultis
                        // .filter(
                        //   (multi) =>
                        //     filter === "" ||
                        //     multi.data?.display_name_prefixed
                        //       ?.toUpperCase()
                        //       .includes(filter.toUpperCase()) ||
                        //     multi.data?.display_name
                        //       ?.toUpperCase()
                        //       .includes(filter.toUpperCase())
                        // )
                        .map((multi, i) => {
                          return (
                            <Menu.Item
                              key={`${i}_${multi.data.display_name}`}
                              disabled={
                                !expandMultis ||
                                (filter !== "" &&
                                  !(
                                    multi.data?.display_name_prefixed
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase()) ||
                                    multi.data?.display_name
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase())
                                  ))
                              }
                            >
                              {({ active }) => (
                                <MyLink
                                  href={constructMultiLink(multi)}
                                  passHref
                                >
                                  <div
                                    className={
                                      (active
                                        ? "bg-lightHighlight dark:bg-darkHighlight"
                                        : " ") +
                                      " px-4 py-2" +
                                      (filter !== "" &&
                                      !(
                                        multi.data?.display_name_prefixed
                                          ?.toUpperCase()
                                          .includes(filter.toUpperCase()) ||
                                        multi.data?.display_name
                                          ?.toUpperCase()
                                          .includes(filter.toUpperCase())
                                      )
                                        ? " hidden"
                                        : " ")
                                    }
                                  >
                                    <DropdownItem sub={multi} />
                                  </div>
                                </MyLink>
                              )}
                            </Menu.Item>
                          );
                        })
                    : ""}
                </div>
              </div>
            </>
          )}
          {myLocalSubs?.length > 0 ? (
            <>
              <div
                onClick={() => setExpandSubs((m) => !m)}
                className={
                  "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                  (expandSubs ? " " : " mb-2")
                }
              >
                <p>local subs</p>
                {!hideExtra && (
                  <BsChevronDown
                    className={
                      (expandSubs ? "-rotate-180 " : "rotate-0 ") +
                      "transform transition duration-200"
                    }
                  />
                )}
              </div>
              <div
                className={
                  " " +
                  (expandSubs ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                <div className="py-2">
                  {myLocalSubsFiltered
                    ? myLocalSubsFiltered
                        // .filter(
                        //   (sub) =>
                        //     filter === "" ||
                        //     sub.data?.display_name_prefixed
                        //       ?.toUpperCase()
                        //       .includes(filter.toUpperCase()) ||
                        //     sub.data?.display_name
                        //       ?.toUpperCase()
                        //       .includes(filter.toUpperCase())
                        // )
                        .map((sub, i) => {
                          return (
                            <Menu.Item
                              key={`${i}`}
                              disabled={
                                !expandSubs ||
                                (filter !== "" &&
                                  !(
                                    sub.data?.display_name_prefixed
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase()) ||
                                    sub.data?.display_name
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase())
                                  ))
                              }
                            >
                              {({ active }) => (
                                <MyLink href={sub?.data?.url} passHref>
                                  <div
                                    className={
                                      (active
                                        ? "bg-lightHighlight dark:bg-darkHighlight"
                                        : " ") +
                                      " px-4 py-2" +
                                      (filter !== "" &&
                                      !(
                                        sub.data?.display_name_prefixed
                                          ?.toUpperCase()
                                          .includes(filter.toUpperCase()) ||
                                        sub.data?.display_name
                                          ?.toUpperCase()
                                          .includes(filter.toUpperCase())
                                      )
                                        ? " hidden "
                                        : "")
                                    }
                                  >
                                    <DropdownItem sub={sub} />
                                  </div>
                                </MyLink>
                              )}
                            </Menu.Item>
                          );
                        })
                    : ""}
                </div>
              </div>
              {myLocalFollows?.length > 0 && (
                <>
                  <div
                    onClick={() => setExpandFollowing((m) => !m)}
                    className={
                      "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
                      (expandFollowing ? " " : " mb-2")
                    }
                  >
                    <p>local follows</p>
                    {!hideExtra && (
                      <BsChevronDown
                        className={
                          (expandFollowing ? "-rotate-180 " : "rotate-0 ") +
                          "transform transition duration-200"
                        }
                      />
                    )}
                  </div>
                  <div
                    className={
                      " " +
                      (expandFollowing
                        ? " max-h-full"
                        : " max-h-0 overflow-hidden")
                    }
                  >
                    <div className="py-2">
                      {myLocalFollows
                        ? myLocalFollows.map((sub, i) => {
                            return (
                              <Menu.Item
                                key={`${i}`}
                                disabled={
                                  !expandFollowing ||
                                  (filter !== "" &&
                                    !(
                                      sub.data?.display_name_prefixed
                                        ?.toUpperCase()
                                        .includes(filter.toUpperCase()) ||
                                      sub.data?.display_name
                                        ?.toUpperCase()
                                        .includes(filter.toUpperCase())
                                    ))
                                }
                              >
                                {({ active }) => (
                                  <MyLink
                                    href={sub?.data?.url?.replace(
                                      "/user/",
                                      "/u/"
                                    )}
                                    passHref
                                  >
                                    <div
                                      className={
                                        (active
                                          ? "bg-lightHighlight dark:bg-darkHighlight"
                                          : " ") +
                                        " px-4 py-2" +
                                        (filter !== "" &&
                                        !(
                                          sub.data?.display_name_prefixed
                                            ?.toUpperCase()
                                            .includes(filter.toUpperCase()) ||
                                          sub.data?.display_name
                                            ?.toUpperCase()
                                            .includes(filter.toUpperCase())
                                        )
                                          ? " hidden"
                                          : "")
                                      }
                                    >
                                      <DropdownItem sub={sub} isUser={true} />
                                    </div>
                                  </MyLink>
                                )}
                              </Menu.Item>
                            );
                          })
                        : ""}
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <button
              className={
                "p-2 m-2  border rounded-md  border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight" +
                (hideExtra ? " w-full " : "")
              }
              onClick={() => signIn("reddit")}
            >
              <span className="text-blue-300 dark:text-blue-600">Login</span> to
              see your subs
            </button>
          )}
        </>
      )}

      {session && (
        <>
          {/* Multis */}
          {/* onClick={() => {setloadedMultis(m => !m);setloadedSubs(s => !s)}} */}

          <div
            onClick={() => setExpandMultis((m) => !m)}
            className={
              "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight" +
              (expandMultis ? " " : " mb-2")
            }
          >
            <p>multis</p>
            {!hideExtra && (
              <BsChevronDown
                className={
                  (expandMultis ? "-rotate-180 " : "rotate-0 ") +
                  "transform transition duration-200"
                }
              />
            )}
          </div>
          <div
            className={
              " " + (expandMultis ? " max-h-full" : " max-h-0 overflow-hidden")
            }
          >
            {!loadedMultis ? (
              // Loading pane
              <>
                <div className="py-2">
                  <div className="px-4 py-1 ">
                    {/* Repeated rows */}
                    {[...Array(3)].map((u, i) => (
                      <div key={i} className="py-1">
                        <div className="flex flex-row items-center text-sm text-center animate-pulse ">
                          {/* Image */}
                          <div className="flex flex-row items-center w-6 h-6 ml-1 ">
                            <div className="w-6 h-6 text-center bg-red-400 rounded text-lightText ">
                              {"m"}
                            </div>
                          </div>
                          {/* Text */}
                          <div className="w-full h-6 ml-2 bg-gray-300 rounded dark:bg-gray-800 "></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="py-2">
                  {myMultis
                    ? myMultis
                        // .filter(
                        //   (multi) =>
                        //     filter === "" ||
                        //     multi.data.display_name
                        //       .toUpperCase()
                        //       .includes(filter.toUpperCase())
                        // )
                        .map((multi, i) => {
                          return (
                            <Menu.Item
                              key={`multi_${i}`}
                              disabled={
                                !expandMultis ||
                                (filter !== "" &&
                                  !multi.data.display_name
                                    .toUpperCase()
                                    .includes(filter.toUpperCase()))
                              }
                            >
                              {({ active }) => (
                                <MyLink
                                  href={constructMultiLink(multi)}
                                  passHref
                                >
                                  <div
                                    className={
                                      (active
                                        ? "bg-lightHighlight dark:bg-darkHighlight"
                                        : " ") +
                                      " px-4 py-2" +
                                      (filter !== "" &&
                                      !multi.data.display_name
                                        .toUpperCase()
                                        .includes(filter.toUpperCase())
                                        ? " hidden"
                                        : "")
                                    }
                                  >
                                    <DropdownItem sub={multi} />
                                  </div>
                                </MyLink>
                              )}
                            </Menu.Item>
                          );
                        })
                    : ""}
                </div>
              </>
            )}
          </div>

          {/* Subs */}
          <div
            onClick={() => setExpandSubs((e) => !e)}
            className={
              "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-lightHighlight dark:hover:bg-darkHighlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
              (expandSubs ? " " : " mb-2")
            }
          >
            <p>subs</p>
            {!hideExtra && (
              <BsChevronDown
                className={
                  (expandSubs ? "-rotate-180 " : "rotate-0 ") +
                  "transform transition duration-200"
                }
              />
            )}
          </div>
          <div
            className={
              " " + (expandSubs ? " max-h-full" : " max-h-0 overflow-hidden")
            }
          >
            {!loadedSubs ? (
              <>
                <div className="py-2">
                  <div className="px-4 py-1 ">
                    {/* Repeated rows */}
                    {[...Array(5)].map((u, i) => (
                      <div key={i} className="py-1">
                        <div className="flex flex-row items-center text-sm text-center animate-pulse ">
                          {/* Image */}
                          <div className="flex flex-row items-center w-6 h-6 ml-1 ">
                            <div className="w-6 h-6 text-center bg-blue-700 rounded-full text-lightText ">
                              {"r/"}
                            </div>
                          </div>
                          {/* Text */}
                          <div className="w-full h-6 ml-2 bg-gray-300 rounded dark:bg-gray-800 "></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={"py-2"}>
                {mySubs
                  ? mySubs
                      //   .filter(
                      //     (sub) =>
                      //       filter === "" ||
                      //       sub.data?.display_name_prefixed
                      //         ?.toUpperCase()
                      //         .includes(filter.toUpperCase()) ||
                      //       sub.data?.display_name
                      //         ?.toUpperCase()
                      //         .includes(filter.toUpperCase())
                      //   )
                      .map((sub, i) => {
                        return (
                          <Menu.Item
                            key={`sub_${i}`}
                            disabled={
                              !expandSubs ||
                              (filter !== "" &&
                                !(
                                  sub.data?.display_name_prefixed
                                    ?.toUpperCase()
                                    .includes(filter.toUpperCase()) ||
                                  sub.data?.display_name
                                    ?.toUpperCase()
                                    .includes(filter.toUpperCase())
                                ))
                            }
                          >
                            {({ active }) => (
                              <MyLink href={sub?.data?.url} passHref>
                                <div
                                  className={
                                    (active
                                      ? "bg-lightHighlight dark:bg-darkHighlight"
                                      : " ") +
                                    " px-4 py-2" +
                                    (filter !== "" &&
                                    !(
                                      sub.data?.display_name_prefixed
                                        ?.toUpperCase()
                                        .includes(filter.toUpperCase()) ||
                                      sub.data?.display_name
                                        ?.toUpperCase()
                                        .includes(filter.toUpperCase())
                                    )
                                      ? " hidden"
                                      : "")
                                  }
                                >
                                  <DropdownItem sub={sub} preventNav={true} />
                                </div>
                              </MyLink>
                            )}
                          </Menu.Item>
                        );
                      })
                  : ""}
              </div>
            )}
          </div>

          {/* Follows */}
          {myFollowing?.length > 0 && (
            <>
              <div
                onClick={() => setExpandFollowing((e) => !e)}
                className={
                  "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-lightHighlight dark:hover:bg-darkHighlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
                  (expandFollowing ? " " : " mb-2")
                }
              >
                <p>follows</p>
                {!hideExtra && (
                  <BsChevronDown
                    className={
                      (expandFollowing ? "-rotate-180 " : "rotate-0 ") +
                      "transform transition duration-200"
                    }
                  />
                )}
              </div>
              <div
                className={
                  " " +
                  (expandFollowing ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                <div className={"py-2"}>
                  {myFollowing
                    ? myFollowing
                        // .filter(
                        //   (sub) =>
                        //     filter === "" ||
                        //     sub.data?.display_name_prefixed
                        //       ?.toUpperCase()
                        //       .includes(filter.toUpperCase()) ||
                        //     sub.data?.display_name
                        //       ?.toUpperCase()
                        //       .includes(filter.toUpperCase())
                        // )
                        .map((sub, i) => {
                          return (
                            <Menu.Item
                              key={`follow_${i}`}
                              disabled={
                                !expandFollowing ||
                                (filter !== "" &&
                                  !(
                                    sub.data?.display_name_prefixed
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase()) ||
                                    sub.data?.display_name
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase())
                                  ))
                              }
                            >
                              {({ active }) => (
                                <MyLink
                                  href={sub?.data?.url?.replace(
                                    "/user/",
                                    "/u/"
                                  )}
                                  passHref
                                >
                                  <div
                                    className={
                                      (active
                                        ? "bg-lightHighlight dark:bg-darkHighlight"
                                        : " ") +
                                      " px-4 py-2" +
                                      (filter !== "" &&
                                      !(
                                        sub.data?.display_name_prefixed
                                          ?.toUpperCase()
                                          .includes(filter.toUpperCase()) ||
                                        sub.data?.display_name
                                          ?.toUpperCase()
                                          .includes(filter.toUpperCase())
                                      )
                                        ? " hidden "
                                        : "")
                                    }
                                  >
                                    <DropdownItem sub={sub} isUserLink={true} />
                                  </div>
                                </MyLink>
                              )}
                            </Menu.Item>
                          );
                        })
                    : ""}
                </div>
              </div>
            </>
          )}
        </>
      )}

      {session && error && (
        <>
          <div className="flex flex-row items-center justify-center p-4">
            {"Can't connect to Reddit. Try refreshing."}
          </div>
        </>
      )}
    </>
  );
};

export default DropDownItems;
