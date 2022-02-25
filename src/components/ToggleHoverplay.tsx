import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsPlay, BsStop } from "react-icons/bs";
import { useMainContext } from "../MainContext";
const ToggleHoverplay = () => {
  const context: any = useMainContext();
  const { theme, setTheme } = useTheme();

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      title={"play videos & gifs on hover"}
    >
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span>Hoverplay</span>
        <ReactSwitch
          onChange={() => context.toggleHoverPlay()}
          checked={context.hoverplay === true}
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
          offColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          onColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          offHandleColor="#0284C7"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleHoverplay;
