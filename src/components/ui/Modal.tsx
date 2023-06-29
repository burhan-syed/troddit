/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RiArrowGoBackLine } from "react-icons/ri";
import React from "react";

const Modal = ({
  toOpen,
  children,
  onClose,
  initialFocus,
}: {
  toOpen: number;
  children: React.ReactElement;
  onClose?: () => any;
  initialFocus?: React.MutableRefObject<any>;
}) => {
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [input, setInput] = useState("");
  useEffect(() => {
    setOpen(toOpen > 0);
    return () => {
      setInput("");
    };
  }, [toOpen]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={initialFocus ? initialFocus : cancelButtonRef}
        onClose={() => (onClose ? onClose() : setOpen(false))}
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
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-800 bg-opacity-80" />
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
            {children}
            {/* <div className="inline-block w-full overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl select-none sm:my-8 sm:align-middle sm:max-w-2xl">
              <div className="relative">
                <div
                  className="flex items-center justify-center w-8 h-8 mb-4 ml-auto top-2 opacity-60 hover:opacity-100 right-2 hover:cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <RiArrowGoBackLine className="w-8 h-8 text-white " />
                </div>
                {children}
              </div>
            </div> */}
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Modal;
