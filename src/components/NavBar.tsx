import Search from "./Search";
import { useEffect, useState } from "react";
import Link from "next/link";
import Login from "./Login";
import SubDropDown from "./SubDropDown";
import Sort from "./Sort";
import ThemeToggle from "./ThemeToggle";
import NSFWToggle from "./NSFWToggle";

const NavBar = () => {
  const [hidden, setHidden] = useState(false);
  const [prevScrollpos, setScrollpos] = useState(0);

  useEffect(() => {
    window.addEventListener("scroll", onScroll);
    setScrollpos(window.pageYOffset);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  });

  const onScroll = () => {
    var currentScrollPos = window.pageYOffset;
    if (prevScrollpos > currentScrollPos) {
      setHidden(false);
    } else {
      setHidden(true);
    }
    setScrollpos(currentScrollPos);
  };

  return (
    <header
      className={
        `${hidden ? "" : "sticky top-0"}` +
        " z-50 h-12 flex items-center bg-white dark:bg-black px-4 py-4 shadow-md"
      }
    >
      <Link href="/" passHref>
        <h1 className="">ReddAll</h1>
      </Link>
      <div className="flex items-center flex-grow p-1 mx-5 text-gray-600 rounded-lg bg-lightgray focus-within:text-gray-600 focus-within:shadow-md md:mx-20">
        <Search />
      </div>
      <div className="">
        <SubDropDown />
      </div>
      <ThemeToggle />
      <NSFWToggle />
      <Sort />
      <Login />
    </header>
  );
};

export default NavBar;
