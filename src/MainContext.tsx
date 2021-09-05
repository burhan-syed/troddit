import axios from "axios";
import { useSession } from "next-auth/client";
import React, { useState, useContext, useEffect } from "react";

export const MainContext: any = React.createContext({});

export const useMainContext = () => {
  return useContext(MainContext);
};

export const MainProvider = ({ children }) => {
  const [nsfw, setNSFW] = useState(true);

  const toggleNSFW = () => {
    setNSFW((prevNSFW) => !prevNSFW);
  };

  return (
    <MainContext.Provider value={{ nsfw, toggleNSFW }}>
      {children}
    </MainContext.Provider>
  );
};
