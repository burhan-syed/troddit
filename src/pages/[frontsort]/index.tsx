import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import Sort from "../../components/Sort";
import Head from "next/head";

const Subs = ({ query }) => {
  const router = useRouter();
  //console.log(query);
  const { frontsort } = router.query;
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

  return (
    <div>
      <Head>
        <title>
          {query?.frontsort ? `troddit · ${query?.frontsort}` : "troddit"}
        </title>
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

Subs.getInitialProps = ({ query }) => {
  return { query };
};

export default Subs;
