import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import ReactSwitch from "react-switch";
import { useMainContext } from "../MainContext";
import { BiComment, BiDetail } from "react-icons/bi";

const ToggleUserPostType = () => {
  const context: any = useMainContext();
  const { userPostType, toggleUserPostType } = context;
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div onClick={(e) => e.stopPropagation()} title={"toggle links/comments"}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span className="mr-2">Type</span>
        <ReactSwitch
          onChange={toggleUserPostType}
          checked={userPostType === "links"}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BiDetail />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BiComment />
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

export default ToggleUserPostType;
