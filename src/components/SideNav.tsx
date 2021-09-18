import Login from "./Login";
import NSFWToggle from "./NSFWToggle";
import Sort from "./Sort";
import DropdownPane from "./DropdownPane";
import ThemeToggle from "./ThemeToggle";
import SortMenu2 from "./SortMenu2";
import Search from "./Search";
import SideDropDown from "./SideDropDown";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useSession, signIn, signOut } from "next-auth/client";
import { useEffect } from "react";

const SideNav = ({ visible, toggle }) => {
  const [session, loading] = useSession();
  //prevent scrolling on main body when open
  useEffect(() => {
    if (true) {
      const width = document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.width = `${width}px`;
    } else {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    }

    return () => {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    };
  }, []);
  return (
    <div>
      <div
        className={
          "absolute h-screen inset-y-0 left-0  space-y-6 z-40 transition duration-200 ease-in-out transform -translate-x-full sidebar py-7" +
          `${visible ? "relative translate-x-0 w-screen" : ""}`
        }
      >
        <div className="flex flex-row flex-none h-screen bg-lightHighlight dark:bg-darkBG overscroll-y-contain">
          <nav className="flex flex-col justify-between flex-grow w-5/6 px-2 pt-4 overflow-y-auto border-r rounded-r-lg">
            <div className="flex flex-col justify-start w-full space-y-4 ">
              <div className="flex flex-row items-center justify-between w-full h-full">
                <div className="">
                  {!session && (
                    <>
                      <div></div>
                    </>
                  )}
                  {session && (
                    <>
                      <button
                        className="w-full h-full"
                        onClick={() => signOut()}
                      >
                        Logout
                      </button>
                    </>
                  )}
                </div>
                <RiArrowGoBackLine
                  onClick={() => toggle()}
                  className="flex-none w-6 h-6 cursor-pointer "
                />
              </div>

              <div className="">
                <SideDropDown />
              </div>
              <div className="flex-none px-2 h-14">
                <Search />
              </div>
            </div>
          </nav>
          <div
            className="w-1/6 bg-gray-800 opacity-30"
            onClick={() => toggle()}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
