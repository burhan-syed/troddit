import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { BsFilterRight } from "react-icons/bs";
import {FiFilter} from 'react-icons/fi'
import ToggleTheme from "./ToggleTheme";
import ToggleNSFW from "./ToggleNSFW";
import ToggleAutoplay from "./ToggleAutoplay";
import Link from "next/link";
import ToggleMaximize from "./ToggleMaximize";
import { useMainContext } from "../MainContext";
import ToggleMediaOnly from "./ToggleMediaOnly";
import ToggleAudioOnHover from "./ToggleAudioOnHover";
import ToggleFilters from "./ToggleFilters";


function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}
const filters = ['images','videos','self', 'links'];

const FilterMenu = ({ hide = false }) => {
  const context: any = useMainContext();
 
  return (
    <Menu
      as="div"
      className="relative flex flex-col items-center flex-grow w-full h-full select-none"
    >
      <div className="flex-grow w-full">
        <Menu.Button
          name="Options"
          className="flex flex-row items-center justify-center w-full h-full bg-white border border-white rounded-md hover:border-lightBorder dark:hover:border-darkBorder dark:bg-darkBG dark:border-darkBG focus:outline-none"
        >
          <FiFilter className="flex-none w-5 h-5" />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items
          className={
            "absolute right-0 w-40 mt-11 origin-top-right bbg-white dark:bg-darkBG bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-lightBorder dark:border-darkBorder " +
            (hide && " hidden")
          }
        >
          <div className="py-1">
            {filters.map((f,i) => (
              <Menu.Item key={i}>
              {({ active }) => (
                <div
                  className={classNames(
                    active ? "bg-lightHighlight dark:bg-darkHighlight" : "",
                    "block px-4 py-2 text-sm"
                  )}
                >
                  <ToggleFilters filter={f} />
                </div>
              )}
            </Menu.Item>
            ))}
            </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default FilterMenu;
