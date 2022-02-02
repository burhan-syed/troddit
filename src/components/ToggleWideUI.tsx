import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { CgArrowsShrinkH, CgArrowsMergeAltH } from "react-icons/cg";
import { useMainContext } from "../MainContext";
const ToggleWideUI = () => {
  const context: any = useMainContext();
  const { theme, setTheme } = useTheme();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span className="cursor-pointer">Wide UI</span>
        <ReactSwitch
          onChange={() => context.toggleWideUI()}
          checked={context.saveWideUI === true}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">
              <CgArrowsShrinkH />
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
              <CgArrowsMergeAltH />
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

export default ToggleWideUI;
