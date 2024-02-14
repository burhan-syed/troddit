import localForage from "localforage";
import React, { useState, useEffect, useContext } from "react";
import { getSession, useSession } from "next-auth/react";
import { useMainContext, localSubInfoCache } from "./MainContext";
import {
  addToMulti,
  createMulti,
  deleteFromMulti,
  deleteMulti,
  favoriteSub,
  getAllMyFollows,
  getMyMultis,
  getMySubs,
  loadSubInfo,
  loadSubredditInfo,
  subToSub,
} from "./RedditAPI";
import { useRouter } from "next/dist/client/router";
import toast from "react-hot-toast";

import ToastCustom from "./components/toast/ToastCustom";
import { useTAuth } from "./PremiumAuthContext";

export const SubsContext: any = React.createContext({});
export const useSubsContext = () => {
  return useContext(SubsContext);
};

export const MySubsProvider = ({ children }) => {
  const router = useRouter();
  const user = useTAuth();
  const context: any = useMainContext();
  const [mySubs, setMySubs] = useState([]);
  const [myFollowing, setMyFollowing] = useState([]);
  const [myLocalSubs, setMyLocalSubs] = useState([]);
  const [myMultis, setMyMultis] = useState([]);
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [loadedMultis, setloadedMultis] = useState(false);
  const [loadedSubs, setloadedSubs] = useState(false);
  const [loadingSubs, setLoadingSubs] = useState(false);
  const [currLocation, setCurrLocation] = useState("");
  const [currSubs, setCurrSubs] = useState([]);
  const [currSubInfo, setCurrSubInfo] = useState({});
  //const [subInfoCache, setSubInfoCache] = useState({});
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
      //localStorage.setItem("localMultis", JSON.stringify(myLocalMultis));
      localForage.setItem("myLocalMultis", myLocalMultis);
    }
  }, [myLocalMultis, myLocalMultiRender]);
  useEffect(() => {
    const loadMultis = async () => {
      let local_localMultis: [] = await localForage.getItem("myLocalMultis");
      if (local_localMultis == undefined) {
        local_localMultis = JSON.parse(localStorage.getItem("localMultis"));
      } else {
        localStorage.removeItem("localMultis");
      }
      local_localMultis?.length > 0
        ? setMyLocalMultis(local_localMultis)
        : (local_localMultis === undefined || local_localMultis === null) &&
          setMyLocalMultis(defaultMultis);
    };
    loadMultis();
  }, []);
  const createLocalMulti = (multi: string, subreddits?: string[]) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom t={t} message={`Creating ${multi}`} mode={"loading"} />
      ),
      { position: "bottom-center" }
    );
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
      toast.custom(
        (t) => (
          <ToastCustom t={t} message={`Created ${multi}`} mode={"success"} />
        ),
        { id: toastId, duration: 1500 }
      );
      return true;
    }
    toast.custom(
      (t) => (
        <ToastCustom t={t} message={`Error creating ${multi}`} mode={"error"} />
      ),
      { id: toastId, duration: 1500 }
    );
    return false;
  };
  const deleteLocalMulti = (multi) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom t={t} message={`Deleting ${multi}`} mode={"loading"} />
      ),
      { position: "bottom-center" }
    );
    let afterdelete = myLocalMultis.filter(
      (m) => m?.data?.name?.toUpperCase() !== multi.toUpperCase()
    );
    setMyLocalMultis(afterdelete);

    //update localstroage if no more multis
    if (afterdelete.length === 0) {
      //localStorage.setItem("localMultis", JSON.stringify(afterdelete));
      localForage.setItem("myLocalMultis", afterdelete);
    }
    toast.custom(
      (t) => (
        <ToastCustom t={t} message={`Deleted ${multi}`} mode={"success"} />
      ),
      { id: toastId, duration: 1500 }
    );
  };
  const addToLocalMulti = (multi: String, sub) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`Adding ${sub} to ${multi}`}
          mode={"loading"}
        />
      ),
      { position: "bottom-center" }
    );
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
    setMyLocalMultiRender((r) => r + 1);
    setMyLocalMultis(localMultisCopy);
    toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`Added ${sub} to ${multi}`}
          mode={"success"}
        />
      ),
      { id: toastId, duration: 1500 }
    );
  };
  const addAllToLocalMulti = (multi, subs: [String]) => {
    setMyLocalMultis((multis) => {
      const toastId = toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Adding ${subs.length} subs to ${multi}`}
            mode={"loading"}
          />
        ),
        { position: "bottom-center" }
      );
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
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Added ${subs.length} subs to ${multi}`}
            mode={"success"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
      return localMultisCopy;
    });
  };
  const removeFromLocalMulti = (multi, sub) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`Removing ${sub} from ${multi}`}
          mode={"loading"}
        />
      ),
      { position: "bottom-center" }
    );
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
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`No more subs in multi ${multi}, deleting`}
              mode={"error"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
        deleteLocalMulti(localMultisCopy[multi_index].data.name);
      } else {
        setMyLocalMultiRender((r) => r + 1);
        setMyLocalMultis(localMultisCopy);
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Removed ${sub} from ${multi}`}
              mode={"success"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
      }
    } else {
      toast.custom(
        (t) => (
          <ToastCustom t={t} message={`Something went wrong`} mode={"error"} />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };

  const removeAllFromLocalMulti = (multi: String, subs: [String]) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`Removing ${subs.length} subs from ${multi}`}
          mode={"loading"}
        />
      ),
      { position: "bottom-center" }
    );
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
          toast.custom(
            (t) => (
              <ToastCustom
                t={t}
                message={`No more subs in ${multi}, deleting`}
                mode={"error"}
              />
            ),
            { id: toastId, duration: 1500 }
          );
          deleteLocalMulti(localMultisCopy[multi_index].data.name);
          deleted = true;
        }
      }
    });
    if (!deleted) {
      setMyLocalMultiRender((r) => r + 1);
      setMyLocalMultis(localMultisCopy);
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Removed ${subs.length} subs from ${multi}`}
            mode={"success"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };

  const createRedditMulti = async (
    multiname: string,
    subreddits: string[],
    username: string
  ) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom t={t} message={`Creating ${multiname}`} mode={"loading"} />
      ),
      { position: "bottom-center" }
    );
    let found = false;

    myMultis.forEach((m) => {
      if (m?.data?.name?.toUpperCase() === multiname.toUpperCase())
        found = true;
    });
    if (!found) {
      let res = await createMulti({
        display_name: multiname,
        srnames: subreddits,
        user: username,
        isPremium: user.premium?.isPremium,
      });
      if (res?.ok) {
        loadAllMultis();
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Created ${multiname}`}
              mode={"success"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
      } else {
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Error creating ${multiname}`}
              mode={"error"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
      }
      return res;
    } else {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Error creating ${multiname}`}
            mode={"error"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
      return false;
    }
  };
  const addToRedditMulti = async (multi, username, subname) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`Adding ${subname} to ${multi}`}
          mode={"loading"}
        />
      ),
      { position: "bottom-center" }
    );
    let res = await addToMulti({
      multi: multi,
      srname: subname,
      user: username,
      isPremium: user.premium?.isPremium,
    });
    //console.log(res);
    if (res?.ok) {
      loadAllMultis();
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Added ${subname} to ${multi}`}
            mode={"success"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    } else {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Error adding ${subname} to ${multi}`}
            mode={"error"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };
  const removeFromRedditMulti = async (multi, username, subname) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`Removing ${subname} from ${multi}`}
          mode={"loading"}
        />
      ),
      { position: "bottom-center" }
    );
    let res = await deleteFromMulti({
      multi: multi,
      user: username,
      srname: subname,
      isPremium: user.premium?.isPremium,
    });
    //console.log(res);
    if (res?.ok) {
      loadAllMultis();
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Removed ${subname} from ${multi}`}
            mode={"success"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    } else {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Error removing ${subname} from ${multi}`}
            mode={"error"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };
  const deleteRedditMulti = async (multi, username) => {
    const toastId = toast.custom(
      (t) => (
        <ToastCustom t={t} message={`Deleting ${multi}`} mode={"loading"} />
      ),
      { position: "bottom-center" }
    );
    let res = await deleteMulti({
      multiname: multi,
      username: username,
      isPremium: user.premium?.isPremium,
    });
    //console.log(res);
    if (res?.ok) {
      loadAllMultis();
      toast.custom(
        (t) => (
          <ToastCustom t={t} message={`Deleted ${multi}`} mode={"success"} />
        ),
        { id: toastId, duration: 1500 }
      );
    } else {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Error deleting ${multi}`}
            mode={"error"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };

  const checkSubCache = async (sub_displayName, isUser) => {
    let cached = await localSubInfoCache.getItem(
      ((isUser ? "U_" : "") + sub_displayName)?.toUpperCase()
    );
    return cached;
  };

  const trimSubInfo = (subInfo) => {
    let subInfoLess = {
      data: {
        banner_background_color: subInfo?.banner_background_color,
        banner_background_image: subInfo?.banner_background_image,
        banner_img: subInfo?.banner_img,
        community_icon: subInfo?.community_icon,
        display_name: subInfo?.display_name,
        display_name_prefixed: subInfo?.display_name_prefixed,
        header_img: subInfo?.header_img,
        icon_img: subInfo?.icon_img,
        key_color: subInfo?.key_color,
        name: subInfo?.name,
        over18: subInfo?.over18,
        primary_color: subInfo?.primary_color,
        public_description: subInfo?.public_description,
        subscribers: subInfo?.subscribers,
        title: subInfo?.title,
        url: subInfo?.url,
        user_has_favorited: subInfo?.user_has_favorited,
        user_is_banned: subInfo?.user_is_banned,
        user_is_subscriber: subInfo?.user_is_subscriber,
      },
    };
    return subInfoLess;
  };
  const trimUserInfo = (userInfo) => {
    let subInfo = userInfo?.subreddit;
    let userInfoLess = {
      data: {
        ...userInfo,
        subreddit: {
          accept_followers: subInfo?.accept_followers,
          accounts_active: subInfo?.accounts_active,
          active_user_count: subInfo?.active_user_count,
          allow_discovery: subInfo?.allow_discovery,
          banner_background_color: subInfo?.banner_background_color,
          banner_background_image: subInfo?.banner_background_image,
          banner_img: subInfo?.banner_img,
          banner_size: subInfo?.banner_size,
          community_icon: subInfo?.community_icon,
          created_urc: subInfo?.created_utc,
          display_name: subInfo?.display_name,
          display_name_prefixed: subInfo?.display_name_prefixed,
          header_img: subInfo?.header_img,
          icon_img: subInfo?.icon_img,
          icon_size: subInfo?.icon_size,
          key_color: subInfo?.key_color,
          name: subInfo?.name,
          over18: subInfo?.over18,
          primary_color: subInfo?.primary_color,
          public_description: subInfo?.public_description,
          subscribers: subInfo?.subscribers,
          title: subInfo?.title,
          url: subInfo?.url,
          user_has_favorited: subInfo?.user_has_favorited,
          user_is_banned: subInfo?.user_is_banned,
          user_is_subscriber: subInfo?.user_is_subscriber,
        },
      },
    };
    return userInfoLess;
  };

  const addToSubCache = (data) => {
    let subInfo = data?.data?.subreddit ?? data?.data;
    //using display name as this is the only info we have immediately..
    let sub = subInfo?.display_name?.toUpperCase();
    let subInfoLess = trimSubInfo(subInfo);

    localSubInfoCache.setItem(sub, subInfoLess);

    //keep local storage in check
    const maxCacheLength = 200;
    localSubInfoCache.length().then((len) => {
      if (len > maxCacheLength) {
        localSubInfoCache.key(maxCacheLength - 1).then((key) => {
          localSubInfoCache.removeItem(key);
        });
      }
    });
  };

  useEffect(() => {
    //console.log(currSubs)
    const params = new Proxy(new URLSearchParams(window.location.search), {
      get: (searchParams, prop) => searchParams.get(prop as string),
    });
    const lmulti = router?.query?.m ?? params?.["m"];
    lmulti
      ? setMulti(lmulti)
      : currSubs?.length > 1
      ? setMulti(`Feed`)
      : setMulti("");
  }, [router?.query, currSubs]);

  useEffect(() => {
    let asynccheck = true;
    const loadCurrSubInfo = async (sub, isUser = false) => {
      let cachedInfo = await checkSubCache(sub, isUser);
      if (cachedInfo) {
        asynccheck && setCurrSubInfo(cachedInfo);
      }
      let info = await loadSubredditInfo({
        query: sub,
        loadUser: isUser,
        isPremium: user.premium?.isPremium,
      });
      if (info) {
        addToSubCache(info);
        asynccheck && setCurrSubInfo(info);

        return info;
      }
    };

    if (user.isLoaded) {
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
        setCurrSubs([]);
        setCurrLocation("SEARCH");
      } else if (router?.pathname?.includes("/subreddits")) {
        setCurrSubs([]);
        setCurrLocation("SUBREDDITS");
      } else if (
        router?.pathname === "/" ||
        !router?.pathname?.includes("/u")
      ) {
        setCurrSubs([]);
        setCurrLocation("HOME");
      } else if (router?.pathname === "/u/[...slug]") {
        setCurrSubs([router?.query?.slug?.[0]]);
        loadCurrSubInfo(`${router?.query?.slug?.[0]}`, true);
        setCurrLocation(router?.query?.slug?.[0]?.toString());
      } else {
        setCurrSubs([]);
        setCurrLocation("");
        setCurrSubInfo({});
      }
    }

    return () => {
      asynccheck = false;
      setCurrSubInfo({});
      setCurrSubs([]);
    };
  }, [router?.query?.slug?.[0], router.route, user.isLoaded]);

  //removing loadallfast from initial page load. Only loadall when needed
  useEffect(() => {
    if (
      user.isLoaded &&
      status !== "loading" &&
      !loadedSubs &&
      (router?.pathname === "/r/[...slug]" ||
        router?.pathname === "/u/[...slug]" ||
        router?.pathname === "/search")
    ) {
      status === "unauthenticated" ? loadLocalSubs() : tryLoadAll();
    }
  }, [
    router?.pathname,
    status,
    loadedSubs,
    user.isLoaded,
    user.premium?.isPremium,
  ]);
  useEffect(() => {
    if (
      user.isLoaded &&
      router?.pathname === "/r/[...slug]" &&
      router?.query?.slug?.[1] !== "comments" &&
      !loadedSubs
    ) {
      tryLoadAll();
    }
  }, [
    router,
    loadedSubs,
    user?.isLoaded,
    user.premium?.isPremium,
    user.isLoaded,
  ]);
  const tryLoadAll = () => {
    user?.premium?.isPremium && !loadedSubs && !loadingSubs && loadAllFast();
  };

  useEffect(() => {
    user.isLoaded && status === "unauthenticated" && loadLocalSubs();
    return () => {};
  }, [user.isLoaded, status, context.localSubs, context.localFavoriteSubs]);

  useEffect(() => {
    if (user.isLoaded) {
      if (session && mySubs.length == 0) {
        tryLoadAll();
      } else if (!session && !loading) {
        loadLocalSubs();
      }
    }
  }, [session, loading, user.isLoaded, user?.premium?.isPremium]);

  useEffect(() => {
    mySubs.forEach((sub) => {
      addToSubCache(sub);
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
          user_has_favorited: context.localFavoriteSubs.find(
            (f) => f?.toUpperCase() === s?.toUpperCase()
          ),
        },
      };
      localsubs.push(sub);
    });
    localsubs = localsubs.sort((a, b) =>
      a.data.display_name.localeCompare(b.data.display_name)
    );
    //console.log(localsubs);
    setMyLocalSubs(localsubs);
    if (!(localsubs.length > 0)) {
      setloadedSubs(true);
      setLoadingSubs(true);
    }
  };
  useEffect(() => {
    if (user.isLoaded && !session && !loading && myLocalSubs.length > 0) {
      setloadedSubs(true);
    }
  }, [myLocalSubs, session, loading, user.isLoaded]);

  const loadUserSubInfos = async (users) => {
    let follows = [];
    await Promise.allSettled([
      ...users.map(async (user) => {
        const info = await loadSubInfo({
          subreddit: user?.data?.subreddit?.display_name,
          isPremium: user?.premium?.isPremium,
        });
        info?.kind == "t5"
          ? follows.push({
              ...user,
              data: { ...user.data, subreddit: info.data },
            })
          : follows.push(user);
      }),
    ]);

    follows = follows.sort((a, b) => a.data.name.localeCompare(b.data.name));
    updateLocalStore(
      "follows",
      follows.map((f) => ({
        ...f,
        data: { ...trimUserInfo(f.data).data },
      }))
    );

    setMyFollowing(follows);
  };

  const loadAllFromReddit = async () => {
    try {
      setLoadingSubs(true);
      const multis = getMyMultis({ isPremium: user.premium?.isPremium });
      const all = getAllMyFollows({ isPremium: user.premium?.isPremium });
      let loadedMultis = await multis;
      setMyMultis(loadedMultis);
      setloadedMultis(true);
      let { subs, users } = await all;
      let username = session?.user?.name;
      if (username) {
        let pData = (await localForage.getItem("subSync"))?.[username];
        localForage.setItem("subSync", {
          [`${username}`]: {
            ...pData,
            lastUpdate: new Date(),
            multis: loadedMultis,
            subs: subs.map((s) => ({
              ...s,
              data: { ...trimSubInfo(s.data).data },
            })),
          },
        });
      }

      setMySubs(subs);
      await loadUserSubInfos(users);
      //setMyFollowing(users);
      setLoadingSubs(false);
      setloadedSubs(true);
    } catch (err) {
      setLoadingSubs(false);
      console.log(err);
    }
  };

  const loadAllFast = async () => {
    if (session?.user?.name && user?.premium?.isPremium) {
      setLoadingSubs(true);
      let username = session.user.name;
      let d = await localForage.getItem("subSync");
      let subs = d?.[username]?.subs;
      let follows = d?.[username]?.follows;
      let multis = d?.[username]?.multis;
      let lastUpdate = d?.[username]?.lastUpdate;
      //console.log("subs?", subs);
      //console.log("follows", follows);
      //console.log("multis?", multis);
      subs?.length > 0 && setMySubs(subs);
      follows?.length > 0 && setMyFollowing(follows);
      multis?.length > 0 && setMyMultis(multis);
      //console.log("lU?",(lastUpdate?.getTime() + (24 * 60 * 60 * 1000)))
      if (
        !(subs?.length > 0) ||
        !(follows?.length > 0) ||
        new Date().getTime() > lastUpdate?.getTime() + 24 * 60 * 60 * 1000
      ) {
        await loadAllFromReddit();
      } else {
        setLoadingSubs(false);
        setloadedSubs(true);
      }
      if (!(multis?.length > 0)) {
        loadAllMultis();
      } else {
        setloadedMultis(true);
      }
    }
  };

  const loadAllMultis = async () => {
    try {
      const multis = await getMyMultis({ isPremium: user.premium?.isPremium });
      if (multis) {
        setMyMultis(multis);
        setloadedMultis(true);
        updateLocalStore("multis", multis);
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
        let data = await getAllMyFollows({
          isPremium: user.premium?.isPremium,
        });
        setMySubs(data.subs);
        await loadUserSubInfos(data.users);
        //setMyFollowing(data.users);
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
  // useEffect(() => {
  //   if (session && loadedSubs && mySubs.length < 1) {
  //     //loadAllFast();
  //     seterror(true);
  //   } else {
  //     seterror(false);
  //   }
  //   return () => {
  //     seterror(false);
  //   };
  // }, [mySubs, session, loadedSubs]);

  const favorite = async (
    makeFavorite: boolean,
    subname: string,
    isUser = false,
    loggedIn = false
  ) => {
    if (session?.user?.name || loggedIn) {
      const pState = isUser ? myFollowing : mySubs;
      if (isUser) {
        setMyFollowing((users) => {
          let newFollows = users.map((user) => {
            if (user?.data?.subreddit?.display_name === subname) {
              return {
                ...user,
                data: {
                  ...user.data,
                  subreddit: {
                    ...user.data.subreddit,
                    user_has_favorited: makeFavorite,
                  },
                },
              };
            }
            return user;
          });
          updateLocalStore("follows", [
            ...newFollows.map((f) => ({
              ...f,
              data: { ...trimUserInfo(f.data).data },
            })),
          ]);
          return newFollows;
        });
      } else {
        setMySubs((subs) => {
          let newSubs = subs.map((sub) => {
            if (sub?.data?.display_name === subname) {
              return {
                ...sub,
                data: { ...sub.data, user_has_favorited: makeFavorite },
              };
            }
            return sub;
          });
          updateLocalStore("subs", [
            ...newSubs.map((f) => ({
              ...f,
              data: { ...trimSubInfo(f.data).data },
            })),
          ]);
          return newSubs;
        });
      }

      const res = await favoriteSub({
        favorite: makeFavorite,
        name: subname,
        isPremium: user.premium?.isPremium,
      });
      if (!res) {
        isUser ? setMyFollowing(pState) : setMySubs(pState);
      }
    } else {
      context.favoriteLocalSub(makeFavorite, subname);
    }
  };

  const updateLocalStore = async (key, data, update = false) => {
    let username = session?.user?.name;
    if (username) {
      let pData = (await localForage.getItem("subSync"))?.[username];
      await localForage.setItem("subSync", {
        [`${username}`]: {
          ...pData,
          //lastUpdate: new Date(),
          [key]: data,
        },
      });
    }
  };

  const mutateLocalRedditSubs = (
    action: "sub" | "unsub",
    subInfo,
    isUser = false
  ) => {
    if (isUser) {
      setMyFollowing((follows) => {
        let newFollows = follows;
        if (action === "unsub") {
          newFollows = follows.filter(
            (f) => f?.data?.name !== subInfo?.data?.name
          );
        } else if (!follows.find((s) => s.data.name === subInfo.data.name)) {
          newFollows = [...follows, subInfo].sort((a, b) =>
            a.data.name.localeCompare(b.data.name)
          );
        }

        updateLocalStore("follows", [
          ...newFollows.map((f) => ({
            ...f,
            data: { ...trimUserInfo(f.data).data },
          })),
        ]);
        return newFollows;
      });
    } else {
      setMySubs((subs) => {
        let newSubs = subs;
        if (action === "unsub") {
          newSubs = subs.filter((s) => s?.data?.name !== subInfo?.data?.name);
        } else if (!subs.find((s) => s.data.name === subInfo.data.name)) {
          newSubs = [...subs, subInfo].sort((a, b) =>
            a.data.display_name.localeCompare(b.data.display_name)
          );
        }
        updateLocalStore("subs", [
          ...newSubs.map((f) => ({
            ...f,
            data: { ...trimSubInfo(f.data).data },
          })),
        ]);
        return newSubs;
      });
    }
  };

  const subscribe = async (
    action: "sub" | "unsub",
    subname,
    loggedIn = false
  ) => {
    //console.log("subAPI", action, subname, loggedIn);
    let isUser = subname?.substring(0, 2) == "u_";

    const toastId = toast.custom(
      (t) => (
        <ToastCustom
          t={t}
          message={`${
            isUser
              ? action == "sub"
                ? "Following"
                : "Unfollowing"
              : action == "sub"
              ? "Joining"
              : "Leaving"
          } ${isUser ? subname.substring(2) : subname}`}
          mode={"loading"}
        />
      ),
      { position: "bottom-center" }
    );
    if (session || loggedIn) {
      let sub = subname;
      // let cachedInfo: any = await checkSubCache(sub);
      // if (cachedInfo) {
      //   sub = cachedInfo?.data?.name;
      // } else {
      if (isUser) sub = sub.substring(2);
      let subInfo = await loadSubInfo(isUser ? `u_${sub}` : sub);
      if (isUser) {
        let aboutUser = await loadSubredditInfo({
          query: sub,
          loadUser: isUser,
          isPremium: user.premium?.isPremium,
        });
        aboutUser["data"]["subreddit"] = subInfo.data;
        subInfo = aboutUser;
      }
      subInfo && addToSubCache(subInfo);
      sub = isUser ? subInfo?.data?.subreddit?.name : subInfo?.data?.name;
      //}

      let status = await subToSub({
        action: action,
        name: sub,
        isPremium: user.premium?.isPremium,
      });
      if (status) {
        //loadAllSubs(loggedIn);
        mutateLocalRedditSubs(action, subInfo, isUser);
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`${
                isUser
                  ? action == "sub"
                    ? "Followed"
                    : "Unfollowed"
                  : action == "sub"
                  ? "Joined"
                  : "Left"
              } ${isUser ? subname.substring(2) : subname}`}
              mode={"success"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
        return true;
      } else {
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Error ${
                isUser
                  ? action == "sub"
                    ? "Following"
                    : "Unfollowing"
                  : action == "sub"
                  ? "Joining"
                  : "Leaving"
              } ${isUser ? subname.substring(2) : subname}`}
              mode={"error"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
        // toast.dismiss(toastId);

        return false;
      }
    } else if ((!session && !loading) || !loggedIn) {
      let status = await context.subToSub(action, subname);
      if (status) {
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`${
                isUser
                  ? action == "sub"
                    ? "Followed"
                    : "Unfollowed"
                  : action == "sub"
                  ? "Joined"
                  : "Left"
              } ${isUser ? subname.substring(2) : subname}`}
              mode={"success"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
      } else {
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Error ${
                isUser
                  ? action == "sub"
                    ? "Following"
                    : "Unfollowing"
                  : action == "sub"
                  ? "Joining"
                  : "Leaving"
              } ${isUser ? subname.substring(2) : subname}`}
              mode={"error"}
            />
          ),
          { id: toastId, duration: 1500 }
        );
      }
      return status;
    } else {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Error ${
              isUser
                ? action == "sub"
                  ? "Following"
                  : "Unfollowing"
                : action == "sub"
                ? "Joining"
                : "Leaving"
            } ${isUser ? subname.substring(2) : subname}`}
            mode={"error"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };

  const subscribeAll = async (subs: string[]) => {
    const toastId = toast.custom((t) => (
      <ToastCustom
        t={t}
        message={`Joining ${subs.length} subs`}
        mode={"loading"}
      />
    ));
    let issues = 0;
    for (let sub of subs) {
      if (!session) {
        let status = await context.subToSub("sub", sub);
        if (!status) {
          issues += 1;
        }
      } else if (session) {
        subscribe("sub", sub, true);
      }
    }
    if (issues == 0) {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Joined ${subs.length} subs`}
            mode={"success"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    } else {
      toast.custom(
        (t) => (
          <ToastCustom
            t={t}
            message={`Unable to join ${issues} subs`}
            mode={"error"}
          />
        ),
        { id: toastId, duration: 1500 }
      );
    }
  };

  return (
    <SubsContext.Provider
      value={{
        loadingSubs,
        loadAllFromReddit,
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
        favorite,
        error,
        currSubInfo,
        currLocation,
        currSubs,
        multi,
        tryLoadAll,
        addToSubCache,
      }}
    >
      {children}
    </SubsContext.Provider>
  );
};
