import React, { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { useMainContext } from "../../MainContext";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

type Mode = {
  mode: "columns" | "cards";
};

const ColumnCardOptions = ({ mode }: Mode) => {
  const context: any = useMainContext();

  //need to reset wideUI so multi-column (narrow UI doesn't make sense with >1 column) displays properly.
  //Refreshes feed to fix alignment when switching to 1 column and in narrow UI mode
  //Also refreshes feed in mainContext with a useEffect when wideUI is changed if in 1 column mode
  const setColumnCount = (count) => {
    if (count !== context.columnOverride) {
      //if narrow and switching from 1 column force refresh and set to not narrow so feed displays properly
      if (!context.wideUI && context.columnOverride === 1) {
        context.setWideUI((w) => !w);
        //also force a refresh here to rerender feed
        context.setFastRefresh((n) => n + 1);
      }

      //if switching to 1 column and in narrow mode, refresh feed
      else if (count === 1) {
        if (context.wideUI === context.saveWideUI && !context.saveWideUI) {
          context.setFastRefresh((n) => n + 1);
        }
        //otherwise if not in narrow mode just reset the ui
        else {
          context.setWideUI(context.saveWideUI);
        }
      }
      //can't render rows in multi column, fallback to original card
      if (count > 1 && context.cardStyle === "row1") {
        setCardStyle("default");
      }
      //actually change the column count
      context.setColumnOverride(count);
    }
  };
  const setCardStyle = (style) => {
    if (style !== context.cardStyle) {
      //row mode switching to one column, sync wideui
      if (style === "row1") {
        context.setWideUI(context.saveWideUI);
      }
      //when switching to/from row style in narrow mode need to refresh to render properly
      if (
        !context.wideUI &&
        (context.cardStyle === "row1" || style === "row1")
      ) {
        context.setFastRefresh((f) => f + 1);
      }
      context.setCardStyle(style);
    }
  };

  return (
    <Menu as={"div"} className="relative w-full">
      <Menu.Button
        aria-label="options"
        title={"options"}
        name="Options"
        className="w-full py-2 capitalize border rounded-md focus:outline-none hover:bg-th-highlight border-th-border hover:border-th-borderHighlight"
      >
        {mode === "columns"
          ? context.columnOverride == 0
            ? "auto"
            : context.columnOverride == 1
            ? "one"
            : context.columnOverride == 2
            ? "two"
            : context.columnOverride == 3
            ? "three"
            : context.columnOverride == 4
            ? "four"
            : context.columnOverride == 5
            ? "five"
            : context.columnOverride == 7 && "seven"
          : mode === "cards" &&
            (context.cardStyle === "card2"
              ? "Compact"
              : context.cardStyle === "card1" && context.mediaOnly
              ? "Media"
              : context.cardStyle === "row1"
              ? "Rows"
              : "Original")}
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
            "absolute z-10 right-0 mt-1 py-2 w-24 origin-top-left   rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border bg-th-background2 "
          }
        >
          {[0, 1, 2, 3, 4, 5, 7].map((num) => (
            <Menu.Item key={num} disabled={mode !== "columns"}>
              {({ active, disabled }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4 py-2 text-sm cursor-pointer",
                    disabled ? "hidden" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    setColumnCount(num);
                  }}
                >
                  <div className="flex flex-row items-center justify-center h-6 capitalize">
                    {num == 0
                      ? "auto"
                      : num == 1
                      ? "one"
                      : num == 2
                      ? "two"
                      : num == 3
                      ? "three"
                      : num == 4
                      ? "four"
                      : num == 5
                      ? "five"
                      : num == 7 && "seven"}
                  </div>
                </div>
              )}
            </Menu.Item>
          ))}
          {["original", "compact", "media", "rows"].map((card) => (
            <Menu.Item key={card} disabled={mode !== "cards"}>
              {({ active, disabled }) => (
                <div
                  className={classNames(
                    active ? "bg-th-highlight " : "",
                    "block px-4 py-2 text-sm cursor-pointer",
                    disabled ? "hidden" : ""
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    if (card == "original") {
                      setCardStyle("card1");
                      context.setMediaOnly(false);
                    } else if (card == "compact") {
                      setCardStyle("card2");
                      context.setMediaOnly(false);
                    } else if (card == "media") {
                      setCardStyle("card1");
                      context.setMediaOnly(true);
                    } else if (card == "rows") {
                      setCardStyle("row1");
                      context.setMediaOnly(false);
                      context.setColumnOverride(1);
                    }
                  }}
                >
                  <div className="flex flex-row items-center justify-center h-6 capitalize">
                    {card}
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

export default ColumnCardOptions;
