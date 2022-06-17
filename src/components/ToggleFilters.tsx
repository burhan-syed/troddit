import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsX, BsCheck } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { useEffect, useState } from "react";
const ToggleFilters = ({ filter, withSubtext = false }) => {
  const context: any = useMainContext();
  const { theme, resolvedTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [title, setTitle] = useState("filter toggle");
  const [subtext, setSubtext] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    //console.log(filter, context.filters, context.filters.filter)
    let f = "";
    switch (filter) {
      case "read":
        setSubtext("Filter or show read posts");
        f = "readFilter";
        break;
      case "images":
        setSubtext("Filter or show images");
        f = "imgFilter";
        break;
      case "videos":
        setSubtext(
          "Filter or show videos (or gifs). Only applies to native videos."
        );
        f = "vidFilter";
        break;
      case "galleries":
        setSubtext("Filter or show image galleries");
        f = "galFilter";
        break;
      case "self":
        setSubtext("Filter or show 'self' posts.");
        f = "selfFilter";
        break;
      case "links":
        setSubtext("Filter or show posts with an external link source");
        f = "linkFilter";
        break;
      case "score":
        f = "scoreFilter";
        break;
      case "portrait":
        setSubtext("Filter or show images / videos with portrait orientation");
        f = "imgPortraitFilter";
        break;
      case "landscape":
        setSubtext("Filter or show images / videos with landscape orientation");
        f = "imgLandscapeFilter";
        break;
    }
    setTitle(
      `${context[f] ? "Showing" : "Filtering"} ${
        filter === "links"
          ? "link posts"
          : filter === "self"
          ? "self posts"
          : filter === "read"
          ? "read posts"
          : filter === "portrait" || filter === "landscape"
          ? `${filter} images/videos`
          : filter
      } `
    );
    //console.log(filter, f, context[f])
    context[f] ? setChecked(true) : setChecked(false);
  }, [context, filter]);
  if (!mounted) return null;

  return (
    <div
      title={title}
      onClick={(e) => e.stopPropagation()}
      className="rounded-lg group hover:bg-th-highlight"
    >
      <label className="flex flex-row items-center justify-between p-2 cursor-pointer ">
        <span className="flex flex-col">
          <span className="capitalize ">{filter}</span>
          {withSubtext && (
            <span className="mr-2 text-xs opacity-70">{subtext}</span>
          )}
        </span>
        <ReactSwitch
          onChange={() => context.toggleFilter(filter)}
          checked={checked}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg ">
              <BsCheck />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg ">
              <BsX />
            </div>
          }
          offColor={resolvedTheme === "dark" ? "#4B5563" : "#D1D5DB"}
          onColor={resolvedTheme === "dark" ? "#4B5563" : "#D1D5DB"}
          offHandleColor="#0284C7"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleFilters;
