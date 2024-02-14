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
import { IoMdRefresh } from "react-icons/io";
import { useTAuth } from "../PremiumAuthContext";

const SubredditsPage = ({ query = undefined as any }) => {
  const { isLoaded, premium } = useTAuth();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [waiting, setWaiting] = useState(false);
  const router = useRouter();
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

  const [myLocalSubsFiltered, setMyLocalSubsFiltered] = useState<any[]>([]);
  const [myLocalFollows, setMyLocalFollows] = useState<any[]>([]);
  useEffect(() => {
    let subs = new Array<any>();
    let follows = new Array<any>();
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
        let s = await loadSubredditInfo({
          query: name,
          loadUser: isUser,
          isPremium: premium?.isPremium,
        });

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
    if (isLoaded) {
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
    }
  }, [
    myLocalSubsFiltered,
    myLocalFollows,
    session,
    loading,
    selectedIndex,
    isLoaded,
    premium?.isPremium,
  ]);

  useEffect(() => {
    Object.keys(localSubsInfo)?.length > 0 && setLoadingLocalSubs(false);
    Object.keys(localFollowsInfo)?.length > 0 && setLoadingLocalFollows(false);
  }, [localSubsInfo, localFollowsInfo]);

  //to persist subs in list after unsubbing
  const [copyMySubs, setCopyMySubs] = useState<any[]>([]);
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

  const [subreddits, setSubreddits] = useState<any[]>([]);
  const [after, setAfter] = useState("");
  const [end, setEnd] = useState(false);
  const [subredditsNew, setSubredditsNew] = useState<any[]>([]);
  const [afterNew, setAfterNew] = useState("");
  const [endNew, setEndNew] = useState(false);
  const fetchSubreddits = async (after = "", type = "popular") => {
    setWaiting(true);
    try {
      let data = await getSubreddits({
        after: after,
        type: type,
        isPremium: premium?.isPremium,
      });
      if (type === "popular") {
        data?.children && setSubreddits((p) => [...p, ...data?.children]);
        data?.after ? setAfter(data?.after) : setEnd(true);
      } else if (type === "new") {
        data?.children && setSubredditsNew((p) => [...p, ...data?.children]);
        data?.after ? setAfterNew(data?.after) : setEndNew(true);
      }
      setWaiting(false);
      return data;
    } catch (err) {
      if (err?.message === "PREMIUM REQUIRED") {
        context.setPremiumModal(true);
      } else {
        throw err;
      }
    }
  };
  useEffect(() => {
    isLoaded && fetchSubreddits();
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
  }, [isLoaded]);

  return (
    <>
      <div className="flex flex-col justify-center gap-3 mx-4 md:gap-0 md:mx-auto md:flex-row">
        <Tab.Group onChange={setSelectedIndex} selectedIndex={selectedIndex}>
          <Tab.List className={""}>
            <div
              className={
                " sticky mt-3 md:mt-0 md:top-[3.5rem] md:fixed z-10 flex flex-row md:flex-col gap-2 w-full md:w-52 px-0 pb-0 md:py-2 mr-4 overflow-hidden bg-th-post transition-colors border border-th-border2  shadow-md  rounded-lg"
              }
            >
              {categories.map((c) => (
                <Tab key={c} as={Fragment}>
                  {({ selected }) => (
                    <div
                      className={
                        (selected
                          ? " font-bold opacity-100 bg-th-highlight  "
                          : "") +
                        " outline-none ring-0 cursor-pointer opacity-50 hover:opacity-80 select-none flex flex-col-reverse md:flex-row flex-grow items-center"
                      }
                    >
                      <div className="w-full h-1 mt-1 md:w-1 md:h-8 md:mr-2 md:mt-0 bg-th-scrollbar "></div>

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
            <div
              className={
                " hidden sticky top-[3.5rem]  -z-10 md:flex flex-row md:flex-col gap-2 w-full md:w-52 px-0 pb-0 md:py-2 mr-4 overflow-hidden bg-transparent border border-transparent  rounded-lg"
              }
            ></div>
          </Tab.List>
          <Tab.Panels>
            {categories.map((c, i) => (
              <Tab.Panel
                key={c}
                className={
                  " mb-10 mt-2   flex flex-col gap-3  md:w-[32rem] lg:w-[48rem] xl:w-[54rem] 2xl:w-[60rem] "
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
                            aria-label="load more"
                            className="flex items-center justify-center w-24 ml-auto mr-2 text-center border rounded-md shadow-xl cursor-pointer h-9 ring-1 ring-th-base border-th-border bg-th-background2 hover:bg-th-highlight hover:border-th-borderHighlight "
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
                            aria-label="load more"
                            className="flex items-center justify-center w-24 ml-auto mr-2 text-center border rounded-md shadow-xl cursor-pointer h-9 bg-th-background2 border-th-border hover:border-th-borderHighlight hover:bg-th-highlight ring-1 ring-th-base"
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
      {session &&
        (categories[selectedIndex] === "mine" ||
          categories[selectedIndex] === "follows" ||
          categories[selectedIndex] === "feeds") && (
          <div className="fixed bottom-0 left-0 md:bottom-2 md:left-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                loadAllFromReddit();
              }}
              disabled={loadingSubs}
              className={
                "flex justify-center w-full text-xs p-1 text-th-textLight " +
                (loadingSubs ? "" : "hover:text-th-text")
              }
            >
              <span className="hidden md:block">refresh</span>
              <IoMdRefresh
                className={
                  "w-6 h-6 md:w-4 md:h-4 " + (loadingSubs ? "animate-spin" : "")
                }
              />
            </button>
          </div>
        )}
    </>
  );
};

export default SubredditsPage;
