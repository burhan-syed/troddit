import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div className="flex flex-row">
      <label>
        <span>Theme</span>
        <ReactSwitch
          onChange={() => setTheme(theme === "dark" ? "light" : "dark")}
          checked={theme === "light"}
        />
      </label>
    </div>
  );
};

export default ThemeToggle;
