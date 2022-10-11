import Search from "./Search";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Login from "./Login";
import DropdownPane from "./DropdownPane";

import { CgMenu } from "react-icons/cg";
import SideNav from "./SideNav";
import NavMenu from "./NavMenu";

import { useRouter } from "next/router";
import SortMenu from "./SortMenu";

import { useSession } from "next-auth/react";
import { useScroll } from "../hooks/useScroll";

import { usePlausible } from "next-plausible";
import { useMainContext } from "../MainContext";
import FilterMenu from "./FilterMenu";
import LoginProfile from "./LoginProfile";
import useRefresh from "../hooks/useRefresh";

const NavBar = ({ toggleSideNav = 0 }) => {
  const context: any = useMainContext();
  const { invalidateKey, refreshCurrent, fetchingCount } = useRefresh();
  const plausible = usePlausible();
  const router = useRouter();

  const [hidden, setHidden] = useState(false);
  const [allowHide, setallowHide] = useState(true);
  const [allowShow, setAllowShow] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  //add some delay before navbar can be hidden again.. resolves some issues with immediate hide after navigation
  const [timeSinceNav, setTimeSinceNav] = useState(() => new Date().getTime());
  const { scrollY, scrollDirection } = useScroll();

  useEffect(() => {
    toggleSideNav && setSidebarVisible(true);
    return () => {
      setSidebarVisible(false);
    };
  }, [toggleSideNav]);
  useEffect(() => {
      const now = new Date().getTime();
      if (allowHide && now > timeSinceNav + 1000) {
        if (scrollDirection === "down" || (!scrollY && allowShow)) {
          setHidden(false);
        } else if (scrollY && scrollY > 300 && scrollDirection === "up") {
          setHidden(true);
        } else if ((!scrollY || scrollY <= 300) && allowShow) {
          setHidden(false);
        }
      } else {
        if (allowShow) {
          setHidden(false);
        }
      }
  }, [scrollDirection, allowHide, scrollY]);

  useEffect(() => {
    setTimeSinceNav(() => new Date().getTime());
    if (router.pathname === "/download") {
      setHidden(true);
      setAllowShow(false);
    } else {
      if (!context?.mediaMode) {
        setAllowShow(true);
        setHidden(false);
        if (
          router.asPath?.includes("/comments/") ||
          router.asPath?.includes("/about") ||
          router.asPath?.includes("/settings") ||
          router.asPath?.includes("/changelog") ||
          router.asPath?.includes("/subreddits")
        ) {
          setallowHide(false);
        } else {
          setallowHide(true);
        }
      }
    }

    return () => {
      //setallowHide(true);
    };
  }, [router]);
  
  useEffect(() => {
    if (context.mediaMode) {
      setTimeSinceNav(() => new Date().getTime());
      setHidden(true);
      setallowHide(true);
      setAllowShow(false);
    } else if (
      context?.mediaMode === false &&
      router.pathname !== "/download"
    ) {
      setHidden(false);
      setAllowShow(true);
    } else if (router.pathname !== "/download") {
      setAllowShow(true);
    }
  }, [context.mediaMode]);

  useEffect(() => {
    const updateMousePosition = (ev) => {
      //console.log({ x: ev.clientX, y: ev.clientY });
      if (allowShow && ev.clientY < 100) {
        setHidden(false);
      }
    };
    window.addEventListener("mousemove", updateMousePosition);
    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
    };
  }, [allowShow]);  

  const homeClick = () => {
    router?.route === "/" && invalidateKey(["feed", "HOME"], false); // setForceRefresh((p) => p + 1);
  };

  return (
    <>
      <header
        className={
          `${hidden ? "-translate-y-full" : " translate-y-0 "}` +
          " z-50 fixed top-0 transition ease-in-out transform h-12 w-screen  " +
          (hidden ? " duration-500" : " duration-0")
        }
      >
        <SideNav visible={sidebarVisible} toggle={setSidebarVisible} />
        <nav className="flex flex-row items-center flex-grow h-full shadow-lg bg-th-background2 md:justify-between ">
          <CgMenu
            className="w-10 h-10 cursor-pointer md:hidden"
            onClick={() => {
              setSidebarVisible((vis) => !vis);
              // plausible("sidenav");
            }}
          />
          <div className="flex flex-row items-center justify-start h-full mr-2 space-x-2">
            <Link href="/" passHref>
              <a>
                <h1
                  className="ml-2 text-2xl align-middle cursor-pointer select-none"
                  onClick={homeClick}
                >
                  {"troddit"}
                </h1>
              </a>
            </Link>

            <div
              className="flex-none hidden h-full py-1.5 md:block w-60"
              onClick={() => plausible("dropdownPane")}
            >
              <DropdownPane hide={hidden} />
            </div>
          </div>
          <div className="hidden w-full h-full py-1.5 max-w-5xl md:block">
            <Search id={"subreddit search main"} />
          </div>
          <div className="flex flex-row items-center justify-end h-full py-1.5 ml-auto mr-2 space-x-1 md:ml-2">
            <div className="w-20 h-full">
              <SortMenu hide={hidden} />
            </div>
            <div
              className="flex flex-row items-center w-10 h-full mr-2 "
              onClick={() => plausible("filters")}
            >
              <FilterMenu hide={hidden} />
            </div>
            <div
              className={
                "hidden w-20 h-full border  hover:border-th-border border-transparent rounded-md md:block"
              }
              //onClick={() => plausible("login")}
            >
              <LoginProfile />
            </div>

            <div
              className="flex flex-row items-center w-10 h-full mr-2 "
              onClick={() => plausible("options")}
            >
              <NavMenu hide={hidden} />
            </div>
          </div>
        </nav>
        {fetchingCount > 0 && (
          <div className="relative">
            <div className="absolute top-0 z-40 w-screen h-1 bg-th-accent animate-pulse"></div>
            <div className="absolute top-0 z-30 w-screen h-1 bg-th-base"></div>
          </div>
        )}
      </header>
    </>
  );
};

export default NavBar;
