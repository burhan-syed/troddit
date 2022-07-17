/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { MdErrorOutline } from "react-icons/md";
import { useMainContext } from "../MainContext";
import { signIn } from "next-auth/react";
import { usePlausible } from "next-plausible";
import React from "react";

const Login = () => {
  const [open, setOpen] = useState(false);
  const context: any = useMainContext();
  const cancelButtonRef = useRef(null);
  const plausible = usePlausible();
  useEffect(() => {
    if (context.loginModal) {
      plausible("loginPrompt");
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [context]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-50 overflow-y-auto"
        initialFocus={cancelButtonRef}
        onClose={context.toggleLoginModal}
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
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full bg-th-base">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4 bg-th-base">
                <div className="sm:flex sm:items-start">
                  <div className="flex items-center justify-center flex-shrink-0 w-12 h-12 mx-auto rounded-full sm:mx-0 sm:h-10 sm:w-10 ">
                    <MdErrorOutline
                      className="w-6 h-6 text-th-red"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-th-text"
                    >
                      Login Needed
                    </Dialog.Title>
                    <div className="mt-3">
                      <p className="text-sm text-th-text opacity-80">
                        A login is required to vote and access additional
                        features. You can login with your Reddit account below.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 bg-th-background2 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  aria-label="sign in"
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium border border-transparent rounded-md shadow-sm bg-th-accent hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    context.setLoginModal(false);
                    signIn("reddit");
                  }}
                >
                  Login
                </button>
                <button
                  aria-label="cancel"
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-black bg-white border rounded-md shadow-sm border-th-border hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => context.setLoginModal(false)}
                  ref={cancelButtonRef}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Login;
