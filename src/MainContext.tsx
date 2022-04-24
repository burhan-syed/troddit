import axios from "axios";
import { useSession } from "next-auth/react";
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
  const [hoverplay, setHoverPlay] = useState(true);
  const [columns, setColumns] = useState(3);
  const [columnOverride, setColumnOverride] = useState(0);
  const [audioOnHover, setaudioOnHover] = useState(false);
  //controls how feed appears, switches to true when in multicolumn mode
  const [wideUI, setWideUI] = useState(true);
  //saves toggle selection. Used to sync UI when switching back to 1 column. Also used to control postModal view
  const [saveWideUI, setSaveWideUI] = useState(true);
  //if posts should also be wide ui/narrow ui
  const [syncWideUI, setSyncWideUI] = useState(true);
  const [postWideUI, setPostWideUI] = useState(true);

  const [mediaOnly, setMediaOnly] = useState(false);
  const [pauseAll, setPauseAll] = useState(false);
  const [cardStyle, setCardStyle] = useState("default");
  const [posts, setPosts] = useState([]);
  const [postNum, setPostNum] = useState(0);
  const [gAfter, setGAfter] = useState("");
  const [token, setToken] = useState();
  const [forceRefresh, setForceRefresh] = useState(0);
  const [fastRefresh, setFastRefresh] = useState(0);
  //toggle for type of posts to show in saved screen
  const [userPostType, setUserPostType] = useState("links");
  const toggleUserPostType = () => {
    setUserPostType((p) => {
      if (p === "links") return "comments";
      return "links";
    });
  };

  const [readPosts, setReadPosts] = useState({});
  const addReadPost = (postid) => {
    setReadPosts((read) => {
      if (Object.keys(read).length < 1000) {
        read[postid] = 1;
        localStorage.setItem("readPosts", JSON.stringify(read));
        return read;
      }
      //resetting object if space becomes too large
      let newread = {};
      newread[postid] = 1;
      localStorage.setItem("readPosts", JSON.stringify(newread));
      return newread;
    });
  };
  const toggleReadPost = (postid) => {
    setReadPosts((read) => {
      if (read?.[postid] == 1) {
        delete read[postid];
      } else {
        read[postid] = 1;
      }
      localStorage.setItem("readPosts", JSON.stringify(read));
      return read;
    });
  };

  //filters in the inverse sense, true = allowed
  const [readFilter, setReadFilter] = useState(true);
  const [imgFilter, setImgFilter] = useState(true);
  const [vidFilter, setVidFilter] = useState(true);
  const [galFilter, setGalFilter] = useState(true);
  const [selfFilter, setSelfFilter] = useState(true);
  const [linkFilter, setLinkFilter] = useState(true);
  // const [filterCount, setFilterCount] = useState(0);
  //advanced filters
  //'img' filters also apply to reddit videos since those have known res as well..
  const [imgPortraitFilter, setImgPortraitFilter] = useState(true);
  const [imgLandscapeFilter, setImgLandScapeFilter] = useState(true);
  const [imgResFilter, setImgResFilter] = useState(false);
  const [imgResXFilter, setImgResXFilter] = useState(0);
  const [imgResYFilter, setImgResYFilter] = useState(0);
  const [imgResExactFilter, setImgResExactFilter] = useState(false);
  const [scoreFilter, setScoreFilter] = useState(false);
  const [scoreFilterNum, setScoreFilterNum] = useState();
  const [scoreGreater, setScoreGreater] = useState(true);

  const [replyFocus, setReplyFocus] = useState(false);

  const toggleFilter = (filter) => {
    switch (filter) {
      case "read":
        setReadFilter((r) => !r);
        break;
      case "images":
        //toggle off orientation filters if no videos and images
        if (imgFilter === true && vidFilter === false) {
          setImgPortraitFilter(false);
          setImgLandScapeFilter(false);
        }
        //toggle orientation filters on automatically if enabling images
        if (
          imgFilter === false &&
          vidFilter === false &&
          imgPortraitFilter === false &&
          imgLandscapeFilter === false
        ) {
          setImgPortraitFilter(true);
          setImgLandScapeFilter(true);
        }
        setImgFilter((i) => !i);
        break;
      case "videos":
        //toggle off orientation filters if no videos and images
        if (imgFilter === false && vidFilter === true) {
          setImgPortraitFilter(false);
          setImgLandScapeFilter(false);
        }
        //toggle orientation filter on automatically if enabling videos
        if (
          vidFilter === false &&
          imgFilter === false &&
          imgPortraitFilter === false &&
          imgLandscapeFilter === false
        ) {
          setImgPortraitFilter(true);
          setImgLandScapeFilter(true);
        }
        setVidFilter((v) => !v);
        break;
      case "galleries":
        setGalFilter((g) => !g);
        break;
      case "self":
        setSelfFilter((s) => !s);
        break;
      case "links":
        setLinkFilter((l) => !l);
        break;
      case "score":
        setScoreFilter((s) => !s);
        break;
      case "portrait":
        //if orientation toggled on and video+images toggled off, toggle them on
        if (
          imgPortraitFilter === false &&
          imgFilter === false &&
          vidFilter === false
        ) {
          setImgFilter(true);
          setVidFilter(true);
        }
        //if both orientations toggled off, also toggle off image/video filter
        if (imgPortraitFilter === true && imgLandscapeFilter === false) {
          setImgFilter(false);
          setVidFilter(false);
        }
        setImgPortraitFilter((p) => !p);
        break;
      case "landscape":
        //if orientation toggled on and video+images toggled off, toggle them on
        if (
          imgLandscapeFilter === false &&
          imgFilter === false &&
          vidFilter === false
        ) {
          setImgFilter(true);
          setVidFilter(true);
        }
        //if both orientations toggled off, also toggle off image/video filter
        if (imgLandscapeFilter === true && imgPortraitFilter === false) {
          setImgFilter(false);
          setVidFilter(false);
        }
        setImgLandScapeFilter((l) => !l);
        break;
    }
  };

  // useEffect(() => {
  //   //setFilterCount(0);
  //   //setForceRefresh(i =>  i +1);

  // }, [imgFilter, vidFilter, galFilter, selfFilter, linkFilter])

  const updateLikes = (i, like) => {
    if (posts?.[i]?.data) {
      setPosts((p) => {
        p[i].data.likes = like;
        return p;
      });
    }
  };

  const updateSaves = (i, save) => {
    if (posts?.[i]?.data) {
      setPosts((p) => {
        p[i].data.saved = save;
        return p;
      });
    }
  };
  const updateHidden = (i, hidden) => {
    let p = posts;
    if (p?.[i]?.data) {
      setPosts((p) => {
        p[i].data.hidden = hidden;
        return p;
      });
    }
  };

  const [localSubs, setLocalSubs] = useState([]);
  const subToSub = async (action, sub) => {
    if (action == "sub") {
      return await addLocalSub(sub);
    } else if (action == "unsub") {
      return await removeLocalSub(sub);
    } else return false;
  };
  const addLocalSub = async (sub) => {
    let found = localSubs.find((s) => s?.toUpperCase() === sub?.toUpperCase());
    if (!found) {
      setLocalSubs((p) => [...p, sub]);
    }
    return true;
  };
  const removeLocalSub = async (sub) => {
    setLocalSubs((p) =>
      p.filter((s) => s?.toUpperCase() !== sub?.toUpperCase())
    );
    return true;
  };

  const toggleAudioOnHover = () => {
    setaudioOnHover((a) => !a);
  };

  const toggleMediaOnly = () => {
    setMediaOnly((m) => !m);
  };

  //syncs wideui and savedwide ui
  const toggleWideUI = () => {
    setSaveWideUI((w) => {
      setWideUI(!w);
      //syncWideUI &&
      setPostWideUI(!w);
      return !w;
    });
  };
  //to force refresh feed so width set properly when in one column mode
  useEffect(() => {
    cardStyle !== "row1" &&
      columnOverride === 1 &&
      setFastRefresh((f) => f + 1);
  }, [wideUI]);

  const toggleNSFW = () => {
    setNSFW((prevNSFW) => {
      return prevNSFW === "false" ? "true" : "false";
    });
  };
  const toggleHoverPlay = () => {
    setHoverPlay((a) => !a);
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
    const saved_hoverplay = localStorage.getItem("hoverplay");
    saved_hoverplay?.includes("true")
      ? setHoverPlay(true)
      : setHoverPlay(false);
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
    const saved_saveWideUI = localStorage.getItem("saveWideUI");
    saved_saveWideUI?.includes("false")
      ? setSaveWideUI(false)
      : setSaveWideUI(true);
    const saved_syncWideUI = localStorage.getItem("syncWideUI");
    saved_syncWideUI?.includes("false")
      ? setSyncWideUI(false)
      : setSyncWideUI(true);
    const saved_postWideUI = localStorage.getItem("postWideUI");
    saved_postWideUI?.includes("false")
      ? setPostWideUI(false)
      : setPostWideUI(true);

    const saved_wideUI = localStorage.getItem("wideUI");
    saved_wideUI?.includes("false") ? setWideUI(false) : setWideUI(true);
    saved_columnOverride && setColumnOverride(saved_columnOverride);
    const saved_cardStyle = localStorage.getItem("cardStyle");
    saved_cardStyle && setCardStyle(saved_cardStyle);

    const local_localSubs = localStorage.getItem("localSubs");
    local_localSubs && setLocalSubs(JSON.parse(local_localSubs));

    const saved_imgFilter = localStorage.getItem("imgFilter");
    saved_imgFilter?.includes("false")
      ? setImgFilter(false)
      : setImgFilter(true);
    const saved_imgPortraitFilter = localStorage.getItem("imgPortraitFilter");
    saved_imgPortraitFilter?.includes("false")
      ? setImgPortraitFilter(false)
      : setImgPortraitFilter(true);
    const saved_imgLandscapeFilter = localStorage.getItem("imgLandscapeFilter");
    saved_imgFilter?.includes("false")
      ? setImgLandScapeFilter(false)
      : setImgLandScapeFilter(true);
    const saved_vidFilter = localStorage.getItem("vidFilter");
    saved_vidFilter?.includes("false")
      ? setVidFilter(false)
      : setVidFilter(true);
    const saved_linkFilter = localStorage.getItem("linkFilter");
    saved_linkFilter?.includes("false")
      ? setLinkFilter(false)
      : setLinkFilter(true);
    const saved_selfFilter = localStorage.getItem("selfFilter");
    saved_selfFilter?.includes("false")
      ? setSelfFilter(false)
      : setSelfFilter(true);
    const saved_readFilter = localStorage.getItem("readFilter");
    saved_readFilter?.includes("false")
      ? setReadFilter(false)
      : setReadFilter(true);
    const saved_readPosts = localStorage.getItem("readPosts");
    saved_readPosts && setReadPosts(JSON.parse(saved_readPosts));
  }, []);
  useEffect(() => {
    localStorage.setItem("readFilter", JSON.stringify(readFilter));
  }, [readFilter]);
  useEffect(() => {
    localStorage.setItem("imgFilter", JSON.stringify(imgFilter));
  }, [imgFilter]);
  useEffect(() => {
    localStorage.setItem(
      "imgPortraitFilter",
      JSON.stringify(imgPortraitFilter)
    );
  }, [imgPortraitFilter]);
  useEffect(() => {
    localStorage.setItem(
      "imgLandscapeFilter",
      JSON.stringify(imgLandscapeFilter)
    );
  }, [imgLandscapeFilter]);
  useEffect(() => {
    localStorage.setItem("vidFilter", JSON.stringify(vidFilter));
  }, [vidFilter]);
  useEffect(() => {
    localStorage.setItem("linkFilter", JSON.stringify(linkFilter));
  }, [linkFilter]);
  useEffect(() => {
    localStorage.setItem("selfFilter", JSON.stringify(selfFilter));
  }, [selfFilter]);

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
    localStorage.setItem("hoverplay", JSON.stringify(hoverplay));
  }, [hoverplay]);
  useEffect(() => {
    localStorage.setItem("columnOverride", JSON.stringify(columnOverride));
  }, [columnOverride]);
  useEffect(() => {
    localStorage.setItem("saveWideUI", JSON.stringify(saveWideUI));
  }, [saveWideUI]);
  useEffect(() => {
    localStorage.setItem("syncWideUI", JSON.stringify(syncWideUI));
  }, [syncWideUI]);
  useEffect(() => {
    localStorage.setItem("postWideUI", JSON.stringify(postWideUI));
  }, [postWideUI]);
  useEffect(() => {
    localStorage.setItem("wideUI", JSON.stringify(wideUI));
  }, [wideUI]);
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
        hoverplay,
        toggleHoverPlay,
        columns,
        setColumns,
        wideUI,
        syncWideUI,
        postWideUI,
        setPostWideUI,
        setSyncWideUI,
        saveWideUI,
        toggleWideUI,
        setWideUI,
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
        gAfter,
        setGAfter,
        postNum,
        setPostNum,
        localSubs,
        subToSub,
        token,
        setToken,
        updateLikes,
        updateSaves,
        updateHidden,
        forceRefresh,
        setForceRefresh,
        fastRefresh,
        setFastRefresh,
        loading,
        setLoading,
        toggleFilter,
        readFilter,
        imgFilter,
        vidFilter,
        galFilter,
        linkFilter,
        selfFilter,
        imgResExactFilter,
        imgResFilter,
        imgLandscapeFilter,
        imgPortraitFilter,
        imgResXFilter,
        imgResYFilter,
        scoreFilter,
        scoreGreater,
        scoreFilterNum,
        replyFocus,
        setReplyFocus,
        userPostType,
        toggleUserPostType,
        readPosts,
        addReadPost,
        toggleReadPost,
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
