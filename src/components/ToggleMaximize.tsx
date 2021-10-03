import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsPlay,BsStop } from "react-icons/bs";
import { useMainContext } from "../MainContext";
const ToggleMaximize = () => {
  const context: any = useMainContext();
  const { theme, setTheme } = useTheme();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span className="cursor-pointer">Maximize</span>
        <ReactSwitch
          onChange={() => context.toggleMaximize()}
          checked={context.maximize === true}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">

              <BsPlay />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "#FFFBEB",
                fontSize: 18,
              }}
            >
              <BsStop />
            </div>
          }
          offColor="#EA580C"
          onColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          offHandleColor="#F59E0B"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleMaximize;
