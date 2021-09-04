import axios from "axios";
import { useSession } from "next-auth/client";
import React, { useState, useContext, useEffect } from "react";

const getToken = async () => {
  try {
    let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
    console.log("tokendata:", tokendata);
    return {
      accessToken: tokendata.data.accessToken,
      refreshToken: tokendata.data.refreshToken,
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const MainContext: any = React.createContext({});

export const useMainContext = () => {
  return useContext(MainContext);
};

export const MainProvider = ({ children }) => {
  const [darkTheme, setDarkTheme] = useState(true);

  const [token, setToken] = useState({});

  const [session, loading] = useSession();

  useEffect(() => {
    //updateToken();
    return () => {
      setToken(undefined);
    };
  }, [session]);

  const updateToken = async () => {
    //const t = await getToken();
    //setToken(t);
  };

  const toggleTheme = () => {
    setDarkTheme((prevDarkTheme) => !prevDarkTheme);
  };

  return (
    <MainContext.Provider value={{ darkTheme, toggleTheme, token, session }}>
      {children}
    </MainContext.Provider>
  );
};
