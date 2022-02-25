import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsThreeDotsVertical } from "react-icons/bs";
import ToggleTheme from "./ToggleTheme";
import ToggleNSFW from "./ToggleNSFW";
import ToggleAutoplay from "./ToggleAutoplay";
import Link from "next/link";
import { useMainContext } from "../MainContext";
import ToggleMediaOnly from "./ToggleMediaOnly";
import ToggleAudioOnHover from "./ToggleAudioOnHover";
import Login from "./Login";
import ToggleWideUI from "./ToggleWideUI";
import ToggleHoverplay from "./ToggleHoverplay";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const NavMenu = ({ hide = false }) => {
  const context: any = useMainContext();

  //need to reset wideUI so multi-column (narrow UI doesn't make sense with >1 column) displays properly.
  //Refreshes feed to fix alignment when switching to 1 column and in narrow UI mode
  //Also refreshes feed in mainContext with a useEffect when wideUI is changed if in 1 column mode
  const setColumnCount = (count) => {
    if (count !== context.columnOverride) {
      //if narrow and switching from 1 column force refresh and set to not narrow so feed displays properly
      if (!context.wideUI && context.columnOverride === 1) {
        context.setWideUI((w) => !w);
        //also force a refresh here to rerender feed
        context.setForceRefresh((n) => n + 1);
      }

      //if switching to 1 column and in narrow mode, refresh feed
      else if (count === 1) {
        if (context.wideUI === context.saveWideUI && !context.saveWideUI) {
          context.setForceRefresh((n) => n + 1);
        }
        //otherwise if not in narrow mode just reset the ui
        else {
          context.setWideUI(context.saveWideUI);
        }
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
        context.setForceRefresh((f) => f + 1);
      }
      context.setCardStyle(style);
    }
  };

  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center flex-grow w-full h-full select-none"
    >
      <div className="flex-grow w-full">
        <Menu.Button
          title={"options"}
          name="Options"
          className="flex flex-row items-center justify-center w-full h-full bg-white border border-white rounded-md hover:border-lightBorder dark:hover:border-darkBorder dark:bg-darkBG dark:border-darkBG focus:outline-none"
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
            "absolute right-0 w-40 mt-11 origin-top-right bbg-white dark:bg-darkBG bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-lightBorder dark:border-darkBorder " +
            (hide && " hidden")
          }
        >
          <div className="py-1">
            {context.cardStyle !== "row1" && (
              <Menu.Item>
                {({ active }) => (
                  <div
                    className="group"
                    onClick={(e) => {
                      e.preventDefault();
                      setColumnCount(0);
                    }}
                  >
                    <div
                      className={classNames(
                        active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                        "block px-4 py-2 text-sm"
                      )}
                    >
                      <div className="flex flex-row items-center justify-center h-6">
                        Column Count
                      </div>
                    </div>
                    <ul
                      className={
                        (active ? "block " : "hidden ") +
                        "absolute top-0 w-32 -left-32 group-hover:block group-focus:block bg-white dark:bg-darkBG rounded-md shadow-lg border border-lightBorder dark:border-darkBorder text-right"
                      }
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 0
                                ? "font-bold "
                                : "") +
                              " px-4 py-2.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight mt-1 cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(0);
                            }}
                          >
                            Default
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 1
                                ? "font-bold "
                                : "") +
                              " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(1);
                            }}
                          >
                            One
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 2
                                ? "font-bold "
                                : "") +
                              " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(2);
                            }}
                          >
                            Two
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 3
                                ? "font-bold "
                                : "") +
                              " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(3);
                            }}
                          >
                            Three
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 4
                                ? "font-bold "
                                : "") +
                              " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(4);
                            }}
                          >
                            Four
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 5
                                ? "font-bold "
                                : "") +
                              " px-3 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(5);
                            }}
                          >
                            Five
                          </div>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (context.columnOverride === 7
                                ? "font-bold "
                                : "") +
                              " px-3 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight mb-1 cursor-pointer"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              setColumnCount(7);
                            }}
                          >
                            Seven
                          </div>
                        )}
                      </Menu.Item>
                    </ul>
                  </div>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <div
                  className="group"
                  onClick={(e) => {
                    e.preventDefault();
                    setCardStyle("default");
                  }}
                >
                  <div
                    className={classNames(
                      active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                      "block px-4 py-2 text-sm"
                    )}
                  >
                    <div className="flex flex-row items-center justify-center h-6">
                      Post Style
                    </div>
                  </div>
                  <ul
                    className={
                      (active ? "block " : "hidden ") +
                      "absolute top-0 w-32 -left-32 group-hover:block group-focus:block bg-white dark:bg-darkBG rounded-md shadow-lg border border-lightBorder dark:border-darkBorder text-right"
                    }
                  >
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (context.cardStyle === "card1" && !context.mediaOnly
                              ? " font-bold "
                              : "") +
                            " px-4 py-2.5 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight mt-1 cursor-pointer"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setCardStyle("card1");
                            // if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};

                            context.setMediaOnly(false);
                          }}
                        >
                          Original Card
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (context.cardStyle === "card2"
                              ? " font-bold "
                              : "") +
                            " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setCardStyle("card2");
                            //if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};

                            context.setMediaOnly(false);
                          }}
                        >
                          Compact Card
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (context.cardStyle == "card1" && context.mediaOnly
                              ? " font-bold "
                              : "") +
                            " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setCardStyle("card1");
                            //if(context.columnOverride == 1 || context.columns == 1) {context.setColumnOverride(0);};
                            context.setMediaOnly(true);
                          }}
                        >
                          Media Card
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (context.cardStyle == "row1" ? " font-bold " : "") +
                            " px-4 py-3 text-sm hover:bg-lightHighlight dark:hover:bg-darkHighlight cursor-pointer"
                          }
                          onClick={(e) => {
                            e.preventDefault();
                            setCardStyle("row1");
                            context.setMediaOnly(false);
                            context.setColumnOverride(1);
                          }}
                        >
                          Classic Rows
                        </div>
                      )}
                    </Menu.Item>
                  </ul>
                </div>
              )}
            </Menu.Item>
            {/* <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleMediaOnly />
                </div>
              )}
            </Menu.Item> */}
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleWideUI />
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleHoverplay />
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleAutoplay />
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleAudioOnHover />
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight " : "",
                    "block px-4 py-2 text-sm  "
                  )}
                >
                  <ToggleTheme />
                </div>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleNSFW />
                </div>
              )}
            </Menu.Item>
            {/* <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <Login/>
                </div>
              )}
            </Menu.Item> */}

            <Menu.Item>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <Link href="/about" passHref={true}>
                    <div className="flex flex-row justify-center cursor-pointer select-none">
                      About
                    </div>
                  </Link>
                </div>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default NavMenu;
