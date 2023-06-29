import Search from "./Search";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import DropDownItems from "./DropDownItems";
import { Menu } from "@headlessui/react";
import LoginProfile from "./LoginProfile";
import React from "react";

const scrollStyle =
  "scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full";

const SideNav = ({ visible, toggle }) => {
  const { data: session, status } = useSession();
  const [vis, setVis] = useState(false);
  const [touchStart, setTouchStart] = useState([0]);
  const [touchEnd, setTouchEnd] = useState([0]);
  const buttonRef = useRef<HTMLDivElement>(null);
  // const handleTouchStart = (e) => {
  //   touchStart[0] = e.targetTouches[0].clientX;
  // };
  // const handleTouchMove = (e) => {
  //   touchEnd[0] = e.targetTouches[0].clientX;
  // };
  // const handleTouchEnd = (e) => {
  //   if (touchStart[0] - touchEnd[0] > 50) {
  //     //toggle(false);
  //     //console.log("right");
  //   } else if (touchStart[0] - touchEnd[0] < -50) {
  //   }
  // };
  //prevent scrolling on main body when open
  
  useEffect(() => {
    if (visible) {
      const width = document.body.clientWidth;
      document.documentElement.style.setProperty("--overflow", "hidden hidden");
      document.body.style.width = `${width}px`;
    } else {
      document.documentElement.style.setProperty(
        "--overflow",
        "hidden visible"
      );
      document.body.style.width = `auto`;
    }

    return () => {
      document.documentElement.style.setProperty(
        "--overflow",
        "hidden visible"
      );
      document.body.style.width = `auto`;
    };
  }, [visible]);

  //force open menu when visible..
  useEffect(() => {
    buttonRef?.current?.click();
  }, [visible]);
  return (
    <div
    // onTouchStart={(e) => handleTouchStart(e)}
    // onTouchMove={(e) => handleTouchMove(e)}
    // onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <div
        className={
          "absolute h-screen inset-y-0 left-0  space-y-6 z-[99] transition duration-200 ease-in-out transform -translate-x-full sidebar py-7" +
          `${visible ? "relative translate-x-0 w-screen" : ""}`
        }
      >
        <div className="flex flex-row flex-none h-screen overscroll-y-contain">
          <nav className="flex flex-col justify-between flex-grow w-5/6 px-2 pt-4 overflow-hidden border-r rounded-r-lg bg-th-background2 border-th-border ">
            <div className="flex flex-col justify-start w-full h-screen space-y-4 ">
              <div className="flex flex-row items-center justify-between w-full ">
                <div className="">
                  <LoginProfile />
                </div>
                <RiArrowGoBackLine
                  onClick={() => toggle()}
                  className="flex-none w-6 h-6 cursor-pointer "
                />
              </div>
              {/* <div
                className="z-10 flex-none px-2 h-14"
                onBlur={() => buttonRef?.current?.click()}
              >
                <Search id={"Subreddit search side nav"} />
              </div> */}
              <Menu
                as="div"
                className={`h-full px-2 overflow-x-hidden overflow-y-auto outline-none ${scrollStyle}`}

              >
                {({ open }) => (
                  <>
                    <Menu.Button
                      aria-label="open subs"
                      as="div"
                      className={"hidden"}
                      ref={buttonRef}
                    ></Menu.Button>
                    {open ? (
                      <>
                        <Menu.Items
                          as="div"
                          static
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
                        <h1 className="opacity-50 text-th-textLight">
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
