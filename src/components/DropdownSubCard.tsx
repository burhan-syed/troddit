import DropdownItem from "./DropdownItem";
import SubButton from "./SubButton";
import { useSession } from "next-auth/client";
const DropdownSubCard = ({ sub, userMode = false }) => {
  const [session] = useSession();
  return (
    <div className="flex flex-row items-center justify-between">
      <DropdownItem sub={sub} />
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
