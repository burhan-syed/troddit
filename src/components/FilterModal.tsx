/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useSession } from "next-auth/client";
import ToggleFilters from "./ToggleFilters";
import { useMainContext } from "../MainContext";

const filters = ["self", "links", "images", "videos", "portrait", "landscape"];

const FilterModal = ({ toOpen }) => {
  const context: any = useMainContext();
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [input, setInput] = useState("");

  useEffect(() => {
    toOpen > 0 && setOpen(true);
    return () => {
      setInput("");
    };
  }, [toOpen]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={() => setOpen(false)}
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 dark:bg-gray-800 dark:bg-opacity-80" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="hidden sm:inline-block sm:align-middle sm:h-screen"
            aria-hidden="true"
          >
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl dark:bg-darkBG sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="relative px-4 pt-5 pb-4 overflow-visible bg-white dark:bg-darkBG sm:p-6 sm:pb-4">
                <div
                  className="absolute flex items-center justify-center w-8 h-8 ml-auto text-gray-500 top-2 right-2 hover:text-gray-900 dark:hover:text-gray-200 hover:cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <RiArrowGoBackLine className="w-8 h-8 " />
                </div>
                <div className="flex-col mt-2 ">
                  {/* //sm:flex sm:items-start "> */}
                  <div className="min-w-full py-1 ">
                    {filters.map((f, i) => (
                      <div key={i}>
                        <div className={"block px-4  text-sm "}>
                          <ToggleFilters filter={f} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* <h1 className="pl-6 text-xs">Advanced</h1> */}
                  {/* <div className="">
                    <div className={"block px-4  text-sm "}>
                      <ToggleFilters filter={"portrait"} />
                    </div>
                    <div className={"block px-4  text-sm "}>
                      <ToggleFilters filter={"landscape"} />
                    </div>
                  </div> */}
                </div>
                <button
                  className="flex items-center justify-center px-4 py-1.5 ml-auto mr-4 text-center border-2 dark:border dark:border-lightBorder hover:bg-lightHighlight rounded-md cursor-pointer dark:hover:bg-darkBorder "
                  onClick={(e) => {
                    e.preventDefault();
                    context.setForceRefresh((f) => f + 1);
                    setOpen(false);
                  }}
                >
                  <h1 className="mb-0.5 text-sm">Apply</h1>
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default FilterModal;
