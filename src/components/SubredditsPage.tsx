import React, { Fragment, useEffect, useState } from "react";
import { useSubsContext } from "../MySubs";
import { getSubreddits, loadSubredditInfo } from "../RedditAPI";
import SubCard from "./views/SubCard";
import SubCardPlaceHolder from "./views/SubCardPlaceHolder";

import { Tab } from "@headlessui/react";
import { useSession } from "next-auth/client";
import { useMainContext } from "../MainContext";

const SubredditsPage = () => {
  const [session, loading] = useSession();
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
  } = subsContext;

  const [categories] = useState(["Mine", "Popular"]); //"New"
  const [selectedIndex, setSelectedIndex] = useState(0);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedIndex]);

  //fetching info for local subs
  const [loadingLocalSubs, setLoadingLocalSubs] = useState(true);
  const [localSubsInfo, setLocalSubsInfo] = useState({});
  useEffect(() => {
    const fetchSubInfo = async (sub) => {
      //prevent api calls if we don't need them
      if (!(sub?.data?.name in localSubsInfo)) {
        let s = await loadSubredditInfo(sub?.data?.name, false);
        setLocalSubsInfo((p) => ({ ...p, ...{ [sub?.data?.name]: s } }));
        //console.log(sub, s);
      }
    };
    if (!session && !loading && selectedIndex === 0) {
      if (myLocalSubs.length > 0) {
        myLocalSubs.forEach((sub) => {
          fetchSubInfo(sub);
        });
      } else {
        setLoadingLocalSubs(false);
      }
    }
  }, [myLocalSubs, session, loading, selectedIndex]);

  useEffect(() => {
    //Object.values(localSubsInfo).map((s) => console.log(s));
    Object.keys(localSubsInfo)?.length > 0 && setLoadingLocalSubs(false);
  }, [localSubsInfo]);

  //to persist subs in list after unsubbing
  const [copyMySubs, setCopyMySubs] = useState([]);
  useEffect(() => {
    copyMySubs.length === 0 && setCopyMySubs(mySubs);
  }, [mySubs, copyMySubs]);

  const [subreddits, setSubreddits] = useState([]);
  const [after, setAfter] = useState("");
  const [end, setEnd] = useState(false);
  const [subredditsNew, setSubredditsNew] = useState([]);
  const [afterNew, setAfterNew] = useState("");
  const [endNew, setEndNew] = useState(false);
  const fetchSubreddits = async (after = "", type = "popular") => {
    let data = await getSubreddits(after, type);
    if (type === "popular") {
      data?.children && setSubreddits((p) => [...p, ...data?.children]);
      data?.after ? setAfter(data?.after) : setEnd(true);
    } else if (type === "new") {
      data?.children && setSubredditsNew((p) => [...p, ...data?.children]);
      data?.after ? setAfterNew(data?.after) : setEndNew(true);
    }
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
    };
  }, []);

  return (
    <div className="flex flex-col justify-center gap-3 mx-4 md:gap-0 md:mx-auto md:flex-row ">
      <Tab.Group onChange={setSelectedIndex} selectedIndex={selectedIndex}>
        <Tab.List className={""}>
          <div
            className={
              " sticky top-[4rem] flex flex-row md:flex-col gap-2 w-full md:w-52   p-2 mr-4  bg-lightPost transition-colors border   border-gray-300 shadow-md dark:bg-darkBG dark:border-trueGray-700 " +
              (context?.cardStyle === "card2" || context?.mediaOnly
                ? ""
                : " rounded-md ")
            }
          >
            {categories.map((c) => (
              <Tab key={c} as={Fragment}>
                {({ selected }) => (
                  <div
                    className={
                      (selected ? " font-bold opacity-100 " : "") +
                      " outline-none ring-0 cursor-pointer opacity-50 hover:opacity-80"
                    }
                  >
                    {c === "Mine"
                      ? "My Subreddits"
                      : c === "Popular"
                      ? "Popular Subreddits"
                      : ""}
                  </div>
                )}
              </Tab>
            ))}
          </div>
        </Tab.List>
        <Tab.Panels>
          {categories.map((c) => (
            <Tab.Panel
              key={c}
              className={
                " mb-10  flex flex-col gap-3  md:w-[32rem] lg:w-[48rem] xl:w-[54rem] 2xl:w-[60rem] "
              }
            >
              {c === "Popular" ? (
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
                            fetchSubreddits(after, "popular");
                          }}
                        >
                          Load More
                        </button>
                      ) : (
                        <h1 className="ml-auto font-bold opacity-50">
                          Loaded All
                        </h1>
                      )}
                    </>
                  )}
                </>
              ) : c === "New" ? (
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
                            fetchSubreddits(afterNew, "new");
                          }}
                        >
                          Load More
                        </button>
                      ) : (
                        <h1 className="ml-auto font-bold opacity-50">
                          Loaded All
                        </h1>
                      )}
                    </>
                  )}
                </>
              ) : c === "Mine" ? (
                <>
                  {copyMySubs.length > 0 ? (
                    <>
                      {copyMySubs.map((s, i) => (
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
                      <div className="flex flex-col items-center mt-5 md:items-start md:mt-0 ">
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
                        <div key={i}>
                          <SubCard data={s} />
                        </div>
                      ))}
                    </>
                  ) : !session && !loading && loadingLocalSubs ? (
                    <>
                      {[...Array(myLocalSubs?.length ?? 10)].map((u, i) => (
                        <div key={i}>
                          <SubCardPlaceHolder user={false} />
                        </div>
                      ))}
                    </>
                  ) : (
                    !session &&
                    !loading &&
                    !loadingLocalSubs && (
                      <div className="flex flex-col items-center mt-5 md:items-start md:mt-0 ">
                        <h1>{"Join subreddits to manage them here"}</h1>
                        <h1>{"Try searching or browsing the popular tab"}</h1>
                      </div>
                    )
                  )}
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
  );
};

export default SubredditsPage;
