import { useTheme } from "next-themes";
import ReactSwitch from "react-switch";
import { BsX,BsCheck } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { useEffect, useState } from "react";
const ToggleFilters = ({filter}) => {
  const context: any = useMainContext();
  const { theme, setTheme } = useTheme();
  const [checked, setChecked] = useState(false);
  useEffect(() => {
    //console.log(filter, context.filters, context.filters.filter)
    let f = "";
    switch (filter){
      case 'images':
        f = 'imgFilter';
        break; 
      case 'videos':
        f = 'vidFilter';
        break;
      case 'galleries':
        f = 'galFilter';
        break;
      case 'self':
        f = 'selfFilter';
        break;
      case 'links':
        f = 'linkFilter';
        break;
    }
    //console.log(filter, f, context[f])
    context[f] ? setChecked(true) : setChecked(false)
  }, [context, filter]);
  

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <label className="flex flex-row items-center justify-between cursor-pointer">
        <span className="capitalize">{filter}</span>
        <ReactSwitch
          onChange={() => context.toggleFilter(filter)}
          checked={checked}
          checkedHandleIcon={<div></div>}
          checkedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">

              <BsCheck />
            </div>
          }
          uncheckedHandleIcon={<div></div>}
          uncheckedIcon={
            <div className="flex items-center justify-center h-full text-lg font-white dark:font-darkBG">

              <BsX />
            </div>
          }
          offColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          onColor={theme === "dark" ? "#4B5563" : "#D1D5DB"}
          offHandleColor="#0284C7"
          onHandleColor="#0284C7"
        />
      </label>
    </div>
  );
};

export default ToggleFilters;
