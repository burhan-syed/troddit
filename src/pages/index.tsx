/* eslint-disable react-hooks/rules-of-hooks */
import axios from "axios";
import Head from "next/head";

import Feed from "../components/Feed";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";

export const index = ({ query }) => {
  const [toggleSideNav, setToggleSideNav] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStart - touchEnd > 200) {
      //console.log("right");
    } else if (touchStart - touchEnd < -200) {
      setToggleSideNav((p) => p + 1);
      //console.log("left");
    }
  };
  useEffect(() => {
    //toggleSideNav && setToggleSideNav(false);
    return () => {};
  }, [toggleSideNav]);

  return (
    <div className="overflow-x-hidden ">
      <Head>
        <title>troddit · a web client for Reddit </title>
        <meta
          name="description"
          content="Browse Reddit better with Troddit. Grid views, single column mode, galleries, and a number of post styles. Login with Reddit to see your own subs, vote, and comment. Open source."
        ></meta>
      </Head>
      <main
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => handleTouchMove(e)}
        onTouchEnd={(e) => handleTouchEnd(e)}
      >
        <NavBar toggleSideNav={toggleSideNav} />
        <Feed query={query} />
      </main>
    </div>
  );
};
index.getInitialProps = ({ query }) => {
  if (Object.keys(query).length === 0) {
    query = {
      frontsort: "hot",
    };
  }
  return { query };
};

export default index;
