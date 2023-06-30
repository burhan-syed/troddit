import React from "react";
import Settings from "../components/settings/Settings";

const SettingsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] mx-auto ">
      <div className="">
        <Settings />
      </div>
    </div>
  );
};

export default SettingsPage;
