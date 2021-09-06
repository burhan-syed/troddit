import Search from "./Search";
import { useEffect, useState } from "react";
import Link from "next/link";
import Login from "./Login";
import SubDropDown from "./SubDropDown";
import Sort from "./Sort";
import ThemeToggle from "./ThemeToggle";
import NSFWToggle from "./NSFWToggle";

import { CgMenu } from "react-icons/cg";
import SideNav from "./SideNav";
import NavMenu from "./NavMenu";
import SortMenu from "./SortMenu";

const NavBar = () => {
  const [hidden, setHidden] = useState(false);
  const [prevScrollpos, setScrollpos] = useState(0);

  const [sidebarVisible, setSidebarVisible] = useState(false);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    setScrollpos(window.pageYOffset);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  });

  const onScroll = () => {
    setSidebarVisible(false);
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      setHidden(false);
    } else {
      setHidden(true);
    }
    setScrollpos(currentScrollPos);
  };

  return (
    <header className={`${hidden ? "" : "sticky top-0"}` + "absolute z-50 "}>
      <SideNav visible={sidebarVisible} toggle={setSidebarVisible} />
      <nav className="flex items-center h-12 px-4 py-4 bg-white shadow-md dark:bg-black">
        <CgMenu
          className="md:hidden"
          onClick={() => setSidebarVisible((vis) => !vis)}
        />

        {sidebarVisible ? "visible" : "not vis"}

        <Link href="/" passHref>
          <h1 className="">ReddAll</h1>
        </Link>

        <div className="flex items-center flex-grow p-1 mx-5 text-gray-600 rounded-lg bg-lightgray focus-within:text-gray-600 focus-within:shadow-md md:mx-20">
          <Search />
        </div>
        <div className="hidden md:flex">
          <div className="">
            <SubDropDown />
          </div>
          <SortMenu />
          <Login />
          <NavMenu />
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
