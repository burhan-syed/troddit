import { BsThreeDotsVertical } from "react-icons/bs";
import { Fragment, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useSubsContext } from "../MySubs";
import DropdownItem from "./DropdownItem";
import MultiManageModal from "./MultiManageModal";
import { useSession } from "next-auth/react";
import Link from "next/link";
import useFilterSubs from "../hooks/useFilterSubs";
import React from "react";

const SubOptButton = ({
  subInfo,
  subArray,
  currMulti,
  openDescription = () => {},
}) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const subsContext: any = useSubsContext();
  const {
    myMultis,
    myLocalMultis,
    loadedMultis,
    subscribeAll,
    createLocalMulti,
    deleteLocalMulti,
    addToLocalMulti,
    removeFromLocalMulti,
    addToRedditMulti,
    removeFromRedditMulti,
    deleteRedditMulti,
  } = subsContext;
  const { addSubFilter } = useFilterSubs();
  const [openMulti, setopenMulti] = useState(0);
  const [currMultiExist, setcurrMultiExist] = useState(false);
  const [subInMulti, setSubInMulti] = useState(false);
  const [deleteCheck, setDeleteCheck] = useState(false);

  useEffect(() => {
    const findIfMultiExist = () => {
      let found = false;
      if (session && myMultis?.length > 0) {
        myMultis.forEach((m) => {
          if (m?.data?.display_name?.toUpperCase() === currMulti.toUpperCase())
            found = true;
        });
      } else if (myLocalMultis?.length > 0) {
        myLocalMultis.forEach((m) => {
          if (m?.data?.display_name?.toUpperCase() === currMulti.toUpperCase())
            found = true;
        });
      }
      return found;
    };
    currMulti && setcurrMultiExist(findIfMultiExist());
  }, [session, myLocalMultis, myMultis, currMulti]);

  useEffect(() => {
    currMulti && setSubInMulti(findIfSubInMulti());
  }, [subInfo, session, myLocalMultis, myMultis, currMulti]);

  const findIfSubInMulti = () => {
    let found = false;
    if (session && myMultis?.length > 0) {
      myMultis.forEach((m) => {
        if (m?.data?.display_name?.toUpperCase() === currMulti.toUpperCase())
          m?.data?.subreddits.forEach((s) => {
            if (s?.name?.toUpperCase() === subInfo?.display_name?.toUpperCase())
              found = true;
          });
      });
    } else if (myLocalMultis?.length > 0) {
      myLocalMultis.forEach((m) => {
        if (m?.data?.display_name?.toUpperCase() === currMulti.toUpperCase())
          m?.data?.subreddits.forEach((s) => {
            if (s?.name?.toUpperCase() === subInfo?.display_name?.toUpperCase())
              found = true;
          });
      });
    }
    return found;
  };

  const JoinAll = () => {
    subscribeAll(subArray);
  };
  const multiCreate = () => {
    setopenMulti((n) => n + 1);
  };
  const tryAddToMulti = (multi) => {
    //console.log(session?.user?.name, multi, subInfo?.display_name);
    if (!session && !loading) {
      addToLocalMulti(multi, subInfo?.display_name);
    } else if (session) {
      addToRedditMulti(multi, session?.user?.name, subInfo?.display_name);
    }
  };
  const removeFromMulti = () => {
    //console.log(session);

    if (session) {
      removeFromRedditMulti(
        currMulti,
        session?.user?.name,
        subInfo?.display_name
      );
    } else if (!loading) {
      removeFromLocalMulti(currMulti, subInfo?.display_name);
    }
    setSubInMulti(findIfSubInMulti());
  };
  const toggleDeleteCheck = () => {
    setDeleteCheck((s) => !s);
  };
  const deleteMulti = () => {
    //console.log(session);

    if (session) {
      deleteRedditMulti(currMulti, session?.user?.name);
    } else if (!loading) {
      deleteLocalMulti(currMulti);
    }
  };
  const feedMenuRef = useRef<HTMLButtonElement>(null);

  return <>
    <MultiManageModal
      toOpen={openMulti}
      subreddits={subArray}
      multiname={currMulti}
      mode={"create"}
    />

    <Menu as="div" className="relative z-10 select-none">
      {({ open }) => (
        <>
          <div className="flex items-center justify-center w-6">
            <Menu.Button
              aria-label="more actions"
              title={"more actions"}
              name="Extra Sub Menu"
              className={
                "w-6 h-9 flex justify-center items-center   border border-th-border hover:border-th-borderHighlight rounded-md  focus:outline-none "
              }
            >
              <BsThreeDotsVertical className="w-5 h-8" />
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
                "absolute right-0  w-40 mt-2 origin-top-right  rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border bg-th-background2 border-th-border ring-th-base select-none cursor-pointer "
              }
            >
              <div className="py-1 ">
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={
                        (active ? "bg-th-highlight " : "") + " block  text-sm"
                      }
                    >
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          feedMenuRef?.current?.click();
                        }}
                        className="relative flex flex-row justify-end w-full px-4 py-2.5 cursor-pointer select-none md:py-1"
                      >
                        Add to Feed..
                      </button>
                      <div
                        className={
                          "absolute top-0 -left-[10rem] w-40 max-h-96 overflow-y-scroll   rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border  select-none cursor-pointer py-1 scrollbar-thin  scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-th-scrollbar bg-th-background2 border-th-border ring-th-base" +
                          (active ? "  " : " hidden ")
                        }
                      >
                        <div
                          onClick={(e) => {
                            setopenMulti((s) => s + 1);
                          }}
                        >
                          <div
                            className="px-2 py-1 hover:bg-th-highlight hover:cursor-pointer"
                            onClick={multiCreate}
                          >
                            <h1 className="pl-2">Create New</h1>
                          </div>
                        </div>
                        {myMultis?.length > 0
                          ? myMultis?.map((multi, i) => {
                              return (
                                <div
                                  key={`${i}_${multi.data.display_name}`}
                                  onClick={() =>
                                    tryAddToMulti(multi.data.display_name)
                                  }
                                >
                                  {/* {multi.data.display_name.toUpperCase() !==
                                    currMulti.toUpperCase()  */}
                                  {true && (
                                    <div className="px-2 py-1 hover:bg-th-highlight">
                                      <DropdownItem sub={multi} />
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          : myLocalMultis?.length > 0 &&
                            !session &&
                            myLocalMultis?.map((multi, i) => {
                              return (
                                <div
                                  key={`${i}_${multi.data.display_name}`}
                                  onClick={() =>
                                    tryAddToMulti(multi.data.display_name)
                                  }
                                >
                                  {/* {multi.data.display_name.toUpperCase() !==
                                    currMulti.toUpperCase() && ( */}
                                  {true && (
                                    <div className="px-2 py-1 hover:bg-th-highlight">
                                      <DropdownItem sub={multi} />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}
                </Menu.Item>

                {currMultiExist && subInMulti && (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block px-4 py-2.5 md:py-1 text-sm"
                        }
                        onClick={removeFromMulti}
                      >
                        <div className="flex flex-row justify-end text-right cursor-pointer select-none">
                          {`Remove from f/${currMulti}`}
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                )}
                {currMultiExist && (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block px-4 py-2.5 md:py-1 text-sm"
                        }
                      >
                        <div
                          onClick={(e) => {
                            if (!deleteCheck) {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleDeleteCheck();
                            } else {
                              toggleDeleteCheck();
                            }
                          }}
                          className="flex flex-row justify-end text-right cursor-pointer select-none"
                        >
                          {deleteCheck ? (
                            <div>
                              {"Delete? "}
                              <span
                                className="hover:font-bold hover:underline"
                                onClick={deleteMulti}
                              >
                                Yes
                              </span>{" "}
                              /{" "}
                              <span className="hover:underline hover:font-bold">
                                No
                              </span>
                            </div>
                          ) : (
                            <div
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleDeleteCheck();
                              }}
                            >{`Delete f/${currMulti}`}</div>
                          )}
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={
                        (active ? "bg-th-highlight " : "") +
                        " block px-4 py-2.5 md:py-1 text-sm"
                      }
                      onClick={() => addSubFilter(subInfo?.display_name)}
                    >
                      <div className="flex flex-row justify-end cursor-pointer select-none">
                        {`Filter Subreddit`}
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {openDescription && (
                  <>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (active ? "bg-th-highlight " : "") +
                            " block px-4 py-2.5 md:py-1 text-sm"
                          }
                          onClick={openDescription}
                        >
                          <div className="flex flex-row justify-end cursor-pointer select-none">
                            {`Sidebar`}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (active ? "bg-th-highlight " : "") +
                            " block px-4 py-2.5 md:py-1 text-sm cursor-pointer select-none"
                          }
                        >
                          <Link
                            href={`/r/${subInfo?.display_name}/wiki/`}
                            className="flex flex-row justify-end">

                            {`Wiki`}

                          </Link>
                        </div>
                      )}
                    </Menu.Item>
                  </>
                )}
                {subArray?.length > 1 && !session && !loading && (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block px-4 py-2.5 md:py-1 text-sm"
                        }
                        onClick={JoinAll}
                      >
                        <div className="flex flex-row justify-end cursor-pointer select-none">
                          {`Join All`}
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                )}
              </div>
            </Menu.Items>
          </Transition>
        </>
      )}
    </Menu>
    <Menu as={"div"} className={"relative"}>
      <Menu.Button ref={feedMenuRef} className="hidden"></Menu.Button>
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
          as={"div"}
          className={
            "absolute z-50 top-11  right-1 w-40 max-h-96 overflow-y-scroll   rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border  select-none cursor-pointer py-1 scrollbar-thin  scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-th-scrollbar bg-th-background2 border-th-border ring-th-base"
          }
        >
          <Menu.Item
            as={"button"}
            onClick={(e) => {
              setopenMulti((s) => s + 1);
            }}
            className="w-full"
            autoFocus
          >
            {({ active }) => (
              <div
                className={
                  "px-2 py-2  hover:cursor-pointer" +
                  (active ? " bg-th-highlight " : "")
                }
                onClick={multiCreate}
              >
                <h1 className="pl-2">Create New</h1>
              </div>
            )}
          </Menu.Item>
          {myMultis?.length > 0
            ? myMultis?.map((multi, i) => {
                return (
                  <Menu.Item
                    as={"button"}
                    className={"w-full"}
                    key={`${i}_${multi.data.display_name}`}
                    onClick={() => tryAddToMulti(multi.data.display_name)}
                  >
                    {({ active }) => (
                      <div
                        className={
                          "px-2 py-2 " + (active ? " bg-th-highlight" : "")
                        }
                      >
                        <DropdownItem sub={multi} />
                      </div>
                    )}
                  </Menu.Item>
                );
              })
            : myLocalMultis?.length > 0 &&
              !session &&
              myLocalMultis?.map((multi, i) => {
                return (
                  <Menu.Item
                    key={`${i}_${multi.data.display_name}`}
                    onClick={() => tryAddToMulti(multi.data.display_name)}
                  >
                    {({ active }) => (
                      <div
                        className={
                          "px-2 py-2 " + (active ? " bg-th-highlight " : " ")
                        }
                      >
                        <DropdownItem sub={multi} />
                      </div>
                    )}
                  </Menu.Item>
                );
              })}
        </Menu.Items>
      </Transition>
    </Menu>
  </>;
};

export default SubOptButton;
