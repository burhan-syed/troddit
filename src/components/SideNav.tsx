import Login from "./Login";
import NSFWToggle from "./NSFWToggle";
import Sort from "./Sort";
import DropdownPane from "./DropdownPane";
import ThemeToggle from "./ThemeToggle";

const SideNav = ({ visible, toggle }) => {
  return (
    <div>
      <div
        className={
          "absolute h-screen inset-y-0 left-0  space-y-6  transition duration-200 ease-in-out transform -translate-x-full sidebar py-7" +
          `${visible ? "relative translate-x-0 w-screen" : ""}`
        }
      >
        <div className="flex h-screen overflow-y-auto">
          <nav className="w-5/6 sm:w-3/4">
            <Login />
            <DropdownPane hide={visible}/>
            <ThemeToggle />
            <NSFWToggle />
            <Sort />
            <button onClick={() => toggle()}>x</button>
          </nav>
          <div className="w-1/4 bg-black opacity-80" onClick={() => toggle()}>
            second
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideNav;
