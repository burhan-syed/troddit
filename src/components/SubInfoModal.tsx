/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useRouter } from "next/router";
import ParseBodyHTML from "./ParseBodyHTML";
import React from "react";

const SubInfoModal = ({ toOpen, descriptionHTML, displayName }) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    toOpen > 0 && setOpen(true);
    return () => {
      //
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
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-75 " />
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
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg md:max-w-3xl lg:max-w-5xl sm:w-full bg-th-background2">
              <div className="relative px-4 pt-5 pb-4 overflow-visible bg-th-background2 sm:p-6 sm:pb-4">
                <button
                  aria-label="exit"
                  ref={cancelButtonRef}
                  className="absolute flex items-center justify-center w-8 h-8 ml-auto top-2 right-2 hover:opacity-60 opacity-40"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <RiArrowGoBackLine className="w-8 h-8 " />
                </button>
                <div className="sm:flex sm:items-start">
                  <div className="mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 "
                    >
                      {displayName}
                    </Dialog.Title>
                    <div className="mt-3">
                      <div
                        onClick={(e) => {
                          const cellText = document.getSelection();
                          //console.log(cellText);
                          if (cellText?.anchorNode?.nodeName != "#text")
                            e.stopPropagation();
                          if (cellText?.type === "Range") e.stopPropagation();
                        }}
                        className="pb-2 pl-3 mr-1 md:pl-0"
                      >
                        <ParseBodyHTML html={descriptionHTML} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default SubInfoModal;
