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
    window.addEventListener("scroll", onScroll);
    setScrollpos(window.pageYOffset);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [prevScrollpos]);

  return (
    <header
      className={
        `${hidden ? "-translate-y-full" : ""}` +
        " z-50 sticky top-0 transition duration-500 ease-in-out transform h-12 border w-screen  border-blue-300"
      }
    >
      <SideNav visible={sidebarVisible} toggle={setSidebarVisible} />
      <nav className="flex flex-row items-center justify-between h-full bg-white border border-green-400 shadow-md dark:bg-black">
        <CgMenu
          className="md:hidden"
          onClick={() => setSidebarVisible((vis) => !vis)}
        />

        <Link href="/" passHref>
          <h1 className="">ReddAll</h1>
        </Link>

        <div className="h-full border border-black rounded-lg w-80">
          <SubDropDown hide={hidden} />
        </div>

        <div className="flex items-center text-gray-600 border border-black h-fullw-1/3 bg-lightgray focus-within:text-gray-600 focus-within:shadow-md md:mx-20">
          <Search />
        </div>
        <div className="items-center justify-end hidden h-full space-x-2 border border-red-300 w-80 md:flex">
          <div className="w-20 h-full">
            <SortMenu hide={hidden} />
          </div>
          <div className="w-20 h-full border border-green-400">
            <Login />
          </div>
          <div className="w-5 h-full">
            <NavMenu hide={hidden}/>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default NavBar;
