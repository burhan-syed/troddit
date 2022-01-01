import React, { useState, useEffect, useContext } from "react";
import { getSession, useSession } from "next-auth/client";
import { useMainContext } from "./MainContext";
import {
  getAllMySubs,
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
  const [localMultis, setLocalMultis] = useState([]);
  
  useEffect(() => {
    router?.query?.m
      ? setMulti(router?.query?.m?.toString())
      : setMulti("");
  }, [router?.query]);

  useEffect(() => {
    //console.log(router);
    if (router?.pathname === "/r/[...slug]" && router?.query?.slug?.[0]) {
      let loc = router?.query?.slug?.[0]
        .split(" ")
        .join("+")
        .split("%20")
        .join("+")
        .split("+");
      setCurrSubs(loc);
      let curr = loc[0].toString()?.toUpperCase();
      if (router?.query?.m) {
        setCurrLocation(router?.query?.m?.[0]?.toString());
      } else {
        setCurrLocation(curr);
      }
      if (curr.toUpperCase() !== "ALL" || curr.toUpperCase() !== "POPULAR") {
        loadCurrSubInfo(curr);
      }
    } else if (router?.pathname === "/" || !router?.pathname.includes('/u')) {
      setCurrLocation("HOME");
    } else {
      setCurrLocation("");
      setCurrSubInfo({});
    }
    return () => {};
  }, [router]);

  useEffect(() => {
    loadLocalSubs();
    loadAllFast();
  }, []);

  useEffect(() => {
    loadLocalSubs();
    return () => {};
  }, [context.localSubs]);

  useEffect(() => {
    if (session) {
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
      let sub = { data: { name: s, display_name: s } };
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
      const subs = getAllMySubs();
      setMyMultis(await multis);
      setloadedMultis(true);
      setMySubs(await subs);
      setloadedSubs(true);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAllSubs = async (loggedIn: boolean | any = false) => {
    if (session || loggedIn) {
      try {
        // console.log('loadallsubs')
        setloadedSubs(false);
        let data = await getAllMySubs();
        setMySubs(data);
        //console.log('loaded subs', data);
        setloadedSubs(true);
      } catch (err) {
        console.log(err);
      }
    } else if (!session) {
      //loadAllSubs(await getSession())
      // console.log("load all refresh");
      // loadLocalSubs();
      //console.log('fail')
    }
  };

  const [error, seterror] = useState(false);
  useEffect(() => {
    if (session && loadedSubs && mySubs.length < 1) {
      loadAllFast();
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
        myMultis,
        loadedSubs,
        loadedMultis,
        subscribe,
        error,
        loadCurrSubInfo,
        currSubInfo,
        currLocation,
        multi
      }}
    >
      {children}
    </SubsContext.Provider>
  );
};
