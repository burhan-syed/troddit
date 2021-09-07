import { useMainContext } from "../MainContext";
import ReactSwitch from "react-switch";

const NSFWToggle = () => {
  const context: any = useMainContext();
  return (
    <div>
      <label className="flex flex-row items-center justify-between">
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
