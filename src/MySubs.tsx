import React, { useState, useEffect, useContext } from "react";
import { getSession, useSession } from "next-auth/client";
import { useMainContext } from "./MainContext";
import {
  addToMulti,
  createMulti,
  deleteFromMulti,
  deleteMulti,
  getAllMyFollows,
  getMyMultis,
  getMySubs,
  loadSubInfo,
  loadSubredditInfo,
  subToSub,
} from "./RedditAPI";
import { useRouter } from "next/dist/client/router";

export const SubsContext: any = React.createContext({});
export const useSubsContext = () => {
  return useContext(SubsContext);
};

export const MySubsProvider = ({ children }) => {
  const router = useRouter();

  const context: any = useMainContext();
  const [mySubs, setMySubs] = useState([]);
  const [myFollowing, setMyFollowing] = useState([]);
  const [myLocalSubs, setMyLocalSubs] = useState([]);
  const [myMultis, setMyMultis] = useState([]);
  const [session, loading] = useSession();
  const [loadedMultis, setloadedMultis] = useState(false);
  const [loadedSubs, setloadedSubs] = useState(false);
  const [currLocation, setCurrLocation] = useState("");
  const [currSubs, setCurrSubs] = useState([]);
  const [currSubInfo, setCurrSubInfo] = useState({});
  const [subInfoCache, setSubInfoCache] = useState({});
  const [multi, setMulti] = useState("");
  const defaultMultis = [
    {
      data: {
        name: "Nature",
        display_name: "Nature",
        subreddits: [
          { name: "EarthPorn" },
          { name: "WaterPorn" },
          { name: "SkyPorn" },
          { name: "DesertPorn" },
          { name: "GeologyPorn" },
          { name: "SpacePorn" },
        ],
      },
    },
    {
      data: {
        name: "Aesthetic",
        display_name: "Aesthetic",
        subreddits: [
          { name: "DesignPorn" },
          { name: "StreetArtPorn" },
          { name: "FractalPorn" },
          { name: "ExposurePorn" },
          { name: "Generative" },
          { name: "Art" },
        ],
      },
    },
  ];
  const [myLocalMultis, setMyLocalMultis] = useState<any[]>([]);
  const [myLocalMultiRender, setMyLocalMultiRender] = useState(0);

  useEffect(() => {
    if (myLocalMultis.length > 0) {
      localStorage.setItem("localMultis", JSON.stringify(myLocalMultis));
    }
  }, [myLocalMultis, myLocalMultiRender]);
  useEffect(() => {
    const local_localMultis = localStorage.getItem("localMultis");
    local_localMultis?.length > 0
      ? setMyLocalMultis(JSON.parse(local_localMultis))
      : setMyLocalMultis(defaultMultis);
  }, []);
  const createLocalMulti = (multi: string, subreddits?: string[]) => {
    let found = false;
    myLocalMultis.forEach((m) => {
      if (m?.data?.name?.toUpperCase() === multi.toUpperCase()) found = true;
    });
    if (!found) {
      setMyLocalMultis((m) => [
        ...m,
        {
          data: {
            name: multi,
            display_name: multi,
            subreddits: subreddits.map((s) => {
              return { name: s };
            }),
          },
        },
      ]);
      setMyLocalMultiRender((r) => r + 1);
      return true;
    }
    return false;
  };
  const deleteLocalMulti = (multi) => {
    let afterdelete = myLocalMultis.filter(
      (m) => m?.data?.name?.toUpperCase() !== multi.toUpperCase()
    );
    setMyLocalMultis(afterdelete);

    //update localstroage if no more multis
    if (afterdelete.length === 0) {
      localStorage.setItem("localMultis", JSON.stringify(afterdelete));
    }
  };
  const addToLocalMulti = (multi: String, sub) => {
    let localMultisCopy = myLocalMultis;
    let found = false;
    localMultisCopy.forEach((m, i) => {
      if (m?.data?.name?.toUpperCase() === multi.toUpperCase()) {
        m?.data?.subreddits?.forEach((s, j) => {
          if (s?.name?.toUpperCase() === sub.toUpperCase()) found = true;
        });
        if (!found) {
          localMultisCopy[i].data.subreddits = [
            ...localMultisCopy[i].data.subreddits,
            { name: sub },
          ];
        }
      }
    });
    //console.log(localMultisCopy);
    setMyLocalMultiRender((r) => r + 1);
    setMyLocalMultis(localMultisCopy);
  };
  const addAllToLocalMulti = (multi, subs: [String]) => {
    setMyLocalMultis((multis) => {
      let localMultisCopy = multis;
      subs.forEach((sub) => {
        let found = false;
        localMultisCopy.forEach((m, i) => {
          if (m?.data?.name?.toUpperCase() === multi.toUpperCase()) {
            m?.data?.subreddits?.forEach((s, j) => {
              if (s?.name?.toUpperCase() === sub.toUpperCase()) found = true;
            });
            if (!found) {
              localMultisCopy[i].data.subreddits = [
                ...localMultisCopy[i].data.subreddits,
                { name: sub },
              ];
            }
          }
        });
      });
      setMyLocalMultiRender((r) => r + 1);
      return localMultisCopy;
    });
  };
  const removeFromLocalMulti = (multi, sub) => {
    let localMultisCopy = myLocalMultis;
    let multi_index = -1;
    localMultisCopy.forEach((m, i) => {
      //console.log(m?.data?.name?.toUpperCase());
      if (m?.data?.name?.toUpperCase() === multi.toUpperCase()) {
        multi_index = i;
        let subreddits = m.data?.subreddits?.filter(
          (s) => s?.name?.toUpperCase() !== sub.toUpperCase()
        );
        //console.log(multi_index, subreddits);
        localMultisCopy[multi_index].data.subreddits = subreddits;
      }
    });
    if (multi_index > -1) {
      //console.log(localMultisCopy);
      //handle no more subs in multi
      if (localMultisCopy[multi_index].data.subreddits?.length === 0) {
        deleteLocalMulti(localMultisCopy[multi_index].data.name);
      } else {
        setMyLocalMultiRender((r) => r + 1);
        setMyLocalMultis(localMultisCopy);
      }
    }
  };

  const removeAllFromLocalMulti = (multi: String, subs: [String]) => {
    let localMultisCopy = myLocalMultis;
    let deleted = false;
    subs.forEach((sub) => {
      let multi_index = -1;
      localMultisCopy.forEach((m, i) => {
        //console.log(m?.data?.name?.toUpperCase());
        if (m?.data?.name?.toUpperCase() === multi.toUpperCase()) {
          multi_index = i;
          let subreddits = m.data?.subreddits?.filter(
            (s) => s?.name?.toUpperCase() !== sub.toUpperCase()
          );
          //console.log(multi_index, subreddits);
          localMultisCopy[multi_index].data.subreddits = subreddits;
        }
      });
      if (multi_index > -1) {
        //console.log(localMultisCopy);
        //handle no more subs in multi
        if (localMultisCopy[multi_index].data.subreddits?.length === 0) {
          deleteLocalMulti(localMultisCopy[multi_index].data.name);
          deleted = true;
        }
      }
    });
    if (!deleted) {
      setMyLocalMultiRender((r) => r + 1);
      setMyLocalMultis(localMultisCopy);
    }
  };

  const createRedditMulti = async (
    multiname: string,
    subreddits: string[],
    username: string
  ) => {
    let found = false;
    myMultis.forEach((m) => {
      //console.log(m?.data?.name);
      if (m?.data?.name?.toUpperCase() === multiname.toUpperCase())
        found = true;
    });
    if (!found) {
      let res = await createMulti(multiname, username, subreddits);
      if (res?.ok) {
        loadAllMultis();
      }
      //console.log("res", res);
      return res;
    } else {
      return false;
    }
  };
  const addToRedditMulti = async (multi, username, subname) => {
    //console.log("addtomulti");
    let res = await addToMulti(multi, username, subname);
    //console.log(res);
    if (res?.ok) {
      loadAllMultis();
    }
  };
  const removeFromRedditMulti = async (multi, username, subname) => {
    //console.log("removefrommulti");

    let res = await deleteFromMulti(multi, username, subname);
    //console.log(res);
    if (res?.ok) {
      loadAllMultis();
    }
  };
  const deleteRedditMulti = async (multi, username) => {
    //console.log("deletefrommulti");

    let res = await deleteMulti(multi, username);
    //console.log(res);
    if (res?.ok) {
      loadAllMultis();
    }
  };

  const addToSubCache = (subInfo) => {
    let sub = subInfo?.data?.display_name?.toUpperCase();
    let subInfoLess = {
      kind: subInfo.kind,
      data: {
        banner_background_color: subInfo?.data?.banner_background_color,
        banner_background_image: subInfo?.data?.banner_background_image,
        banner_img: subInfo?.data?.banner_img,
        community_icon: subInfo?.data?.community_icon,
        display_name: subInfo?.data?.display_name,
        display_name_prefixed: subInfo?.data?.display_name_prefixed,
        header_img: subInfo?.data?.header_img,
        icon_img: subInfo?.data?.icon_img,
        key_color: subInfo?.data?.key_color,
        name: subInfo?.data?.name,
        over18: subInfo?.data?.over18,
        primary_color: subInfo?.data?.primary_color,
        public_description: subInfo?.data?.public_description,
        subscribers: subInfo?.data?.subscribers,
        title: subInfo?.data?.title,
        url: subInfo?.data?.url,
      },
    };

    setSubInfoCache((s) => {
      //limit cache to 50 subs
      if (Object.keys(s).length > 500) {
        let keys = Object.keys(s);
        delete s[keys[0]];
      }
      s[sub] = subInfoLess;
      return s;
    });
  };

  useEffect(() => {
    //console.log(currSubs);
    router?.query?.m
      ? setMulti(router?.query?.m?.toString())
      : currSubs?.length > 1
      ? setMulti(`Multi`)
      : setMulti("");
  }, [router?.query, currSubs]);

  useEffect(() => {
    let asynccheck = true;
    const loadCurrSubInfo = async (sub, isUser = false) => {
      if (subInfoCache?.[sub]) {
        asynccheck && setCurrSubInfo(subInfoCache?.[sub]);
      }
      let info = await loadSubredditInfo(sub, isUser);
      if (info) {
        addToSubCache(info);
        asynccheck && setCurrSubInfo(info);

        return info;
      }
    };

    if (router?.pathname === "/r/[...slug]" && router?.query?.slug?.[0]) {
      let loc = router?.query?.slug?.[0]
        .split(" ")
        .join("+")
        .split("%20")
        .join("+")
        .split("+");
      setCurrSubs(
        loc.sort((a, b) => {
          let aUpper = a.toUpperCase();
          let bUpper = b.toUpperCase();
          if (aUpper < bUpper) return -1;
          if (aUpper > bUpper) return 1;
          return 0;
        })
      );
      let curr = loc[0].toString()?.toUpperCase();
      if (router?.query?.m) {
        setCurrLocation(router?.query?.m?.[0]?.toString());
      } else {
        setCurrLocation(curr);
      }
      if (curr.toUpperCase() !== "ALL" || curr.toUpperCase() !== "POPULAR") {
        loadCurrSubInfo(curr);
      }
    } else if (router?.route === "/search") {
      setCurrLocation("SEARCH");
    } else if (router?.route === "/subreddits") {
      setCurrLocation("SUBREDDITS");
    } else if (router?.pathname === "/" || !router?.pathname.includes("/u")) {
      setCurrLocation("HOME");
    } else if (router?.pathname === "/u/[...slug]") {
      loadCurrSubInfo(`${router?.query?.slug?.[0]}`, true);
      setCurrLocation(router?.query?.slug?.[0]?.toString());
    } else {
      setCurrLocation("");
      setCurrSubInfo({});
    }
    return () => {
      asynccheck = false;
      setCurrSubInfo({});
    };
  }, [router?.query?.slug?.[0], router.route]);

  //removing loadallfast from initial page load. Only loadall when needed
  useEffect(() => {
    if (
      !loadedSubs &&
      (router?.pathname === "/r/[...slug]" ||
        router?.pathname === "/u/[...slug]" ||
        router?.pathname === "/search")
    ) {
      loadLocalSubs();
      loadAllFast();
    }
  }, [router?.pathname, loadedSubs]);
  useEffect(() => {
    if (
      router?.pathname === "/r/[...slug]" &&
      router?.query?.slug?.[1] !== "comments" &&
      !loadedSubs
    ) {
      loadAllFast();
    }
  }, [router, loadedSubs]);
  const tryLoadAll = () => {
    !loadedSubs && loadAllFast();
  };

  useEffect(() => {
    loadLocalSubs();
    return () => {};
  }, [context.localSubs]);

  useEffect(() => {
    if (session && mySubs.length == 0) {
      loadAllFast();
    } else if (!session && !loading) {
      loadLocalSubs();
      setloadedSubs(true);
    }
  }, [session, loading]);

  useEffect(() => {
    mySubs.forEach((sub) => {
      if (!subInfoCache?.[sub?.data?.display_name]) {
        addToSubCache(sub);
      }
    });
  }, [mySubs]);

  const loadLocalSubs = () => {
    let localsubs = [];
    context.localSubs.forEach((s) => {
      let sub = {
        data: {
          name: s,
          display_name: s,
          url: s?.substring(0, 2) === "u_" ? `/u/${s.substring(2)}` : `/r/${s}`,
        },
      };
      localsubs.push(sub);
    });
    localsubs = localsubs.sort((a, b) =>
      a.data.display_name.localeCompare(b.data.display_name)
    );
    //console.log(localsubs);
    setMyLocalSubs(localsubs);
  };

  const loadAllFast = async () => {
    try {
      //console.log('load subs');
      const multis = getMyMultis();
      const all = getAllMyFollows();
      setMyMultis(await multis);
      setloadedMultis(true);
      let { subs, users } = await all;
      setMySubs(subs);
      setMyFollowing(users);
      setloadedSubs(true);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAllMultis = async () => {
    try {
      //console.log("load multis");
      const multis = await getMyMultis();
      //console.log(multis);
      if (multis) {
        setMyMultis(multis);
        setloadedMultis(true);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const loadAllSubs = async (loggedIn: boolean | any = false) => {
    if (session || loggedIn) {
      try {
        //console.log('loadallsubs')
        setloadedSubs(false);
        let data = await getAllMyFollows();
        setMySubs(data.subs);
        setMyFollowing(data.users);
        //console.log('loaded subs', data);
        setloadedSubs(true);
      } catch (err) {
        console.log(err);
      }
    } else if (!session) {
      //loadAllSubs(await getSession())
      //console.log("load all refresh");
      // loadLocalSubs();
      //console.log('fail')
    }
  };

  const [error, seterror] = useState(false);
  useEffect(() => {
    if (session && loadedSubs && mySubs.length < 1) {
      //loadAllFast();
      seterror(true);
    } else {
      seterror(false);
    }
    return () => {
      seterror(false);
    };
  }, [mySubs, session, loadedSubs]);

  const subscribe = async (
    action: "sub" | "unsub",
    subname,
    loggedIn = false
  ) => {
    //console.log("subAPI", action, subname, loggedIn);
    if (session || loggedIn) {
      let sub = subname;
      if (subInfoCache?.[sub?.toUpperCase()]) {
        sub = subInfoCache[sub?.toUpperCase()]?.data?.name;
      } else {
        let isUser = sub?.substring(0, 2) == "u_";
        if (isUser) sub = sub.substring(2);
        let subInfo = await loadSubredditInfo(sub, isUser);
        subInfo && addToSubCache(subInfo);
        sub = isUser ? subInfo?.data?.subreddit?.name : subInfo?.data?.name;
      }

      let status = await subToSub(action, sub);
      //console.log('session:', status);
      if (status) {
        loadAllSubs(loggedIn);
        return true;
      }
    } else if ((!session && !loading) || !loggedIn) {
      let status = await context.subToSub(action, subname);
      return status;
    }
  };

  const subscribeAll = async (subs: string[]) => {
    subs.forEach((sub) => {
      if (!session && !loading) {
        context.subToSub("sub", sub);
      } else if (session) {
        subscribe("sub", sub, true);
      }
    });
  };

  // return {
  //   myLocalSubs,
  //   mySubs,
  //   myMultis,
  //   loadedSubs,
  //   loadedMultis,
  //   subscribe,
  //   error
  // }
  return (
    <SubsContext.Provider
      value={{
        myLocalSubs,
        mySubs,
        myFollowing,
        myMultis,
        myLocalMultis,
        myLocalMultiRender,
        createLocalMulti,
        deleteLocalMulti,
        addToLocalMulti,
        addAllToLocalMulti,
        removeFromLocalMulti,
        removeAllFromLocalMulti,
        createRedditMulti,
        addToRedditMulti,
        removeFromRedditMulti,
        deleteRedditMulti,
        loadedSubs,
        loadedMultis,
        subscribe,
        subscribeAll,
        error,
        currSubInfo,
        currLocation,
        currSubs,
        multi,
        tryLoadAll,
        subInfoCache,
        addToSubCache,
      }}
    >
      {children}
    </SubsContext.Provider>
  );
};
