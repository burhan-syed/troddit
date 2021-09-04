import Search from "./Search";
import { useEffect, useState } from "react";
import Link from "next/link";
import Login from "./Login";
import SubDropDown from "./SubDropDown";
import Sort from "./Sort";

const NavBar = () => {
  const [hidden, setHidden] = useState("");
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
      setHidden("");
    } else {
      setHidden("hidden");
    }
    setScrollpos(currentScrollPos);
  };

  return (
    <header 
    >
      <header className={`sticky top-0 z-50 h-20 flex items-center px-4 py-4 shadow-md `}>
        <Link href="/" passHref><h1 className="">ReddAll</h1></Link>
        <div className="flex items-center flex-grow p-2 mx-5 text-gray-600 rounded-lg bg-blue focus-within:text-gray-600 focus-within:shadow-md md:mx-20">
          <Search />
        </div>
        <div className="">
          <SubDropDown />
        </div>
        <Login />
      </header>
      <Sort/>
    </header>
  );
};

export default NavBar;
