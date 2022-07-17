import { Menu, Transition } from "@headlessui/react";
import { useTheme } from "next-themes";
import React, { Fragment, useEffect, useState } from "react";

const THEMES = {
  system: { name: "system" },
  light: { name: "light" },
  dark: { name: "dark" },
  abyss: { name: "abyss" },
  black: { name: "black" },
  dracula: { name: "dracula" },
  nord: { name: "nord" },
  ocean: { name: "ocean" },
  palenight: { name: "palenight" },
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <Menu as={"div"} className="relative w-full">
      <Menu.Button
        aria-label="options"
        title={"options"}
        name="Options"
        className="w-full py-2 capitalize border rounded-md focus:outline-none hover:bg-th-highlight border-th-border hover:border-th-borderHighlight"
      >
        {/* {theme} { resolvedTheme} */}
        {mounted ? (theme == "system" ? `System` : THEMES?.[theme]?.name) : ""}
      </Menu.Button>
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
            "absolute z-10 right-0 mt-1 py-2 w-full origin-top   rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border bg-th-background2 "
          }
        >
          {Object.keys(THEMES).map((themeOption) => (
            <Menu.Item key={themeOption}>
              {({ active, disabled }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4 py-2 text-sm cursor-pointer",
                    disabled ? "hidden" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setTheme(themeOption);
                  }}
                >
                  <div className="flex flex-row items-center justify-center h-6 capitalize">
                    {THEMES[themeOption].name}
                  </div>
                </div>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

export default ThemeSelector;
