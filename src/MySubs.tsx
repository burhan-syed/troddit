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
  const [currLocationPic, setcurrLocationPic] = useState("");
  const [currLocation, setCurrLocation] = useState("");
  const [currSubs, setCurrSubs] = useState([]);
  const [currSubInfo, setCurrSubInfo] = useState({});
  //   {
  //   submit_text_html: "",
  //   display_name: "",
  //   header_img: "",
  //   title: "",
  //   icon_size: [256, 256],
  //   primary_color: "",
  //   active_user_count: 0,
  //   icon_img: "",
  //   display_name_prefixed: "",
  //   accounts_active: 0,
  //   public_traffic: false,
  //   subscribers: 0,
  //   user_flair_richtext: [],
  //   name: "",
  //   quarantine: false,
  //   hide_ads: false,
  //   public_description: "",
  //   community_icon: "",
  //   banner_background_image: "",
  //   submit_text: "",
  //   description_html: "",
  //   spoilers_enabled: true,
  //   key_color: "",
  //   created: 0,
  //   wls: 6,
  //   submission_type: "",
  //   public_description_html: "",
  //   banner_img: "",
  //   banner_background_color: "",
  //   id: "",
  //   over18: false,
  //   description: "",
  //   lang: "",
  //   whitelist_status: "",
  //   url: "",
  //   created_utc: 0,
  //   banner_size: 0,
  //   mobile_banner_image: "",
  // });

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
  const [myLocalMultis, setMyLocalMultis] = useState<any[]>(defaultMultis);

  useEffect(() => {
    if (myLocalMultis.length > 0) {
      localStorage.setItem("localMultis", JSON.stringify(myLocalMultis));
    }
  }, [myLocalMultis]);
  useEffect(() => {
    const local_localMultis = localStorage.getItem("localMultis");
    local_localMultis?.length > 0 &&
      setMyLocalMultis(JSON.parse(local_localMultis));
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
  const addToLocalMulti = (multi, sub) => {
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
    setMyLocalMultis(localMultisCopy);
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
        setMyLocalMultis(localMultisCopy);
      }
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

  useEffect(() => {
    //console.log(currSubs);
    router?.query?.m
      ? setMulti(router?.query?.m?.toString())
      : currSubs?.length > 1
      ? setMulti(`Multi`)
      : setMulti("");
  }, [router?.query, currSubs]);

  useEffect(() => {
    //console.log(router);
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
    } else if (router?.pathname === "/" || !router?.pathname.includes("/u")) {
      setCurrLocation("HOME");
    } else if (router?.pathname === "/u/[...slug]") {
      loadCurrSubInfo(`u_${router?.query?.slug?.[0]}`);
      setCurrLocation(router?.query?.slug?.[0]?.toString());
    } else {
      setCurrLocation("");
      setCurrSubInfo({});
    }
    return () => {
      setCurrSubInfo({});
    };
  }, [router?.query?.slug?.[0]]);

  //removing loadallfast from initial page load. Only loadall when needed
  useEffect(() => {
    loadLocalSubs();
    if (
      router?.pathname === "/r/[...slug]" ||
      router?.pathname === "/u/[...slug]"
    ) {
      loadAllFast();
    }
  }, []);
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

  const loadCurrSubInfo = async (sub) => {
    const info = await loadSubredditInfo(sub);
    if (info?.name) {
      setCurrSubInfo(info);
      return info;
    }
  };

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
    //console.log('subAPI', action,subname,loggedIn);
    if (session || loggedIn) {
      let status = await subToSub(action, subname);
      //console.log('session:', status);
      if (status) {
        loadAllSubs(loggedIn);
        return true;
      }
    } else if ((!session && !loading) || !loggedIn) {
      let status = context.subToSub(action, subname);
      //console.log('!session:', status);
    }
  };

  const subscribeAll = async (subs: string[]) => {
    subs.forEach((s) => {
      context.subToSub("sub", s);
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
        createLocalMulti,
        deleteLocalMulti,
        addToLocalMulti,
        removeFromLocalMulti,
        createRedditMulti,
        addToRedditMulti,
        removeFromRedditMulti,
        deleteRedditMulti,
        loadedSubs,
        loadedMultis,
        subscribe,
        subscribeAll,
        error,
        loadCurrSubInfo,
        currSubInfo,
        currLocation,
        currSubs,
        multi,
        tryLoadAll,
      }}
    >
      {children}
    </SubsContext.Provider>
  );
};
