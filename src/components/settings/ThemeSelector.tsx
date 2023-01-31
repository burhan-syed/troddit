import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import SimpleDropDownSelector from "../ui/SimpleDropDownSelector";

const THEMES = {
  system: { name: "system" },
  light: { name: "light" },
  dark: { name: "dark" },
  abyss: { name: "abyss" },
  black: { name: "black" },
  dracula: { name: "dracula" },
  nord: { name: "nord" },
  ocean: { name: "ocean" },
  palenight: { name: "palenight" },
};


const ThemeSelector = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      <SimpleDropDownSelector
        buttonName="theme options"
        onSelect={setTheme}
        items={THEMES}
        selected={
          mounted ? (theme == "system" ? `System` : THEMES?.[theme]?.name) : ""
        }
      />
    </>
  );
};

export default ThemeSelector;
