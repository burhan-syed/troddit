import { ImSpinner2 } from "react-icons/im";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { Transition } from "@headlessui/react";
import { useEffect, useState } from "react";
const ToastCustom = ({ t, message, mode = "" }) => {
  useEffect(() => {
    console.log(t);
  }, [t]);

  return (
    <>
      <div
        className={
          " shadow-2xl transition-all rounded-md select-none border h-14 w-96 md:w-[40rem] lg:w-[52rem] gap-4 xl:w-[56rem] p-2 dark:border-darkBorder border-lightBorder bg-lightBG dark:bg-darkBG flex items-center justify-start " +
          (t.visible ? " " : "  ")
        }
      >
        <div className="flex justify-center w-14 ">
          {mode === "loading" ? (
            <ImSpinner2 className="flex-none w-6 h-6 animate-spin" />
          ) : (
            <Transition
              show={true}
              enter="transition-transform  duration-100"
              enterFrom="scale-50"
              enterTo="scale-100"
              leave="transition-transform  duration-100"
              leaveFrom="scale-100"
              leaveTo="scale-50"
            >
              {mode === "error" ? (
                <AiOutlineClose className="flex-none w-6 h-6 p-1 font-bold text-white bg-red-500 rounded-full dark:bg-red-800 " />
              ) : (
                <AiOutlineCheck className="flex-none w-6 h-6 p-1 font-bold text-white rounded-full dark:bg-emerald-600 bg-emerald-500" />
              )}
            </Transition>
          )}
        </div>
        <div className="flex justify-start flex-grow truncate ">
          <h1>{message}</h1>
        </div>
      </div>
    </>
  );
};

export default ToastCustom;
