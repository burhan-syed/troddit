import React from "react";
import Settings from "../components/settings/Settings";

const SettingsPage = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen mx-auto -mt-16 ">
      <div className="absolute top-28">
      <Settings />

      </div>
    </div>
  );
};

export default SettingsPage;
