import React, { Fragment, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import Link from "next/link";
import { useMainContext } from "../MainContext";
import Toggles from "./settings/Toggles";
import { useWindowWidth } from "@react-hook/window-size/throttled";
import { useTAuth } from "../PremiumAuthContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const subOptionStyle =
  "px-4 py-3 text-sm hover:bg-th-highlight  cursor-pointer";

const NavMenu = ({ hide = false }) => {
  const {isSignedIn, signOut} = useTAuth(); 
  const context: any = useMainContext();
  const [touched, setTouched] = useState(false);
  const windowWidth = useWindowWidth(); 
  //need to reset wideUI so multi-column (narrow UI doesn't make sense with >1 column) displays properly.
  //Refreshes feed to fix alignment when switching to 1 column and in narrow UI mode
  //Also refreshes feed in mainContext with a useEffect when wideUI is changed if in 1 column mode
  const setColumnCount = (count) => {
    if (count !== context.columnOverride) {
      //if narrow and switching from 1 column force refresh and set to not narrow so feed displays properly
      if (!context.wideUI && context.columnOverride === 1) {
        context.setWideUI((w) => !w);
        //also force a refresh here to rerender feed
        context.setFastRefresh((n) => n + 1);
      }

      //if switching to 1 column and in narrow mode, refresh feed
      else if (count === 1) {
        if (context.wideUI === context.saveWideUI && !context.saveWideUI) {
          context.setFastRefresh((n) => n + 1);
        }
        //otherwise if not in narrow mode just reset the ui
        else {
          context.setWideUI(context.saveWideUI);
        }
      }
      //can't render rows in multi column, fallback to original card
      if (count > 1 && context.cardStyle === "row1") {
        setCardStyle("default");
      }
      //actually change the column count
      context.setColumnOverride(count);
    }
  };

  const setCardStyle = (style) => {
    if (style !== context.cardStyle) {
      //row mode switching to one column, sync wideui
      if (style === "row1") {
        context.setWideUI(context.saveWideUI);
      }
      //when switching to/from row style in narrow mode need to refresh to render properly
      if (
        !context.wideUI &&
        (context.cardStyle === "row1" || style === "row1")
      ) {
        context.setFastRefresh((f) => f + 1);
      }
      context.setCardStyle(style);
    }
  };
  const columnMenuRef = useRef<HTMLButtonElement>(null);
  const cardStyleRef = useRef<HTMLButtonElement>(null);

  return <>
    <Menu
      as="div"
      className="relative flex flex-col items-center flex-grow w-full h-full select-none"
    >
      <div className="flex-grow w-full">
        <Menu.Button
          aria-label="options"
          title={"options"}
          name="Options"
          className="flex flex-row items-center justify-center w-full h-full border border-transparent rounded-md hover:border-th-border focus:outline-none"
        >
          <BsThreeDotsVertical className="flex-none w-5 h-5" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={
            "absolute right-0 w-40 mt-10 origin-top-right bg-th-background2 rounded-md shadow-lg focus:outline-none border border-th-border ring-1 ring-th-base ring-opacity-5 z-50  " +
            (hide && " hidden")
          }
        >
          <div className="py-1">
            <Menu.Item>
              {({ active }) => (
                <div className="group">
                  <div
                    className={classNames(
                      active ? "bg-th-highlight " : "",
                      "block text-sm"
                    )}
                  >
                    <button
                      className="flex flex-row items-center justify-center w-full h-6 px-4 py-5"
                      onTouchStart={() => setTouched(true)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (touched) {
                          columnMenuRef?.current?.click();
                        } else {
                          setColumnCount(0);
                        }
                      }}
                    >
                      Column Count
                    </button>
                  </div>
                  <ul
                    className={
                      (active && !touched ? "block " : "hidden ") +
                      (!touched
                        ? " group-hover:block group-focus:block "
                        : "") +
                      "absolute top-0 w-32 -left-32  bg-th-background2 rounded-md shadow-lg border border-th-border text-right"
                    }
                  >
                    <li>
                      <div
                        className={
                          (context.columnOverride === 0 ? "font-bold " : "") +
                          " px-4 py-3 text-sm hover:bg-th-highlight   mt-1 cursor-pointer"
                        }
                        onClick={(e) => {
                          setColumnCount(0);
                        }}
                      >
                        Automatic
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.columnOverride === 1 ? "font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setColumnCount(1);
                        }}
                      >
                        One
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.columnOverride === 2 ? "font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setColumnCount(2);
                        }}
                      >
                        Two
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.columnOverride === 3 ? "font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setColumnCount(3);
                        }}
                      >
                        Three
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.columnOverride === 4 ? "font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setColumnCount(4);
                        }}
                      >
                        Four
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.columnOverride === 5 ? "font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setColumnCount(5);
                        }}
                      >
                        Five
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.columnOverride === 7 ? "font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setColumnCount(7);
                        }}
                      >
                        Seven
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div className="group">
                  <div
                    className={classNames(
                      active ? "bg-th-highlight " : "",
                      "block text-sm"
                    )}
                  >
                    <button
                      className="flex flex-row items-center justify-center w-full h-6 px-4 py-5 "
                      onTouchStart={() => setTouched(true)}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (touched) {
                          cardStyleRef?.current?.click();
                        } else {
                          setCardStyle("default");
                        }
                      }}
                    >
                      Card Style
                    </button>
                  </div>
                  <ul
                    className={
                      (active && !touched ? "block " : "hidden ") +
                      (!touched
                        ? " group-hover:block group-focus:block "
                        : "") +
                      " absolute top-0 w-32 -left-32  bg-th-background2 rounded-md shadow-lg border border-th-border text-right"
                    }
                  >
                    <li>
                      <div
                        className={
                          ((context.cardStyle === "card1" || context.cardStyle === "default") && !context.mediaOnly
                            ? " font-bold "
                            : "") + ` ${subOptionStyle} mt-1`
                        }
                        onClick={(e) => {
                          setCardStyle("card1");
                          // if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};

                          context.setMediaOnly(false);
                        }}
                      >
                        Original Card
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.cardStyle === "card2"
                            ? " font-bold "
                            : "") + ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setCardStyle("card2");
                          //if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};

                          context.setMediaOnly(false);
                        }}
                      >
                        Compact Card
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.cardStyle == "card1" && context.mediaOnly
                            ? " font-bold "
                            : "") + ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setCardStyle("card1");
                          //if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};
                          context.setMediaOnly(true);
                        }}
                      >
                        Media Card
                      </div>
                    </li>
                    <li>
                      <div
                        className={
                          (context.cardStyle == "row1" ? " font-bold " : "") +
                          ` ${subOptionStyle}`
                        }
                        onClick={(e) => {
                          setCardStyle("row1");
                          context.setMediaOnly(false);
                          context.setColumnOverride(1);
                        }}
                      >
                        Classic Rows
                      </div>
                    </li>
                  </ul>
                </div>
              )}
            </Menu.Item>

            {windowWidth > 640 && (
              <>
                {["hoverplay"].map((setting: any) => (
                  <Menu.Item key={setting}>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active ? "bg-th-highlight " : "",
                          "block px-4 text-sm "
                        )}
                      >
                        <Toggles
                          setting={setting}
                          externalStyles="py-2 cursor-pointer"
                        />
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </>
            )}
            {["autoplay", "audioOnHover", "theme"].map((setting: any) => (
              <Menu.Item key={setting}>
                {({ active }) => (
                  <div
                    className={classNames(
                      active ? "bg-th-highlight " : "",
                      "block px-4 text-sm "
                    )}
                  >
                    <Toggles
                      setting={setting}
                      externalStyles="py-2 cursor-pointer"
                    />
                  </div>
                )}
              </Menu.Item>
            ))}
            {context.cardStyle === "card1" && context.mediaOnly && (
              <>
                {["uniformHeights"].map((setting: any) => (
                  <Menu.Item key={setting}>
                    {({ active }) => (
                      <div
                        className={classNames(
                          active ? "bg-th-highlight " : "",
                          "block px-4 text-sm "
                        )}
                      >
                        <Toggles
                          setting={setting}
                          externalStyles="py-2 cursor-pointer"
                        />
                      </div>
                    )}
                  </Menu.Item>
                ))}
              </>
            )}
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4  text-sm"
                  )}
                >
                  <Link
                    href="/settings"
                    passHref={true}
                    className="flex flex-row justify-center py-2 cursor-pointer select-none">
                    
                      Settings
                    
                  </Link>
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4  text-sm"
                  )}
                >
                  <Link
                    href="/about"
                    passHref={true}
                    className="flex flex-row justify-center py-2 cursor-pointer select-none">
                    
                      About
                    
                  </Link>
                </div>
              )}
            </Menu.Item>
            <Menu.Item disabled={!isSignedIn}>
              {({ disabled, active }) => (
                <button
                  className={classNames(
                    disabled ? "hidden" : "",
                    active ? "bg-th-highlight " : "",
                    "block px-4  text-sm w-full py-2 text-center"
                  )}
                  onClick={() => {signOut && signOut()}}
                >
                 troddit sign out
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
    <Menu as={"div"} className={"relative font-normal"}>
      <Menu.Button
        aria-label="column count options"
        ref={columnMenuRef}
        className="hidden"
      ></Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-800"
        enterFrom="transform opacity-100 scale-100"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className={
            "absolute right-[9.95rem] text-right top-[1.4rem] w-32 origin-top-right bg-th-background2 rounded-md shadow-lg focus:outline-none border border-th-border z-50  " +
            (hide && " hidden")
          }
        >
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 0
                  ? "font-bold bg-th-highlight "
                  : "") +
                " px-4 py-3 text-sm hover:bg-th-highlight   mt-1 cursor-pointer"
              }
              onClick={(e) => {
                setColumnCount(0);
              }}
            >
              Automatic
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 1
                  ? "font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setColumnCount(1);
              }}
            >
              One
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 2
                  ? "font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setColumnCount(2);
              }}
            >
              Two
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 3
                  ? "font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setColumnCount(3);
              }}
            >
              Three
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 4
                  ? "font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setColumnCount(4);
              }}
            >
              Four
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 5
                  ? "font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setColumnCount(5);
              }}
            >
              Five
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.columnOverride === 7
                  ? "font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setColumnCount(7);
              }}
            >
              Seven
            </div>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
    <Menu as={"div"} className={"relative font-normal"}>
      <Menu.Button
        aria-label="column count options"
        ref={cardStyleRef}
        className="hidden"
      ></Menu.Button>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-800"
        enterFrom="transform opacity-100 scale-100"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          as="ul"
          className={
            "absolute right-[9.95rem] text-right top-[1.4rem] w-32 origin-top-right bg-th-background2 rounded-md shadow-lg focus:outline-none border border-th-border z-50  " +
            (hide && " hidden")
          }
        >
          <Menu.Item as={"li"}>
            <div
              className={
                ((context.cardStyle === "card1" ||
                  context.cardStyle === "default") &&
                !context.mediaOnly
                  ? " font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle} mt-1`
              }
              onClick={(e) => {
                setCardStyle("card1");
                // if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};

                context.setMediaOnly(false);
              }}
            >
              Original Card
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.cardStyle === "card2"
                  ? " font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setCardStyle("card2");
                //if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};

                context.setMediaOnly(false);
              }}
            >
              Compact Card
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.cardStyle == "card1" && context.mediaOnly
                  ? " font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setCardStyle("card1");
                //if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};
                context.setMediaOnly(true);
              }}
            >
              Media Card
            </div>
          </Menu.Item>
          <Menu.Item as={"li"}>
            <div
              className={
                (context.cardStyle == "row1"
                  ? " font-bold bg-th-highlight "
                  : "") + ` ${subOptionStyle}`
              }
              onClick={(e) => {
                setCardStyle("row1");
                context.setMediaOnly(false);
                context.setColumnOverride(1);
              }}
            >
              Classic Rows
            </div>
          </Menu.Item>
        </Menu.Items>
      </Transition>
    </Menu>
  </>;
};

export default NavMenu;
