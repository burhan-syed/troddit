import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";

const SimpleDropDownSelector = ({
  selected,
  onSelect,
  items,
  buttonName,
  buttonAriaLabel,
  buttonTitle,
}: {
  selected: string;
  onSelect(item: any): any;
  items: { [x: string]: { name?: string } | string };
  buttonName: string;
  buttonAriaLabel?: string;
  buttonTitle?: string;
}) => {
  return (
    <Menu as={"div"} className="relative w-full">
      <Menu.Button
        aria-label={
          buttonAriaLabel === "" ? undefined : buttonAriaLabel ?? buttonName
        }
        title={buttonTitle === "" ? undefined : buttonTitle ?? buttonName}
        name={buttonName}
        className="w-full p-2 capitalize border rounded-md focus:outline-none hover:bg-th-highlight border-th-border hover:border-th-borderHighlight"
      >
        {selected}
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
          {Object.keys(items).map((key) => (
            <Menu.Item key={key}>
              {({ active, disabled }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4 py-2 text-sm cursor-pointer",
                    disabled ? "hidden" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    onSelect(key);
                  }}
                >
                  <span className="flex flex-row items-center justify-center h-6 capitalize">
                    {(items[key] as { [x: string]: { name?: string } })?.name ??
                      items[key] ??
                      key}
                  </span>
                </div>
              )}
            </Menu.Item>
          ))}
        </Menu.Items>
      </Transition>
    </Menu>
  );
};

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default SimpleDropDownSelector;
