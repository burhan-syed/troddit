import { BsThreeDotsVertical } from "react-icons/bs";
import { Fragment, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useSubsContext } from "../../MySubs";
import { useSession } from "next-auth/react";
import DropdownItem from "../DropdownItem";
import MultiManageModal from "../MultiManageModal";
import React from "react";

const CollectionOptions = ({
  // subInfo,
  subArray,
  currMulti = "",
  isOwner = true,
}) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const subsContext: any = useSubsContext();
  const {
    myMultis,
    myLocalMultis,
    subscribeAll,
    deleteLocalMulti,
    addAllToLocalMulti,
    removeAllFromLocalMulti,
    addToRedditMulti,
    removeFromRedditMulti,
    deleteRedditMulti,
  } = subsContext;
  const [deleteCheck, setDeleteCheck] = useState(false);
  const [removeCheck, setRemoveCheck] = useState(false);

  const [openMulti, setopenMulti] = useState(0);

  const JoinAll = () => {
    subscribeAll(subArray);
  };
  const tryAddToMulti = (multi) => {
    if (!session && !loading) {
      addAllToLocalMulti(multi, subArray);
    } else if (session) {
      subArray.forEach((sub) => {
        addToRedditMulti(multi, session?.user?.name, sub);
      });
    }
  };
  const multiCreate = () => {
    setopenMulti((n) => n + 1);
  };
  const removeFromMulti = () => {
    if (session) {
      subArray.forEach((sub) => {
        removeFromRedditMulti(currMulti, session?.user?.name, sub);
      });
    } else if (!loading) {
      removeAllFromLocalMulti(currMulti, subArray);
    }
  };
  const toggleDeleteCheck = () => {
    setDeleteCheck((s) => !s);
  };
  const toggleRemoveCheck = () => {
    setRemoveCheck((s) => !s);
  };
  const deleteMulti = () => {
    if (session?.user?.name) {
      deleteRedditMulti(currMulti, session.user.name);
    } else if (!loading) {
      deleteLocalMulti(currMulti);
    }
  };
  const feedMenuRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <MultiManageModal
        toOpen={openMulti}
        subreddits={subArray}
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
                  "w-6  flex justify-center items-center border rounded-md focus:outline-none bg-background2 hover:bg-th-highlight border-th-border hover:border-th-borderHighlight   " +
                  (currMulti ? " h-8" : " h-9")
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
                  "z-50 absolute   w-40 mt-2 bg-th-background2 ring-th-base border-th-border rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border  select-none cursor-pointer " +
                  (currMulti
                    ? " origin-top-right right-7 -top-2  "
                    : "origin-bottom-right bottom-10 right-0")
                }
              >
                <div className="py-1 ">
                  <Menu.Item disabled={subArray.length < 1}>
                    {({ active, disabled }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block  text-sm" +
                          (disabled ? " opacity-20 " : "")
                        }
                      >
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            feedMenuRef?.current?.click();
                          }}
                          className="relative flex flex-row justify-end w-full px-4 py-2.5 md:py-1 cursor-pointer select-none"
                        >
                          Add {subArray.length} to Feed
                        </button>
                        <div
                          className={
                            "absolute top-0 -left-[10rem] w-40 overflow-y-scroll bg-th-background2  rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border  select-none cursor-pointer py-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full  scrollbar-thumb-th-scrollbar" +
                            (active ? "  " : " hidden ") +
                            (currMulti ? " max-h-96 " : " max-h-40 ")
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

                  <Menu.Item
                    disabled={
                      subArray.length < 1 || currMulti.length < 1 || !isOwner
                    }
                  >
                    {({ active, disabled }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " flex justify-end px-4 py-2.5 md:py-1  text-sm" +
                          (disabled ? " hidden " : "")
                        }
                        onClick={(e) => {
                          if (!removeCheck) {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleRemoveCheck();
                          } else {
                            toggleRemoveCheck();
                          }
                        }}
                        // onClick={removeFromMulti}
                      >
                        {removeCheck ? (
                          <div>
                            {"Remove? "}
                            <span
                              className="hover:font-bold hover:underline"
                              onClick={removeFromMulti}
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
                              toggleRemoveCheck();
                            }}
                          >{`Remove ${subArray.length} ${
                            subArray.length == 1 ? "sub" : "subs"
                          }`}</div>
                        )}
                        {/* <div className="flex flex-row justify-end text-right cursor-pointer select-none">
                          {`Remove from m/${currMulti}`}
                        </div> */}
                      </div>
                    )}
                  </Menu.Item>
                  <Menu.Item disabled={currMulti.length < 1 || !isOwner}>
                    {({ active, disabled }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block  text-sm" +
                          (disabled ? " hidden " : "")
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
                          className="flex px-4 py-2.5 md:py-1  flex-row justify-end text-right cursor-pointer select-none"
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
                  {subArray?.length >= 1 && (
                    <Menu.Item
                      disabled={subArray.length < 1 || !!session || loading}
                    >
                      {({ active, disabled }) => (
                        <div
                          className={
                            (active ? "bg-th-highlight " : "") +
                            " block px-4 py-2.5 md:py-1  text-sm" +
                            (disabled ? " hidden" : "")
                          }
                          onClick={JoinAll}
                        >
                          <div className="flex flex-row justify-end cursor-pointer select-none">
                            {`Join ${subArray.length} selected`}
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
              "absolute z-50  w-40 max-h-96 overflow-y-scroll   rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border  select-none cursor-pointer py-1 scrollbar-thin  scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-th-scrollbar bg-th-background2 border-th-border ring-th-base" +
              (currMulti
                ? " origin-top-right right-7 -top-0  "
                : "origin-bottom-right bottom-6 right-2")
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
    </>
  );
};

export default CollectionOptions;
