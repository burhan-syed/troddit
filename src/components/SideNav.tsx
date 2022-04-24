import Login from "./Login";
import DropdownPane from "./DropdownPane";
import SortMenu from "./SortMenu";
import Search from "./Search";
import SideDropDown from "./SideDropDown";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import DropDownItems from "./DropDownItems";
import { Menu } from "@headlessui/react";
import LoginProfile from "./LoginProfile";

const SideNav = ({ visible, toggle }) => {
  const { data: session, status } = useSession();
  const [vis, setVis] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const buttonRef = useRef(null);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStart - touchEnd > 50) {
      //toggle(false);
      //console.log("right");
    } else if (touchStart - touchEnd < -50) {
    }
  };
  //prevent scrolling on main body when open
  useEffect(() => {
    if (visible) {
      setVis(true);
      const width = document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.width = `${width}px`;
    } else {
      setVis(false);
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    }

    return () => {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    };
  }, [visible]);

  //force open menu when visible..
  useEffect(() => {
    buttonRef?.current?.click();
  }, [visible]);
  return (
    <div
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchMove={(e) => handleTouchMove(e)}
      onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <div
        className={
          "absolute h-screen inset-y-0 left-0  space-y-6 z-40 transition duration-200 ease-in-out transform -translate-x-full sidebar py-7" +
          `${visible ? "relative translate-x-0 w-screen" : ""}`
        }
      >
        <div className="flex flex-row flex-none h-screen overscroll-y-contain">
          <nav className="flex flex-col justify-between flex-grow w-5/6 px-2 pt-4 overflow-hidden border-r rounded-r-lg bg-lightHighlight dark:bg-darkBG ">
            <div className="flex flex-col justify-start w-full h-screen space-y-4 ">
              <div className="flex flex-row items-center justify-between w-full ">
                <div className="">
                  {/* {!session && (
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
                  )} */}
                  <LoginProfile />
                </div>
                <RiArrowGoBackLine
                  onClick={() => toggle()}
                  className="flex-none w-6 h-6 cursor-pointer "
                />
              </div>
              <div
                className="z-10 flex-none px-2 h-14"
                onBlur={() => buttonRef?.current?.click()}
              >
                <Search id={"Subreddit search side nav"} />
              </div>
              <Menu
                as="div"
                className="h-full px-2 overflow-x-hidden overflow-y-scroll outline-none "
              >
                {({ open }) => (
                  <>
                    {/* <SideDropDown visible={vis} /> */}
                    <Menu.Button
                      as="div"
                      className={"hidden"}
                      ref={buttonRef}
                    ></Menu.Button>
                    {open ? (
                      <>
                        <Menu.Items
                          as="div"
                          className="pb-10 outline-none"
                          onClick={() => toggle()}
                        >
                          <DropDownItems show={vis} hideExtra={true} />
                        </Menu.Items>
                      </>
                    ) : (
                      <div
                        className="flex items-center justify-center h-full select-none"
                        onClick={() => buttonRef?.current?.click()}
                      >
                        <h1 className="text-gray-400 dark:text-gray-500">
                          (click for subs)
                        </h1>
                      </div>
                    )}
                  </>
                )}
              </Menu>
            </div>
          </nav>
          <div
            className="w-1/6 bg-gray-800 opacity-30"
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
