
import DropdownItem from "./DropdownItem";
import SubButton from "./SubButton";
const DropdownSubCard = ({ sub }) => {
 

  return (
    <div className="flex flex-row items-center justify-between">
      <DropdownItem sub={sub} />
      <SubButton sub={sub?.data?.name} miniMode={true}/>
    </div>
  );
};

export default DropdownSubCard;
