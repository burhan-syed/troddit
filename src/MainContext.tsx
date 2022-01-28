import axios from "axios";
import { useSession } from "next-auth/client";
import React, { useState, useContext, useEffect, useReducer } from "react";

export const MainContext: any = React.createContext({});

export const useMainContext = () => {
  return useContext(MainContext);
};

export const MainProvider = ({ children }) => {
  const [nsfw, setNSFW] = useState("false");
  const [loading, setLoading] = useState(false);
  const [loginModal, setLoginModal] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [columns, setColumns] = useState(3);
  const [columnOverride, setColumnOverride] = useState(0);
  const [audioOnHover, setaudioOnHover] = useState(false);
  const [maximize, setMaximize] = useState(false);
  const [mediaOnly, setMediaOnly] = useState(false);
  const [pauseAll, setPauseAll] = useState(false);
  const [cardStyle, setCardStyle] = useState("default");
  const [posts, setPosts] = useState([]);
  const [postNum, setPostNum] = useState(0);
  const [token, setToken] = useState();
  const [forceRefresh, setForceRefresh] = useState(0);
 
  //filters in the inverse sense, true = allowed
  const [imgFilter, setImgFilter] = useState(true)
  const [vidFilter, setVidFilter] = useState(true)
  const [galFilter, setGalFilter] = useState(true)
  const [selfFilter, setSelfFilter] = useState(true)
  const [linkFilter, setLinkFilter] = useState(true);
 // const [filterCount, setFilterCount] = useState(0);

  const toggleFilter = (filter) => {
    switch (filter){
      case 'images':
        setImgFilter(i => !i);
        break;
      case 'videos':
        setVidFilter(v => !v);
        break;
      case 'galleries':
        setGalFilter(g => !g);
        break;
      case 'self':
        setSelfFilter(s => !s);
        break;
      case 'links':
        setLinkFilter(l => !l);
        break;
    }
  };

  useEffect(() => {
    //setFilterCount(0);
    //setForceRefresh(i =>  i +1);

  }, [imgFilter, vidFilter, galFilter, selfFilter, linkFilter])

  const updateLikes = (i, like) => {
    let p = posts;
    if (p?.[i]?.data) {
      p[i].data.likes = like;
    }
    setPosts(p);
  };

  const [localSubs, setLocalSubs] = useState([]);
  const subToSub = async (action, sub) => {
    if (action == "sub") {
      addLocalSub(sub);
      return true;
    } else if (action == "unsub") {
      removeLocalSub(sub);
      return true;
    } else return false;
  };
  const addLocalSub = (sub) => {
    if (!localSubs.includes(sub)) {
      setLocalSubs((p) => [...p, sub]);
    }
  };
  const removeLocalSub = (sub) => {
    setLocalSubs((p) => p.filter((s) => s !== sub));
  };

  const toggleAudioOnHover = () => {
    setaudioOnHover((a) => !a);
  };

  const toggleMediaOnly = () => {
    setMediaOnly((m) => !m);
  };

  const toggleMaximize = () => {
    setMaximize((m) => !m);
  };

  const toggleNSFW = () => {
    setNSFW((prevNSFW) => {
      return prevNSFW === "false" ? "true" : "false";
    });
  };
  const toggleAutoplay = () => {
    setAutoplay((a) => !a);
  };
  const toggleLoginModal = () => {
    setLoginModal((m) => !m);
  };

  useEffect(() => {
    const saved_nsfw = localStorage.getItem("nsfw");
    saved_nsfw?.includes("true") ? setNSFW("true") : setNSFW("false");
    const saved_autoplay = localStorage.getItem("autoplay");
    saved_autoplay?.includes("true") ? setAutoplay(true) : setAutoplay(false);
    const saved_mediaOnly = localStorage.getItem("mediaOnly");
    saved_mediaOnly?.includes("true")
      ? setMediaOnly(true)
      : setMediaOnly(false);
    const saved_audioOnHover = localStorage.getItem("audioOnHover");
    saved_audioOnHover?.includes("true")
      ? setaudioOnHover(true)
      : setaudioOnHover(false);
    const saved_columnOverride = parseInt(
      localStorage.getItem("columnOverride")
    );
    saved_columnOverride && setColumnOverride(saved_columnOverride);
    const saved_cardStyle = localStorage.getItem("cardStyle");
    saved_cardStyle && setCardStyle(saved_cardStyle);
    const local_localSubs = localStorage.getItem("localSubs");
    local_localSubs && setLocalSubs(JSON.parse(local_localSubs));

    const saved_imgFilter = localStorage.getItem("imgFilter");
    saved_imgFilter?.includes("false") ? setImgFilter(false) : setImgFilter(true);
    const saved_vidFilter = localStorage.getItem("vidFilter");
    saved_vidFilter?.includes("false") ? setVidFilter(false) : setVidFilter(true);
    const saved_linkFilter = localStorage.getItem("linkFilter");
    saved_linkFilter?.includes("false") ? setLinkFilter(false) : setLinkFilter(true);
  }, []);

  useEffect(() => {
    localStorage.setItem("imgFilter", JSON.stringify(imgFilter));
  }, [imgFilter])
  useEffect(() => {
    localStorage.setItem("vidFilter", JSON.stringify(vidFilter));
  }, [vidFilter])
  useEffect(() => {
    localStorage.setItem("linkFilter", JSON.stringify(linkFilter));
  }, [linkFilter])

  useEffect(() => {
    localStorage.setItem("localSubs", JSON.stringify(localSubs));
  }, [localSubs]);

  useEffect(() => {
    localStorage.setItem("nsfw", JSON.stringify(nsfw));
  }, [nsfw]);
  useEffect(() => {
    localStorage.setItem("autoplay", JSON.stringify(autoplay));
  }, [autoplay]);
  useEffect(() => {
    localStorage.setItem("columnOverride", JSON.stringify(columnOverride));
  }, [columnOverride]);
  useEffect(() => {
    localStorage.setItem("mediaOnly", JSON.stringify(mediaOnly));
  }, [mediaOnly]);
  useEffect(() => {
    localStorage.setItem("cardStyle", cardStyle);
  }, [cardStyle]);
  useEffect(() => {
    localStorage.setItem("audioOnHover", JSON.stringify(audioOnHover));
  }, [audioOnHover]);

  return (
    <MainContext.Provider
      value={{
        nsfw,
        toggleNSFW,
        loginModal,
        toggleLoginModal,
        setLoginModal,
        autoplay,
        toggleAutoplay,
        columns,
        setColumns,
        maximize,
        toggleMaximize,
        columnOverride,
        setColumnOverride,
        mediaOnly,
        setMediaOnly,
        toggleMediaOnly,
        pauseAll,
        setPauseAll,
        audioOnHover,
        toggleAudioOnHover,
        cardStyle,
        setCardStyle,
        posts,
        setPosts,
        postNum,
        setPostNum,
        localSubs,
        subToSub,
        token,
        setToken,
        updateLikes,
        forceRefresh,
        setForceRefresh,
        loading,
        setLoading,
        toggleFilter,
        imgFilter,
        vidFilter,
        galFilter,
        linkFilter,
        selfFilter,
        //filterCount,
        //setFilterCount
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
