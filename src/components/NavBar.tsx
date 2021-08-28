import Search from "./Search";
import { useEffect, useState } from "react";
import Login from "./Login";
import SubDropDown from "./SubDropDown";
const NavBar = ({ accessToken }) => {
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
      className={`sticky top-0 z-50 flex items-center ${hidden} px-4 py-4 bg-white shadow-md`}
    >
      <h1>ReddAll</h1>
      <div className="flex items-center flex-grow px-5 py-2 mx-5 text-gray-600 bg-gray-100 rounded-lg focus-within:text-gray-600 focus-within:shadow-md md:mx-20">
        <Search accessToken={accessToken} />
      </div>
      <div>
        <SubDropDown accessToken={accessToken} />
      </div>
      <Login />
    </header>
  );
};

export default NavBar;
