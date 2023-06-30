import Search from "./Search";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import DropdownPane from "./DropdownPane";

import { CgMenu } from "react-icons/cg";
import SideNav from "./SideNav";
import NavMenu from "./NavMenu";
import NavMessage from "./NavMessage";
import { useRouter } from "next/router";
import SortMenu from "./SortMenu";

import { usePlausible } from "next-plausible";
import { useMainContext } from "../MainContext";
import FilterMenu from "./FilterMenu";
import LoginProfile from "./LoginProfile";
import useRefresh from "../hooks/useRefresh";
import useNavBarScrollHelper from "../hooks/useNavBarScrollHelper";
import { useWindowWidth } from "@react-hook/window-size";
import { AiOutlineSearch } from "react-icons/ai";

const NavBar = ({ toggleSideNav = 0 }) => {
  const context: any = useMainContext();
  const { invalidateKey, refreshCurrent, fetchingCount } = useRefresh();
  const plausible = usePlausible();
  const router = useRouter();
  const windowWidth = useWindowWidth();
  const [mounted, setMounted] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [allowHide, setallowHide] = useState(true);
  const [allowShow, setAllowShow] = useState(true);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  //add some delay before navbar can be hidden again.. resolves some issues with immediate hide after navigation
  const [timeSinceNav, setTimeSinceNav] = useState(() => new Date().getTime());

  useNavBarScrollHelper({
    allowHide,
    allowShow,
    setHidden,
    timeSinceNav,
    autoHideNav: context.autoHideNav,
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    toggleSideNav && setSidebarVisible(true);
    return () => {
      setSidebarVisible(false);
    };
  }, [toggleSideNav]);

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
          " z-50 fixed top-0 transition ease-in-out transform  w-screen  " +
          (hidden ? " duration-500" : " duration-200")
        }
      >
        {/* <NavMessage
          hide={router.asPath?.includes("/comments/")}
          timeSinceNav={timeSinceNav}
        /> */}
        <SideNav visible={sidebarVisible} toggle={setSidebarVisible} />
        <nav className="relative flex flex-row items-center flex-grow h-12 shadow-lg bg-th-background2 md:justify-between ">
          <CgMenu
            className="flex-none w-10 h-10 cursor-pointer md:hidden"
            onClick={() => {
              setSidebarVisible((vis) => !vis);
              // plausible("sidenav");
            }}
          />
          <div className="flex flex-row items-center justify-start h-full mr-2 space-x-2">
            <Link href="/" passHref>
              <h1
                className="ml-2 text-2xl align-middle cursor-pointer select-none"
                onClick={homeClick}
              >
                {"troddit"}
              </h1>
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
          <div
            className={
              "flex-none  h-10 transition  duration-200 ease-in-out origin-top md:origin-top-right lg:origin-right " +
              (showSearch
                ? ` absolute top-[3.2rem] w-[90vw]  left-[5vw] md:left-[25vw] md:w-[50vw] lg:relative lg:top-auto lg:left-0  lg:w-[24rem] scale-x-100 `
                : " w-0 absolute lg:scale-x-0 scale-x-0 scale-y-0 lg:scale-y-100 opacity-0 ")
            }
          >
            {showSearch && (
              <Search
                id={"subreddit search main"}
                setShowSearch={windowWidth < 1024 ? setShowSearch : (a) => {}}
              />
            )}
          </div>
          <div className="flex flex-row items-center justify-end h-full py-1.5 ml-auto mr-2 space-x-1 md:ml-2">
            <button
              disabled={mounted && windowWidth > 768}
              aria-label="show search"
              className={
                "flex md:hidden items-center justify-center flex-none w-10 h-full border border-transparent rounded-md outline-none hover:border-th-border "
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowSearch((s) => !s);
              }}
            >
              <AiOutlineSearch className="flex-none w-6 h-6" />
            </button>
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
      <div className={" h-[3.5rem]"}></div>
    </>
  );
};

export default NavBar;
