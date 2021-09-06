import { useMainContext } from "../MainContext";
import ReactSwitch from "react-switch";

const NSFWToggle = () => {
  const context: any = useMainContext();
  return (
    <div>
      <label>
        <span>NSFW</span>

        <ReactSwitch
          onChange={() => context.toggleNSFW()}
          checked={context.nsfw === true}
        />
      </label>
    </div>
  );
};

export default NSFWToggle;
