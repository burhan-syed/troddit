import { BsThreeDotsVertical } from "react-icons/bs";
import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import SubMultiButton from "./SubMultiButton";
import { useSubsContext } from "../MySubs";
import DropdownItem from "./DropdownItem";

const SubOptButton = ({ subInfo, subArray, multiInfo }) => {
  const subsContext: any = useSubsContext();
  const { myMultis, loadedMultis } = subsContext;
  return (
    <Menu as="div" className="relative z-50 select-none">
      {({ open }) => (
        <>
          <div className="flex items-center justify-center w-6">
            <Menu.Button
              name="Sort Page By"
              className={
                "w-6 flex justify-center items-center  border-2 dark:border dark:border-lightBorder  rounded-md cursor-pointer dark:hover:bg-darkBorder hover:bg-lightHighlight"
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
                "absolute right-0 w-40 mt-2 origin-top-right bg-white dark:bg-darkBG rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none  border-2 dark:border dark:border-lightBorder "
              }
            >
              <div className="py-1 ">
                {subArray?.length > 1 && (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") + " block px-4 py-1 text-sm"
                        }
                      >
                        <div className="flex flex-row justify-end cursor-pointer select-none">
                          {`Join All`}
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={
                        (active
                          ? "bg-lightHighlight dark:bg-darkHighlight "
                          : "") + " block px-4 py-1 text-sm"
                      }
                    >
                      <div className="flex flex-row justify-end text-right cursor-pointer select-none">
                        {`Create Multi`}
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {myMultis.length > 0 && (
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
                            "absolute top-[-2px] left-[-160px] w-40 max-h-96 overflow-y-scroll  bg-white border-2 rounded-md py-1 shadow-lg dark:bg-darkBG ring-1 ring-black ring-opacity-5 focus:outline-none dark:border dark:border-lightBorder " +
                            (active ? "  " : " hidden ")
                          }
                        >
                          {myMultis
                            ? myMultis.map((multi, i) => {
                                return (
                                  <div key={`${i}_${multi.data.display_name}`}>
                                    {multi.data.display_name.toUpperCase() !==
                                      multiInfo.toUpperCase() && (
                                      <div className="px-2 py-1 hover:bg-lightHighlight dark:hover:bg-darkHighlight">
                                        <DropdownItem sub={multi} />
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            : ""}
                        </div>
                      </div>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      className={
                        (active
                          ? "bg-lightHighlight dark:bg-darkHighlight "
                          : "") + " block px-4 py-1 text-sm"
                      }
                    >
                      <div className="flex flex-row justify-end text-right cursor-pointer select-none">
                        {`C ${multiInfo}`}
                      </div>
                    </div>
                  )}
                </Menu.Item>
                {multiInfo?.length > 0 && (
                  <Menu.Item>
                    {({ active }) => (
                      <div
                        className={
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") + " block px-4 py-1 text-sm"
                        }
                      >
                        <div className="flex flex-row justify-end text-right cursor-pointer select-none">
                          {`Remove from ${multiInfo}`}
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
  );
};

export default SubOptButton;
