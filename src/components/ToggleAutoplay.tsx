import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsPlay, BsStop } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { useEffect, useState } from "react";
const ToggleAutoplay = () => {
  const context: any = useMainContext();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;
  return (
    <div onClick={(e) => e.stopPropagation()} title={"autoplay videos & gifs"}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span>Autoplay</span>
        <ReactSwitch
          onChange={() => context.toggleAutoplay()}
          checked={context.autoplay === true}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BsPlay />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BsStop />
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

export default ToggleAutoplay;
