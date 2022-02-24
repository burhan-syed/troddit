import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsX, BsCheck } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { useEffect, useState } from "react";
const ToggleFilters = ({ filter }) => {
  const context: any = useMainContext();
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [title, setTitle] = useState("filter toggle");
  useEffect(() => {
    //console.log(filter, context.filters, context.filters.filter)
    let f = "";
    switch (filter) {
      case "images":
        f = "imgFilter";
        break;
      case "videos":
        f = "vidFilter";
        break;
      case "galleries":
        f = "galFilter";
        break;
      case "self":
        f = "selfFilter";
        break;
      case "links":
        f = "linkFilter";
        break;
      case "score":
        f = "scoreFilter";
        break;
      case "portrait":
        f = "imgPortraitFilter";
        break;
      case "landscape":
        f = "imgLandscapeFilter";
        break;
    }
    setTitle(
      `${context[f] ? "Showing" : "Filtering"} ${
        filter === "links"
          ? "link posts"
          : filter === "self"
          ? "self posts"
          : filter === "portrait" || filter === "landscape"
          ? `${filter} images/videos`
          : filter
      } `
    );
    //console.log(filter, f, context[f])
    context[f] ? setChecked(true) : setChecked(false);
  }, [context, filter]);

  return (
    <div
      title={title}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg group dark:hover:bg-darkPostHover hover:bg-lightHighlight"
    >
      <label className="flex flex-row items-center justify-between p-2 cursor-pointer ">
        <span className="capitalize ">{filter}</span>
        <ReactSwitch
          onChange={() => context.toggleFilter(filter)}
          checked={checked}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BsCheck />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BsX />
            </div>
          }
          offColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          onColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          offHandleColor="#0284C7"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleFilters;
