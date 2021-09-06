import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import NSFWToggle from "./NSFWToggle";
import ThemeToggle from "./ThemeToggle";
const NavMenu = () => {
  const [show, setShow] = useState(false);
  return (
    <div>
      <button onClick={() => setShow((show) => !show)}>
        <BsThreeDotsVertical />
      </button>
      {show ? (
        <div className="absolute right-0 flex">
          <div>
            <ThemeToggle />
            <NSFWToggle />
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default NavMenu;
