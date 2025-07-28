import React, { useEffect, useState } from "react";
import { useScroll } from "../hooks/useScroll";
import { IoCloseOutline } from "react-icons/io5";

const newApp = process.env.NEXT_PUBLIC_NEW_APP;
const newAppUrl = process.env.NEXT_PUBLIC_NEW_URL;

const NavMessage = ({ hide, timeSinceNav, onHide }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (hide || (scrollY ?? 0) >= 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [hide, scrollY, timeSinceNav]);

  const isHidden = hidden;

  return (
    <div
      className={
        " duration-700 transition-[height] " + (isHidden ? " h-0" : "h-12")
      }
    >
      <div
        className={
          "fixed top-0 w-full flex items-center justify-center text-sm text-center text-white bg-th-accent backdrop-blur-sm h-12 duration-700 transition-transform" +
          (isHidden ? " -translate-y-full " : "translate-y-0 ")
        }
      >
        <p className="font-semibold">
          Try the new beta at{" "}
          <a href={newAppUrl} className="font-bold underline" target="_blank">
            {newApp}
          </a>
        </p>
        <button onClick={onHide} className="absolute right-5">
          <IoCloseOutline />
          <span className="sr-only">hide</span>
        </button>
      </div>
    </div>
  );
};

export default NavMessage;
