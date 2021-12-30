
import DropdownItem from "./DropdownItem";
import SubButton from "./SubButton";
import { useSession } from "next-auth/client";
const DropdownSubCard = ({ sub }) => {
 
  const [session] = useSession();
  return (
    <div className="flex flex-row items-center justify-between">
      <DropdownItem sub={sub} />
      <SubButton sub={session ? sub?.data?.name : sub?.data?.display_name} miniMode={true}/>
    </div>
  );
};

export default DropdownSubCard;
