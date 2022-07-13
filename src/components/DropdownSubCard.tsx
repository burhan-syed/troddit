import DropdownItem from "./DropdownItem";
import SubButton from "./SubButton";
import { useSession } from "next-auth/react";
import React from "react";
const DropdownSubCard = ({ sub, userMode = false }) => {
  const { data: session, status } = useSession();
  return (
    <div className="flex flex-row items-center justify-between">
      <DropdownItem sub={sub} showFavorite={false} />
      <div className="w-6 h-6 ">
        <SubButton
          sub={sub?.data?.display_name}
          miniMode={true}
          userMode={userMode}
        />
      </div>
    </div>
  );
};

export default DropdownSubCard;
