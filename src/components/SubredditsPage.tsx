import React, { Fragment, useEffect, useState } from "react";
import { useSubsContext } from "../MySubs";
import { getSubreddits, loadSubredditInfo } from "../RedditAPI";
import SubCard from "./cards/SubCard";
import SubCardPlaceHolder from "./cards/SubCardPlaceHolder";

import { Tab } from "@headlessui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useMainContext, localSubInfoCache } from "../MainContext";
import Collection from "./collections/Collection";
import MyMultiCollections from "./collections/MyMultiCollections";
import SelectedSubs from "./collections/SelectedSubs";
import { MyCollectionsProvider } from "./collections/CollectionContext";

const SubredditsPage = ({ query = undefined }) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();
  const context: any = useMainContext();
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
    addToSubCache,
  } = subsContext;

  const [categories] = useState(["mine", "follows", "feeds", "popular"]); //"New"

  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    router.push(
      `/subreddits/${
        categories?.[selectedIndex] ? categories[selectedIndex] : ""
      }`,
      `/subreddits/${
        categories?.[selectedIndex] ? categories[selectedIndex] : ""
      }`,
      {
        shallow: true,
      }
    );
    window.scrollTo(0, 0);
  }, [selectedIndex]);

  useEffect(() => {
    let index = categories.indexOf(query?.slug?.[0]);
    if (index > -1) {
      setSelectedIndex(index);
    }
  }, [query]);

  const [myLocalSubsFiltered, setMyLocalSubsFiltered] = useState([]);
  const [myLocalFollows, setMyLocalFollows] = useState([]);
  useEffect(() => {
    let subs = [];
    let follows = [];
    if (myLocalSubs?.length > 0) {
      myLocalSubs.forEach((s) => {
        if (s.data.url.substring(0, 3) === "/u/") {
          follows.push(s);
        } else {
          subs.push(s);
        }
      });
    }
    setMyLocalSubsFiltered(subs);
    setMyLocalFollows(follows);
  }, [myLocalSubs]);

  //fetching info for local subs
  const [loadingLocalSubs, setLoadingLocalSubs] = useState(true);
  const [loadingLocalFollows, setLoadingLocalFollows] = useState(true);

  const [localSubsInfo, setLocalSubsInfo] = useState({});
  const [localFollowsInfo, setLocalFollowsInfo] = useState({});
  useEffect(() => {
    const fetchSubInfo = async (sub) => {
      //prevent api calls if we don't need them
      if (
        !(sub?.data?.name in localSubsInfo) &&
        !(sub?.data?.name in localFollowsInfo)
      ) {
        let name = sub?.data?.name;
        let isUser = false;
        if (
          sub?.data?.name?.substring(0, 2) === "u_" &&
          sub?.data.url.substring(0, 3) === "/u/"
        ) {
          name = sub?.data?.name?.substring(2);
          isUser = true;
        }
        let s = await loadSubredditInfo(name, isUser);

        //handle if sub is banned..
        if (!s) {
          s = {
            kind: "t5",
            data: {
              name: name,
              url: `/r/${name}`,
              display_name: name,
              display_name_prefixed: `r/${name}`,
              public_description:
                "**Unable to pull information, this sub may be banned or quarantined**",
            },
          };
        } else {
          addToSubCache(s);
        }

        isUser
          ? setLocalFollowsInfo((p) => ({ ...p, ...{ [sub?.data?.name]: s } }))
          : setLocalSubsInfo((p) => ({ ...p, ...{ [sub?.data?.name]: s } }));
      }
    };
    if (!session && !loading && selectedIndex === 0) {
      if (myLocalSubsFiltered.length > 0) {
        myLocalSubs.forEach((sub) => {
          fetchSubInfo(sub);
        });
      } else {
        setLoadingLocalSubs(false);
      }
    }
    if (!session && !loading && selectedIndex === 1) {
      if (myLocalFollows.length > 0) {
        myLocalFollows.forEach((sub) => {
          fetchSubInfo(sub);
        });
      } else {
        setLoadingLocalFollows(false);
      }
    }
  }, [myLocalSubsFiltered, myLocalFollows, session, loading, selectedIndex]);

  useEffect(() => {
    Object.keys(localSubsInfo)?.length > 0 && setLoadingLocalSubs(false);
    Object.keys(localFollowsInfo)?.length > 0 && setLoadingLocalFollows(false);
  }, [localSubsInfo, localFollowsInfo]);

  //to persist subs in list after unsubbing
  const [copyMySubs, setCopyMySubs] = useState([]);
  const [copyMyFollowsing, setCopyMyFollowing] = useState([]);
  useEffect(() => {
    //update local copy if adding subs but not if removing
    mySubs.length >= copyMySubs.length && setCopyMySubs(mySubs);
  }, [mySubs, copyMySubs]);
  useEffect(() => {
    //update local copy if adding subs but not if removing
    myFollowing.length >= copyMyFollowsing.length &&
      setCopyMyFollowing(myFollowing);
  }, [myFollowing, copyMyFollowsing]);

  const [subreddits, setSubreddits] = useState([]);
  const [after, setAfter] = useState("");
  const [end, setEnd] = useState(false);
  const [subredditsNew, setSubredditsNew] = useState([]);
  const [afterNew, setAfterNew] = useState("");
  const [endNew, setEndNew] = useState(false);
  const fetchSubreddits = async (after = "", type = "popular") => {
    setWaiting(true);
    let data = await getSubreddits(after, type);
    if (type === "popular") {
      data?.children && setSubreddits((p) => [...p, ...data?.children]);
      data?.after ? setAfter(data?.after) : setEnd(true);
    } else if (type === "new") {
      data?.children && setSubredditsNew((p) => [...p, ...data?.children]);
      data?.after ? setAfterNew(data?.after) : setEndNew(true);
    }
    setWaiting(false);
    return data;
  };
  useEffect(() => {
    fetchSubreddits();
    //fetchSubreddits("", "new");

    return () => {
      setEnd(false);
      setAfter("");
      setSubreddits([]);
      setEndNew(false);
      setAfterNew("");
      setSubredditsNew([]);
      setLoadingLocalSubs(true);
      setLoadingLocalFollows(true);
    };
  }, []);

  return (
    <>
      <div className="flex flex-col justify-center gap-3 mx-4 md:gap-0 md:mx-auto md:flex-row ">
        <Tab.Group onChange={setSelectedIndex} selectedIndex={selectedIndex}>
          <Tab.List className={""}>
            <div
              className={
                " sticky top-[4rem] flex flex-row md:flex-col gap-2 w-full md:w-52 px-0 pb-0 md:py-2 mr-4 overflow-hidden  bg-lightPost transition-colors border   border-gray-300 shadow-md dark:bg-darkBG dark:border-trueGray-700 " +
                ( " rounded-lg ")
              }
            >
              {categories.map((c) => (
                <Tab key={c} as={Fragment}>
                  {({ selected }) => (
                    <div
                      className={
                        (selected
                          ? " font-bold opacity-100 dark:bg-darkPostHover bg-lightPostHover "
                          : "") +
                        " outline-none ring-0 cursor-pointer opacity-50 hover:opacity-80 select-none flex flex-col-reverse md:flex-row flex-grow items-center"
                      }
                    >
                      <div className="w-full h-1 mt-1 md:w-1 md:h-8 md:mr-2 md:mt-0 dark:bg-darkScroll bg-lightScroll"></div>

                      <h1>
                        {c === "mine"
                          ? "My Subreddits"
                          : c === "popular"
                          ? "Popular Subreddits"
                          : c === "follows"
                          ? "My Following"
                          : c === "feeds"
                          ? "My Feeds"
                          : ""}
                      </h1>
                    </div>
                  )}
                </Tab>
              ))}
            </div>
          </Tab.List>
          <Tab.Panels>
            {categories.map((c, i) => (
              <Tab.Panel
                key={c}
                className={
                  " mb-10  flex flex-col gap-3  md:w-[32rem] lg:w-[48rem] xl:w-[54rem] 2xl:w-[60rem] "
                }
              >
                {c === "popular" ? (
                  <>
                    {subreddits.length > 0 && (
                      <>
                        {subreddits.map((s, i) => (
                          <div key={i}>
                            <SubCard data={s} />
                          </div>
                        ))}
                        {after && !end ? (
                          <button
                            className="flex items-center justify-center w-24 ml-auto mr-2 text-center border-2 rounded-md cursor-pointer h-9 dark:border border-lightBorder dark:bg-transparent bg-lightPost dark:border-lightBorder hover:bg-lightHighlight dark:hover:bg-darkBG"
                            onClick={(e) => {
                              e.preventDefault();
                              !waiting && fetchSubreddits(after, "popular");
                            }}
                          >
                            {waiting ? "Loading.." : "Load More"}
                          </button>
                        ) : (
                          <h1 className="ml-auto font-bold opacity-50">
                            Loaded All
                          </h1>
                        )}
                      </>
                    )}
                  </>
                ) : c === "new" ? (
                  <>
                    {subredditsNew.length > 0 && (
                      <>
                        {subredditsNew.map((s, i) => (
                          <div key={i}>
                            <SubCard data={s} />
                          </div>
                        ))}
                        {afterNew && !endNew ? (
                          <button
                            className="flex items-center justify-center w-24 ml-auto mr-2 text-center border-2 rounded-md cursor-pointer h-9 dark:border border-lightBorder dark:bg-transparent bg-lightPost dark:border-lightBorder hover:bg-lightHighlight dark:hover:bg-darkBG"
                            onClick={(e) => {
                              e.preventDefault();
                              !waiting && fetchSubreddits(afterNew, "new");
                            }}
                          >
                            {waiting ? "Loading.." : "Load More"}
                          </button>
                        ) : (
                          <h1 className="ml-auto font-bold opacity-50">
                            Loaded All
                          </h1>
                        )}
                      </>
                    )}
                  </>
                ) : c === "mine" ? (
                  <>
                    {copyMySubs.length > 0 ? (
                      <>
                        {copyMySubs.map((s, i) => (
                          <div key={s?.data?.name}>
                            <SubCard data={s} />
                          </div>
                        ))}
                      </>
                    ) : session && !loadedSubs ? (
                      <>
                        {[...Array(10)].map((u, i) => (
                          <div key={i}>
                            <SubCardPlaceHolder user={false} />
                          </div>
                        ))}
                      </>
                    ) : (
                      session &&
                      loadedSubs && (
                        <div className="flex flex-col items-center mt-5 md:mt-3 ">
                          <h1>{"Join subreddits to manage them here"}</h1>
                          <h1>{"Try searching or browsing the popular tab"}</h1>
                        </div>
                      )
                    )}
                    {Object.values(localSubsInfo).length > 0 &&
                    !session &&
                    !loading ? (
                      <>
                        {Object.values(localSubsInfo).map((s: any, i) => (
                          <div key={s?.data?.name ?? i}>
                            {s?.data && <SubCard data={s} />}
                          </div>
                        ))}
                      </>
                    ) : !session && !loading && loadingLocalSubs ? (
                      <>
                        {[...Array(myLocalSubsFiltered?.length ?? 10)].map(
                          (u, i) => (
                            <div key={i}>
                              <SubCardPlaceHolder user={false} />
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      !session &&
                      !loading &&
                      !loadingLocalSubs && (
                        <div className="flex flex-col items-center mt-5 md:mt-3 ">
                          <h1>{"Join subreddits to manage them here"}</h1>
                          <h1>{"Try searching or browsing the popular tab"}</h1>
                        </div>
                      )
                    )}
                  </>
                ) : c === "follows" ? (
                  <>
                    {copyMyFollowsing.length > 0 ? (
                      <>
                        {copyMyFollowsing.map((s, i) => (
                          <div key={i}>
                            <SubCard data={s} />
                          </div>
                        ))}
                      </>
                    ) : session && !loadedSubs ? (
                      <>
                        {[...Array(10)].map((u, i) => (
                          <div key={i}>
                            <SubCardPlaceHolder user={false} />
                          </div>
                        ))}
                      </>
                    ) : (
                      session &&
                      loadedSubs && (
                        <div className="flex flex-col items-center mt-5 md:mt-3 ">
                          <h1>{"Follow users to manage them here"}</h1>
                          <h1>
                            {"Try searching or clicking on user profiles"}
                          </h1>
                        </div>
                      )
                    )}
                    {Object.values(localFollowsInfo).length > 0 &&
                    !session &&
                    !loading ? (
                      <>
                        {Object.values(localFollowsInfo).map((s: any, i) => (
                          <div key={i}>
                            <SubCard data={s} />
                          </div>
                        ))}
                      </>
                    ) : !session && !loading && loadingLocalFollows ? (
                      <>
                        {[...Array(myLocalFollows?.length ?? 10)].map(
                          (u, i) => (
                            <div key={i}>
                              <SubCardPlaceHolder user={false} />
                            </div>
                          )
                        )}
                      </>
                    ) : (
                      !session &&
                      !loading &&
                      !loadingLocalFollows && (
                        <div className="flex flex-col items-center mt-5 md:mt-3 ">
                          <h1>{"Follow users to manage them here"}</h1>
                          <h1>
                            {"Try searching or clicking on user profiles"}
                          </h1>
                        </div>
                      )
                    )}
                  </>
                ) : c === "feeds" ? (
                  <>
                    <MyMultiCollections />
                  </>
                ) : (
                  <>
                    {[...Array(3)].map((u, i) => (
                      <div key={i}>
                        <SubCardPlaceHolder user={false} />
                      </div>
                    ))}
                  </>
                )}
              </Tab.Panel>
            ))}
          </Tab.Panels>
        </Tab.Group>
      </div>
      {categories[selectedIndex] === "feeds" && (
        <div className="fixed w-full bottom-[2%] z-50">
          <div className="mx-2 md:mx-auto md:w-[48rem] lg:w-[64rem] xl:w-[70rem] 2xl:w-[76rem] shadow-2xl">
            <SelectedSubs />
          </div>
        </div>
      )}
    </>
  );
};

export default SubredditsPage;
