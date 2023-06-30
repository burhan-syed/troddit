/* This example requires Tailwind CSS v2.0+ */
import { Fragment, useEffect, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useSession } from "next-auth/react";
import { useSubsContext } from "../MySubs";
import React from "react";

const MultiManageModal = ({ toOpen, subreddits, multiname = "", mode }) => {
  const { data: session, status } = useSession();
  const subsContext: any = useSubsContext();
  const { createLocalMulti, createRedditMulti } = subsContext;
  const [open, setOpen] = useState(false);
  const cancelButtonRef = useRef(null);
  const [input, setInput] = useState("");
  const [subsForMulti, setSubsForMulti] = useState<string[]>([]);
  const [err, setErr] = useState("");
  const [waiting, setWaiting] = useState(false);

  useEffect(() => {
    setSubsForMulti(subreddits);
  }, [subreddits]);

  useEffect(() => {
    toOpen > 0 && setOpen(true);
    return () => {
      setInput("");
      setWaiting(false);
      setErr("");
    };
  }, [toOpen]);

  const toggleSelect = () => {
    if (subsForMulti.length > 0) {
      setSubsForMulti([]);
    } else {
      setSubsForMulti(subreddits);
    }
  };

  const toggleSubSelect = (sub) => {
    if (subsForMulti.includes(sub)) {
      setSubsForMulti((s) => s.filter((n) => n !== sub));
    } else {
      setSubsForMulti((s) => [...s, sub]);
    }
  };

  const createMultiButton = async () => {
    if (input.length === 0) {
      setErr("Enter Feed Name");
    } else if (input.length > 50) {
      setErr("Max Name Length is 50 Characters");
    } else if (!waiting) {
      setErr("");
      if (subsForMulti.length > 0) {
        if (session) {
          setWaiting(true);
          let res = await createRedditMulti(
            input,
            subsForMulti,
            session?.user?.name
          );
          if (!res) setErr("Feed Already Exists");
          else {
            setWaiting(false);
            setOpen(false);
          }
        } else {
          setWaiting(true);
          let res = await createLocalMulti(input, subsForMulti);
          if (res) setOpen(false);
          else {
            setWaiting(false);
            setErr("Feed Already Exists");
          }
        }
      }
    }
  };

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
            <div className="inline-block overflow-hidden text-left align-bottom transition-all transform rounded-lg shadow-xl bg-th-background2 sm:my-8 sm:align-middle sm:max-w-lg md:max-w-3xl lg:max-w-5xl sm:w-full">
              <div className="relative px-4 pt-5 pb-4 overflow-visible sm:p-6 sm:pb-4">
                <div
                  className="absolute flex items-center justify-center w-8 h-8 ml-auto top-2 right-2 opacity-40 hover:opacity-60 hover:cursor-pointer"
                  onClick={() => {
                    setOpen(false);
                  }}
                >
                  <RiArrowGoBackLine className="w-8 h-8 " />
                </div>
                <div className="mt-3 sm:flex sm:items-start">
                  <div className="min-w-full mt-4 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <div className="mt-3">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        {subreddits.map((s, i) => (
                          <div
                            key={s}
                            className={
                              "flex items-center justify-between " +
                              (i === subreddits.length - 1 &&
                                subreddits.length > 5 &&
                                " min-w-full")
                            }
                          >
                            <div
                              className={
                                "flex items-center px-3 py-1 border rounded-full select-none bg-th-base border-th-border hover:bg-th-highlight cursor-pointer " +
                                (subsForMulti.includes(s)
                                  ? " ring-2 ring-th-accent border-transparent "
                                  : " ")
                              }
                              onClick={() => toggleSubSelect(s)}
                            >
                              <h1>{s}</h1>
                            </div>
                            {i === subreddits.length - 1 &&
                              subreddits.length > 5 && (
                                <div className="mb-2 mr-4 cursor-pointer select-none hover:font-semibold ">
                                  <div onClick={toggleSelect}>{`Select ${
                                    subsForMulti.length > 0 ? "None" : "All"
                                  }`}</div>
                                </div>
                              )}
                          </div>
                        ))}
                      </div>

                      <form
                        className="w-full "
                        onSubmit={(e) => {
                          e.preventDefault();
                          createMultiButton();
                        }}
                      >
                        <div className="flex items-center py-2 border-b border-th-border">
                          <input
                            className="w-full px-2 py-1 mr-3 leading-tight bg-transparent border-none appearance-none focus:outline-none"
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="New Feed Name"
                            aria-label="Feed name"
                          />
                          <button
                            aria-label="create"
                            onClick={createMultiButton}
                            className={
                              (waiting
                                ? " opacity-50 "
                                : " hover:border-th-borderHighlight ") +
                              " flex-shrink-0 px-2 py-1  border-th-border hover:border-th-borderHighlight hover:bg-th-highlight border rounded-md   focus:outline-none "
                            }
                            type="button"
                          >
                            {`Create`}
                          </button>
                        </div>
                      </form>
                      <div className="flex items-center justify-between text-xs">
                        {subsForMulti.length === 0 ? (
                          <h1 className="italic text-th-red">
                            {"Select 1 Sub Minimum"}
                          </h1>
                        ) : subsForMulti.length > 1 ? (
                          <h1>{`Creating feed with ${subsForMulti.length} sub${
                            subsForMulti.length > 1 ? "s" : ""
                          }`}</h1>
                        ) : (
                          <h1 className="text-transparent select-none ">a</h1>
                        )}
                        {err && <h1 className="italic text-th-red">{err}</h1>}
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

export default MultiManageModal;
