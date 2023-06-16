import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useScroll } from "../hooks/useScroll";
const NavMessage = ({ hide, timeSinceNav }) => {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    if (hide || (scrollY ?? 0) >= 200) {
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [hide, scrollY, timeSinceNav]);

  return (
    <div
      className={
        " duration-700 transition-[height] " + (hidden ? " h-0" : "h-12")
      }
    >
      <div
        className={
          "fixed top-0 w-full flex items-center justify-center text-sm text-center text-white bg-rose-700 backdrop-blur-sm h-12 duration-700 transition-transform" +
          (hidden ? " -translate-y-full " : "translate-y-0 ")
        }
      >
        <p>
          Troddit will be closing public access June 30th.
          <br />
          <Link
            href={"/r/TrodditForReddit/comments/14745id/the_future_of_troddit"}
          >
            Join private access or{" "}
            <span className="underline">read more here</span>
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NavMessage;
