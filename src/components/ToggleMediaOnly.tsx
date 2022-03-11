import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsCardHeading, BsArrowsAngleExpand } from "react-icons/bs";
import { AiOutlineShrink, AiOutlineExpandAlt } from "react-icons/ai";
import { useMainContext } from "../MainContext";
import { useEffect, useState } from "react";
const ToggleMediaOnly = () => {
  const context: any = useMainContext();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span className="">Cards</span>
        <ReactSwitch
          onChange={() => context.toggleMediaOnly()}
          checked={context.mediaOnly === false}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <AiOutlineShrink />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <AiOutlineExpandAlt />
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

export default ToggleMediaOnly;
