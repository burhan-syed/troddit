import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { FaSun } from "react-icons/fa";
import { RiMoonLine } from "react-icons/ri";
import { FaRegMoon } from "react-icons/fa";
import { BiMoon, BiSun } from "react-icons/bi";
import { useEffect, useState } from "react";
const ToggleTheme = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span>Theme</span>
        <ReactSwitch
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          checked={resolvedTheme === "dark"}
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
              <BiMoon />
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
              <BiSun />
            </div>
          }
          offColor="#EA580C"
          onColor={resolvedTheme === "dark" ? "#4B5563" : "#D1D5DB"}
          offHandleColor="#F59E0B"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleTheme;
