import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsVolumeMute, BsVolumeUp } from "react-icons/bs";
import { useMainContext } from "../MainContext";
const ToggleAudioOnHover = () => {
  const context: any = useMainContext();
  const { theme, setTheme } = useTheme();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      title={"unmute on video hover or post open"}
    >
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span className="">Audio</span>
        <ReactSwitch
          onChange={() => context.toggleAudioOnHover()}
          checked={context.audioOnHover === true}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BsVolumeUp />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <BsVolumeMute />
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

export default ToggleAudioOnHover;
