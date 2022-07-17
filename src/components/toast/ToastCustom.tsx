import { ImSpinner2 } from "react-icons/im";
import {
  AiOutlineCheck,
  AiOutlineClose,
  AiOutlineExclamation,
} from "react-icons/ai";
import { Transition } from "@headlessui/react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Toast } from "react-hot-toast/dist/core/types";

interface ToastCustomParams {
  t: Toast;
  message: string;
  mode?: "loading" | "error" | "version" | "alert" | "success" | "new_posts";
  action?: Function;
  actionLabel?: string;
}

const ToastCustom: React.FC<ToastCustomParams> = ({
  t,
  message,
  mode = "",
  action,
  actionLabel = "",
}) => {
  const toastdiv = (
    <div
      onClick={() => !action && toast.remove(t.id)}
      className={
        " shadow-2xl transition-all rounded-md select-none border   gap-4   border-th-border bg-th-background2 flex items-center justify-start " +
        (t.visible ? " " : "  ") +
        (mode === "new_posts"
          ? " w-screen md:w-auto "
          : "p-2 h-14 w-96 md:w-[40rem] lg:w-[52rem] xl:w-[56rem]")
      }
    >
      {mode !== "new_posts" && (
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
                <AiOutlineClose className="flex-none w-6 h-6 p-1 font-bold text-white rounded-full bg-th-red " />
              ) : mode === "alert" ? (
                <AiOutlineExclamation className="flex-none w-6 h-6 p-1 text-white rounded-full bg-th-accent " />
              ) : (
                <AiOutlineCheck className="flex-none w-6 h-6 p-1 font-bold text-white rounded-full bg-emerald-600 " />
              )}
            </Transition>
          )}
        </div>
      )}

      {mode === "new_posts" ? (
        <div className="flex items-center flex-grow gap-2 p-1.5 px-3">
          <div className="flex flex-grow md:flex-col">
            <h1 className="md:text-xs">{message}</h1>
            <h2 className="ml-auto md:text-sm">Update feed?</h2>
          </div>

          <div className="flex gap-1 ml-auto md:flex-col-reverse ">
            <button
              aria-label="apply"
              className="flex items-center gap-2 cursor-pointer group"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                action();
                toast.remove(t.id);
              }}
            >
              <div className="flex items-center justify-center p-1 border rounded-md border-th-border group-hover:border-th-borderHighlight">
                <AiOutlineCheck className="" />
              </div>
            </button>
            <button
              aria-label="close"
              className="flex items-center justify-center p-1 border rounded-md border-th-border hover:border-th-borderHighlight bg-th-background2"
              onClick={() => toast.remove(t.id)}
            >
              <AiOutlineClose className="" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap justify-between flex-grow truncate ">
          <h1 className="">{message}</h1>
        </div>
      )}
    </div>
  );
  if (mode === "version") {
    return (
      <Link href="/changelog">
        <a>{toastdiv}</a>
      </Link>
    );
  }
  return <>{toastdiv}</>;
};

export default ToastCustom;
