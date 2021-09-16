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

const SideNav = ({ visible, toggle }) => {
  const [session, loading] = useSession();
  return (
    <div>
      <div
        className={
          "absolute h-screen inset-y-0 left-0  space-y-6 z-40 transition duration-200 ease-in-out transform -translate-x-full sidebar py-7" +
          `${visible ? "relative translate-x-0 w-screen" : ""}`
        }
      >
        <div className="flex flex-row flex-none h-screen bg-lightHighlight dark:bg-darkBG">
          <nav className="flex flex-col justify-between flex-grow w-5/6 px-2 overflow-y-auto mt-14 ">
            <div className="flex flex-col justify-start w-full space-y-4 ">
              <div className="flex flex-row justify-end w-full h-full">
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
            {/* <div className="h-14">
              <div className="flex flex-row items-center justify-start flex-grow h-full">
                <div className="flex-none block w-full h-full py-2">
                  <DropdownPane hide={visible} />
                </div>
              </div>
            </div> */}
            <div className="">
              {!session && (
                <>
                  <div></div>
                </>
              )}
              {session && (
                <>
                  <button
                    className="w-full h-full pb-4"
                    onClick={() => signOut()}
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </nav>
          <div
            className="w-1/6 bg-black opacity-80"
            onClick={() => toggle()}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
