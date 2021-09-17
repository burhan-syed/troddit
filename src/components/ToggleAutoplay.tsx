import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsPlay,BsStop } from "react-icons/bs";
import { useMainContext } from "../MainContext";
const ToggleAutoplay = () => {
  const context: any = useMainContext();

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="flex flex-row items-center justify-between">
        <span>Autoplay</span>
        <ReactSwitch
          onChange={() => context.toggleAutoplay()}
          checked={context.autoplay === true}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100%",
                color: "white",
                fontSize: 18,
              }}
            >
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
          onColor="#4B5563"
          offHandleColor="#F59E0B"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleAutoplay;
