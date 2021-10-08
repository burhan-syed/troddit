import axios from "axios";
import { useSession } from "next-auth/client";
import React, { useState, useContext, useEffect } from "react";

export const MainContext: any = React.createContext({});

export const useMainContext = () => {
  return useContext(MainContext);
};

export const MainProvider = ({ children }) => {
  const [nsfw, setNSFW] = useState("false");
  const [loginModal, setLoginModal] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [columns, setColumns] = useState(3);
  const [columnOverride, setColumnOverride] = useState(0);
  const [maximize, setMaximize] = useState(false);
  const [mediaOnly, setMediaOnly] = useState(false);
  const [pauseAll, setPauseAll] = useState(false);

  const toggleMediaOnly = () => {
    setMediaOnly(m => !m);
  }
  
  const toggleMaximize = () => {
    setMaximize(m => !m);
  }

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
    saved_mediaOnly?.includes("true") ? setMediaOnly(true) : setMediaOnly(false);
    const saved_columnOverride = parseInt(localStorage.getItem("columnOverride"));
    saved_columnOverride && setColumnOverride(saved_columnOverride)
  }, []);

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
        toggleMediaOnly,
        pauseAll,
        setPauseAll
      }}
    >
      {children}
    </MainContext.Provider>
  );
};
