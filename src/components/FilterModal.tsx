/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useSession } from "next-auth/react";
import ToggleFilters from "./ToggleFilters";
import { useMainContext } from "../MainContext";
import FilterSubs from "./FilterSubs";
import { BsChevronDown } from "react-icons/bs";

const filters = ["self", "links", "images", "videos", "portrait", "landscape"];

const FilterModal = ({ toOpen }) => {
  const context: any = useMainContext();
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [input, setInput] = useState("");
  const [advancedOpen, setAdvancedOpen] = useState(false);
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
            <div className="inline-block w-full overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl select-none bg-th-background2 sm:my-8 sm:align-middle sm:max-w-lg">
              <div className="relative px-4 pt-5 pb-4 overflow-visible sm:p-6 sm:pb-4">
                <div
                  className="absolute flex items-center justify-center w-8 h-8 ml-auto text-th-border hover:text-th-borderHighlight top-2 right-2 hover:cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <RiArrowGoBackLine className="w-8 h-8 " />
                </div>
                <div className="flex-col mt-2 mb-1 ">
                  {/* //sm:flex sm:items-start "> */}
                  <div className="min-w-full py-1 ">
                    <h1 className="py-1 ">Content Filters</h1>
                    {filters.map((f, i) => (
                      <div key={i}>
                        <div className={"block px-4  text-sm "}>
                          <ToggleFilters filter={f} />
                        </div>
                      </div>
                    ))}
                    <h1 className="py-1 ">Other Filters</h1>
                    <div>
                      <div className={"block px-4  text-sm "}>
                        <ToggleFilters filter={"read"} />
                      </div>
                    </div>
                    <div
                      className="flex flex-row items-center justify-between py-1 mr-4 rounded-md cursor-pointer hover:bg-th-highlight "
                      onClick={() => setAdvancedOpen((o) => !o)}
                    >
                      <h1>Advanced</h1>

                      <BsChevronDown
                        className={
                          (advancedOpen ? "-rotate-180" : "rotate-0") +
                          " transform transition duration-400 mr-4"
                        }
                      />
                    </div>
                    {advancedOpen && (
                      <div className={"flex flex-col gap-4 px-4"}>
                        <div className="flex flex-col px-2">
                          <h2>Subreddit Filters</h2>
                          <h4 className="mb-1 text-xs opacity-70">
                            Hide posts from specific subreddits except when
                            directly viewing
                          </h4>
                          <FilterSubs mode="subs" />
                        </div>
                        <div className="flex flex-col px-2">
                          <h2>User Filters</h2>
                          <h4 className="mb-1 text-xs opacity-70">
                            Hide posts from specific users everywhere except
                            their user profile
                          </h4>
                          <FilterSubs mode="users" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  className="flex items-center justify-center px-4 py-1.5 ml-auto mr-4 text-center border border-th-border hover:bg-th-highlight hover:border-th-borderHighlight rounded-md cursor-pointer  "
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
