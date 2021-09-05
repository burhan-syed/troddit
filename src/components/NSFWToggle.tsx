import { useMainContext } from "../MainContext";
import ReactSwitch from "react-switch";

const NSFWToggle = () => {
  const context: any = useMainContext();
  return (
    <div>
      <ReactSwitch
        onChange={() => context.toggleNSFW()}
        checked={context.nsfw === true}
      />
    </div>
  );
};

export default NSFWToggle;
