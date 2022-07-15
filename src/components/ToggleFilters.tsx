import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsX, BsCheck } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import React, { useEffect, useState } from "react";
import useRefresh from "../hooks/useRefresh";
const ToggleFilters = ({ filter, withSubtext = false, quickToggle = false}) => {
  const context: any = useMainContext();
  const {invalidateKey} = useRefresh(); 
  const { theme, resolvedTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  const [title, setTitle] = useState("filter toggle");
  const [subtext, setSubtext] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const [filterName, setFilterName] = useState("");

  useEffect(() => {
    //console.log(filter, context.filters, context.filters.filter)
    let f = "";
    switch (filter) {
      case "seen":
        setSubtext("Will attempt to filter seen posts if toggled off");
        f = "seenFilter";
        break;
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
    setFilterName(f);

 
  }, [filter]);

  const [toggled,setToggled] = useState(false);

  useEffect(() => {
    if (filterName){
      context[filterName] ? setChecked(true) : setChecked(false);
      if (quickToggle && toggled){
        context.applyFilters(); 
        invalidateKey(["feed"], true); 
      }
    }
  
  }, [context?.[filterName]])
  

  const [onHandleColor, setOnHandleColor] = useState<string>();
  const [offHandleColor, setOffHandleColor] = useState<string>();
  const [onColor, setOnColor] = useState<string>();
  const [offColor, setOffColor] = useState<string>();
  const [updateTheme, setUpdateTheme] = useState(0);
  useEffect(() => {
    setUpdateTheme((t) => t + 1);
  }, [resolvedTheme]);
  useEffect(() => {
    let toggleColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--toggleColor")
      .trim();
    let toggleHandleColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--toggleHandleColor")
      .trim();

    setOnHandleColor(() => toggleHandleColor
    );
    setOffHandleColor(() => toggleHandleColor
    );
    setOnColor(() => toggleColor);
    setOffColor(() =>toggleColor
    );
  }, [updateTheme]);


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
          onChange={() => {setToggled(true);context.toggleFilter(filter);}}
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
          offColor={offColor}
          onColor={onColor}
          offHandleColor={offHandleColor}
          onHandleColor={onHandleColor}
        />
      </label>
    </div>
  );
};

export default ToggleFilters;
