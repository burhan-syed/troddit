import React, { useState, useEffect, useContext } from "react";
import { useSession } from "next-auth/client";
import { useMainContext } from "./MainContext";
import {
  getAllMySubs,
  getMyMultis,
  getMySubs,
  loadSubInfo,
  subToSub
} from "./RedditAPI";

export const SubsContext: any = React.createContext({});
export const useSubsContext = () => {
  return useContext(SubsContext);
};

export const MySubsProvider = ({ children }) => {
  const context: any = useMainContext();
  const [mySubs, setMySubs] = useState([]);
  const [myLocalSubs, setMyLocalSubs] = useState([]);
  const [myMultis, setMyMultis] = useState([]);
  const [session, loading] = useSession();
  const [loadedMultis, setloadedMultis] = useState(false);
  const [loadedSubs, setloadedSubs] = useState(false);

  useEffect(() => {
    loadLocalSubs();
    loadAllFast();
  }, [])

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

  const loadAllSubs = async (action = "", sub = "") => {
    if (session) {
      try {
        setloadedSubs(false);
        let data = await getAllMySubs();
        setMySubs(data);
        //console.log('loaded subs', data);
        setloadedSubs(true);
      } catch (err) {
        console.log(err);
      }
    } else if (!session) {
      // console.log("load all refresh");
      // loadLocalSubs();
    }
  };

  const [error, seterror] = useState(false);
  useEffect(() => {
    if (session && loadedSubs && mySubs.length < 1) {
      seterror(true);
    } else {
      seterror(false);
    }
    return () => {
      seterror(false);
    };
  }, [mySubs, session, loadedSubs]);

  const subscribe = async (action: 'sub' | 'unsub', subname, loggedIn = false) => {
    //console.log('subAPI', loggedIn, session)
    if (session || loggedIn) {
      let status = await subToSub(action, subname);
      //console.log('session:', status);
      if (status) {
        loadAllSubs();
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
    error
      }}
    >
      {children}
    </SubsContext.Provider>
  );
};
