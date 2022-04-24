import { BsThreeDotsVertical } from "react-icons/bs";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import SubMultiButton from "./SubMultiButton";
import { useSubsContext } from "../MySubs";
import DropdownItem from "./DropdownItem";
import MultiManageModal from "./MultiManageModal";
import { useSession } from "next-auth/react";
import { addToMulti, createMulti, deleteFromMulti } from "../RedditAPI";
import Link from "next/link";

const SubOptButton = ({
  subInfo,
  subArray,
  currMulti,
  openDescription = undefined,
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
      deleteRedditMulti(currMulti, session.user.name);
    } else if (!loading) {
      deleteLocalMulti(currMulti);
    }
  };
  return (
    <>
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
                title={"more actions"}
                name="Extra Sub Menu"
                className={
                  "w-6 h-9 flex justify-center items-center  bg-white border border-lightBorder hover:border-lightBorderHighlight rounded-md dark:border-darkBorder dark:hover:border-lightBorder focus:outline-none dark:bg-darkBG"
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
                  "absolute right-0  w-40 mt-2 origin-top-right bg-white dark:bg-darkBG rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-lightBorder dark:border-darkBorder select-none cursor-pointer "
                }
              >
                <div className="py-1 ">
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") + " block px-4 py-1 text-sm"
                        }
                      >
                        <div className="relative flex flex-row justify-end py-0.5 cursor-pointer select-none">
                          Add to Multi
                        </div>
                        <div
                          className={
                            "absolute top-0 -left-[10rem] w-40 max-h-96 overflow-y-scroll  bg-white dark:bg-darkBG rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-lightBorder dark:border-darkBorder select-none cursor-pointer py-1 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800" +
                            (active ? "  " : " hidden ")
                          }
                        >
                          <div
                            onClick={(e) => {
                              setopenMulti((s) => s + 1);
                            }}
                          >
                            <div
                              className="px-2 py-1 hover:bg-lightHighlight dark:hover:bg-darkHighlight hover:cursor-pointer"
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
                                      <div className="px-2 py-1 hover:bg-lightHighlight dark:hover:bg-darkHighlight">
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
                                      <div className="px-2 py-1 hover:bg-lightHighlight dark:hover:bg-darkHighlight">
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
                            (active
                              ? "bg-lightHighlight dark:bg-darkHighlight "
                              : "") + " block px-4 py-1 text-sm"
                          }
                          onClick={removeFromMulti}
                        >
                          <div className="flex flex-row justify-end text-right cursor-pointer select-none">
                            {`Remove from m/${currMulti}`}
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
                            (active
                              ? "bg-lightHighlight dark:bg-darkHighlight "
                              : "") + " block px-4 py-1 text-sm"
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
                              >{`Delete m/${currMulti}`}</div>
                            )}
                          </div>
                        </div>
                      )}
                    </Menu.Item>
                  )}
                  {openDescription && (
                    <>
                      <Menu.Item>
                        {({ active }) => (
                          <div
                            className={
                              (active
                                ? "bg-lightHighlight dark:bg-darkHighlight "
                                : "") + " block px-4 py-1 text-sm"
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
                              (active
                                ? "bg-lightHighlight dark:bg-darkHighlight "
                                : "") +
                              " block px-4 py-1 text-sm cursor-pointer select-none"
                            }
                          >
                            <Link href={`/r/${subInfo?.display_name}/wiki/`}>
                              <a className="flex flex-row justify-end">
                                {`Wiki`}
                              </a>
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
                            (active
                              ? "bg-lightHighlight dark:bg-darkHighlight "
                              : "") + " block px-4 py-1 text-sm"
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
    </>
  );
};

export default SubOptButton;
