import { Menu, Transition } from "@headlessui/react";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BiRightTopArrowCircle } from "react-icons/bi";
import { BsChevronDown, BsList } from "react-icons/bs";
import { IoMdRefresh } from "react-icons/io";
import { CgLivePhoto, CgPlayListSearch } from "react-icons/cg";
import { useSubsContext } from "../MySubs";
import DropdownItem from "./DropdownItem";
import DropdownSubCard from "./DropdownSubCard";
import { useTAuth } from "../PremiumAuthContext";
import { useMainContext } from "../MainContext";

const MyLink = (props) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
};

const DropDownItems = ({ show, hideExtra = false }) => {
  const { premium } = useTAuth();
  const context: any = useMainContext();
  const subsContext: any = useSubsContext();
  const {
    loadingSubs,
    loadAllFromReddit,
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
  const { data: session, status } = useSession();
  const [filter, setFilter] = useState("");
  const filterRef = useRef<HTMLInputElement>(null);
  const [expand, setExpand] = useState(false);
  const [expandFavorites, setExpandFavorites] = useState(true);
  const [expandMultis, setExpandMultis] = useState(true);
  const [expandSubs, setExpandSubs] = useState(true);
  const [expandFollowing, setExpandFollowing] = useState(true);
  const [myLocalSubsFiltered, setMyLocalSubsFiltered] = useState<any[]>([]);
  const [myLocalFollows, setMyLocalFollows] = useState<any[]>([]);

  useEffect(() => {
    tryLoadAll();
  }, [show]);

  useEffect(() => {
    show && filterRef?.current?.focus();
  }, [show, filterRef?.current]);

  useEffect(() => {
    let subs = [] as any[];
    let follows = [] as any[];
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
    let subs = [] as any[];
    multi?.data?.subreddits?.forEach((s: any) => subs.push(s?.name));
    return `/r/${subs.join("+")}?m=${multi?.data?.name}`;
  };

  const favoriteSubs = useMemo(() => {
    if (session?.user?.name) {
      return [
        ...mySubs?.filter((sub) => sub?.data?.user_has_favorited),
        ...myFollowing?.filter(
          (user) => user?.data?.subreddit?.user_has_favorited
        ),
      ];
    } else {
      return [...myLocalSubs?.filter((sub) => sub?.data?.user_has_favorited)];
    }
  }, [mySubs, myFollowing, myLocalSubs]);

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
            <div className="py-2 pl-3 pr-4 hover:bg-th-highlight">
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
            <MyLink href="/">
              <div
                className={
                  (active ? "bg-th-highlight " : " ") +
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
            <MyLink href="/r/popular">
              <div
                className={
                  (active ? "bg-th-highlight " : " ") +
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
            <MyLink href="/r/all">
              <div
                className={
                  (active ? "bg-th-highlight " : " ") +
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
            <MyLink href="/subreddits">
              <div
                className={
                  (active ? "bg-th-highlight " : " ") +
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
            className="w-full mx-2 px-2 border py-1.5 outline-none text-sm rounded  border-th-border  bg-transparent focus:border-th-borderHighlight"
          />
        </div>
      )}

      {favoriteSubs?.length > 0 && (
        <>
          <div
            onClick={() => setExpandFavorites((e) => !e)}
            className={
              "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-th-highlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
              (expandFavorites ? " " : " mb-2")
            }
          >
            <p>favorites</p>
            {!hideExtra && (
              <BsChevronDown
                className={
                  (expandFavorites ? "-rotate-180 " : "rotate-0 ") +
                  "transform transition duration-200"
                }
              />
            )}
          </div>
          <div
            className={
              " " +
              (expandFavorites ? " max-h-full" : " max-h-0 overflow-hidden")
            }
          >
            <div className={"py-2"}>
              {favoriteSubs
                ? favoriteSubs.map((sub, i) => {
                    return (
                      <Menu.Item
                        key={`sub_${i}`}
                        disabled={
                          !expandFavorites ||
                          (filter !== "" &&
                            !(
                              sub.data?.display_name_prefixed
                                ?.toUpperCase()
                                .includes(filter.toUpperCase()) ||
                              sub.data?.display_name
                                ?.toUpperCase()
                                .includes(filter.toUpperCase()) ||
                              sub.data?.subreddit?.display_name
                                ?.toUpperCase()
                                .includes(filter.toUpperCase())
                            ))
                        }
                      >
                        {({ active }) => (
                          <MyLink
                            href={
                              sub?.data?.subreddit?.url?.replace(
                                "/user/",
                                "/u/"
                              ) ?? sub?.data?.url
                            }
                          >
                            <div
                              className={
                                (active ? "bg-th-highlight" : " ") +
                                " px-4 py-2 group " +
                                (filter !== "" &&
                                !(
                                  sub.data?.display_name_prefixed
                                    ?.toUpperCase()
                                    .includes(filter.toUpperCase()) ||
                                  sub.data?.display_name
                                    ?.toUpperCase()
                                    .includes(filter.toUpperCase()) ||
                                  sub.data?.subreddit?.display_name
                                    ?.toUpperCase()
                                    .includes(filter.toUpperCase())
                                )
                                  ? " hidden"
                                  : "")
                              }
                            >
                              <DropdownItem
                                sub={{
                                  kind: sub?.kind,
                                  data: sub?.data?.subreddit ?? sub?.data,
                                }}
                                isUser={
                                  sub?.kind === "t2" ||
                                  sub?.data?.display_name?.substring(0, 2) ===
                                    "u_"
                                }
                              />
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

      {!session && (
        <>
          {myLocalMultis?.length > 0 && (
            <>
              <div
                onClick={() => setExpandMultis((m) => !m)}
                className={
                  "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-th-highlight" +
                  (expandMultis ? " " : " mb-2")
                }
              >
                <p>feeds</p>
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
                  " " +
                  (expandMultis ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                <div className="py-2">
                  {myLocalMultis
                    ? myLocalMultis.map((multi, i) => {
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
                              <MyLink href={constructMultiLink(multi)}>
                                <div
                                  className={
                                    (active ? "bg-th-highlight" : " ") +
                                    " px-4 py-2 " +
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
                  "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-th-highlight" +
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
                  " " +
                  (expandSubs ? " max-h-full" : " max-h-0 overflow-hidden")
                }
              >
                <div className="py-2">
                  {myLocalSubsFiltered
                    ? myLocalSubsFiltered.map((sub: any, i) => {
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
                              <MyLink href={sub?.data?.url}>
                                <div
                                  className={
                                    (active ? "bg-th-highlight" : " ") +
                                    " px-4 py-2 group " +
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
                      "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-th-highlight" +
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
                      (expandFollowing
                        ? " max-h-full"
                        : " max-h-0 overflow-hidden")
                    }
                  >
                    <div className="py-2">
                      {myLocalFollows
                        ? myLocalFollows.map((sub: any, i) => {
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
                                  >
                                    <div
                                      className={
                                        (active ? "bg-th-highlight" : " ") +
                                        " px-4 py-2 group " +
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
              aria-label="sign in"
              className={
                "p-2 m-2  border rounded-md  border-th-border hover:border-th-borderHighlight " +
                (hideExtra ? " w-full " : "")
              }
              onClick={() => {
                premium?.isPremium
                  ? signIn("reddit")
                  : context.setPremiumModal(true);
              }}
            >
              <span className="text-th-accent ">Login</span> with Reddit
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
              "px-2 py-0.5 flex justify-between items-center text-xs tracking-widest hover:font-semibold hover:cursor-pointer hover:bg-th-highlight" +
              (expandMultis ? " " : " mb-2")
            }
          >
            <p>feeds</p>
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
                            <div className="w-6 h-6 text-center text-white bg-red-400 rounded ">
                              {"m"}
                            </div>
                          </div>
                          {/* Text */}
                          <div className="w-full h-6 ml-2 rounded bg-th-highlight "></div>
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
                    ? myMultis.map((multi, i) => {
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
                              <MyLink href={constructMultiLink(multi)}>
                                <div
                                  className={
                                    (active ? "bg-th-highlight" : " ") +
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
              "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-th-highlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
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
                            <div className="w-6 h-6 text-center text-white bg-blue-700 rounded-full ">
                              {"r/"}
                            </div>
                          </div>
                          {/* Text */}
                          <div className="w-full h-6 ml-2 rounded bg-th-highlight "></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={"py-2"}>
                {mySubs
                  ? mySubs.map((sub, i) => {
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
                            <MyLink href={sub?.data?.url}>
                              <div
                                className={
                                  (active ? "bg-th-highlight" : " ") +
                                  " px-4 py-2 group " +
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
                                <DropdownItem sub={sub} />
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
                  "px-2 py-0.5 items-center text-xs tracking-widest hover:bg-th-highlight  hover:cursor-pointer hover:font-semibold flex flex-row justify-between" +
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
                    ? myFollowing.map((user, i) => {
                        return (
                          <Menu.Item
                            key={`follow_${i}`}
                            disabled={
                              !expandFollowing ||
                              (filter !== "" &&
                                !user.data?.name
                                  ?.toUpperCase()
                                  .includes(filter.toUpperCase()))
                            }
                          >
                            {({ active }) => (
                              <MyLink href={`/u/${user?.data?.name}`}>
                                <div
                                  className={
                                    (active ? "bg-th-highlight" : " ") +
                                    " px-4 py-2 group " +
                                    (filter !== "" &&
                                    !user.data?.name
                                      ?.toUpperCase()
                                      .includes(filter.toUpperCase())
                                      ? " hidden "
                                      : "")
                                  }
                                >
                                  <DropdownItem
                                    sub={{
                                      kind: user?.kind,
                                      data: user?.data?.subreddit,
                                    }}
                                    isUser={true}
                                  />
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
      {session && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            loadAllFromReddit();
          }}
          disabled={loadingSubs}
          className="flex pl-2 w-full text-xs py-0.5 mb-1 text-th-textLight hover:text-th-text"
        >
          <span>refresh</span>
          <IoMdRefresh
            className={"w-4 h-4 " + (loadingSubs ? "animate-spin" : "")}
          />
        </button>
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
