import Search from "./Search";
import { useEffect, useState } from "react";
import Link from "next/link";
import Login from "./Login";
import DropdownPane from "./DropdownPane";
import Sort from "./Sort";

import { CgMenu } from "react-icons/cg";
import SideNav from "./SideNav";
import NavMenu from "./NavMenu";
import SortMenu from "./SortMenu";

import { useRouter } from "next/router";
import SortMenu2 from "./SortMenu2";

import { useSession } from "next-auth/client";
import { useScroll } from "../hooks/useScroll";

import { usePlausible } from "next-plausible";
import { useMainContext } from "../MainContext";

const NavBar = ({ toggleSideNav = 0 }) => {
  const context: any = useMainContext();
  const { setForceRefresh } = context;
  const [hidden, setHidden] = useState(false);
  const [allowHide, setallowHide] = useState(true);
  const session = useSession();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const router = useRouter();
  const [prevScrollpos, setScrollpos] = useState(0);
  const plausible = usePlausible();

  const { scrollY, scrollX, scrollDirection } = useScroll();
  useEffect(() => {
    toggleSideNav && setSidebarVisible(true);
    return () => {
      setSidebarVisible(false);
    };
  }, [toggleSideNav]);
  useEffect(() => {
    if (allowHide && !context?.loading) {
      //console.log(scrollDirection, scrollY);
      if (scrollDirection === "down") {
        setHidden(false);
      } else if (scrollY > 300 && scrollDirection === "up" && !hidden) {
        setHidden(true);
      } else if (scrollY <= 300) {
        setHidden(false);
      }
    } else {
      hidden && setHidden(false);
    }
  }, [scrollDirection, allowHide, scrollY]);

  const forceShow = () => {
    if (hidden) {
      //console.log("forceshow");

      setHidden(false);
    }
  };

  useEffect(() => {
    forceShow();
    if (
      router.query?.slug?.[1] === "comments" ||
      router.pathname.includes("/about")
    ) {
      setallowHide(false);
    } else {
      setallowHide(true);
    }
    return () => {
      //setallowHide(true);
    };
  }, [router]);

  const homeClick = () => {
    router?.route === "/" && setForceRefresh((p) => p + 1);
  };

  return (
    <>
      <header
        className={
          `${hidden ? "-translate-y-full" : ""}` +
          " z-50 fixed top-0 transition duration-500 ease-in-out transform h-14 w-screen "
        }
      >
        <SideNav visible={sidebarVisible} toggle={setSidebarVisible} />
        <nav className="flex flex-row items-center justify-between flex-grow h-full bg-white shadow-lg dark:bg-trueGray-900">
          <CgMenu
            className="w-10 h-10 cursor-pointer md:hidden"
            onClick={() => {
              setSidebarVisible((vis) => !vis);
              plausible("sidenav");
            }}
          />
          <div className="flex flex-row items-center justify-start flex-grow h-full space-x-2 ">
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
              className="flex-none hidden h-full py-2 md:block w-60"
              onClick={() => plausible("dropdownPane")}
            >
              <DropdownPane hide={hidden} />
            </div>

            <div className="hidden w-full h-full py-2 md:block">
              <Search id={"subreddit search main"} />
            </div>
          </div>
          <div className="flex flex-row items-center justify-end h-full py-2 ml-2 space-x-1 justify-self-end">
            <div className="w-20 h-full">
              <SortMenu2 hide={hidden} />
            </div>
            <div
              className={
                !session
                  ? "hidden"
                  : "hidden w-20 h-full border border-white dark:hover:border-darkBorder hover:border-lightBorder dark:border-darkBG rounded-md md:block"
              }
              onClick={() => plausible("login")}
            >
              <Login />
            </div>
            <div
              className="flex flex-row items-center w-10 h-full mr-2 "
              onClick={() => plausible("options")}
            >
              <NavMenu hide={hidden} />
            </div>
          </div>
        </nav>
      </header>
      <div
        onMouseOver={(e) => forceShow()}
        className="fixed top-0 z-40 w-full bg-transparent h-14 opacity-10 "
      ></div>
    </>
  );
};

export default NavBar;
