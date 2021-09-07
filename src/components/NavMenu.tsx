import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import NSFWToggle from "./NSFWToggle";
import ThemeToggle from "./ThemeToggle";
const NavMenu = ({ hide }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="flex flex-row items-center w-full h-full border border-green-400 select-none hover:cursor-pointer">
      {/* Close when clicking outisde element */}
      <div
        className={
          (show && !hide ? "" : "w-0 h-0") +
          "absolute top-0 left-0 w-screen h-screen bg-transparent "
        }
        onClick={() => setShow((show) => !show)}
      ></div>

      <div>
        <div onClick={() => setShow((show) => !show)}>
          <BsThreeDotsVertical />
        </div>
        <div className="absolute right-1 top-12">
          <div
            className={
              "transform transition duration-150 ease-in-out origin-top-right bg-white border " +
              `${show && !hide ? "scale-100 block" : " scale-0"}`
            }
          >
            <div className="flex-col p-0 m-3 my-5 space-y-6 list-none">
            <ThemeToggle />
            <NSFWToggle />
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavMenu;
