import React, {useState} from 'react'
import { AiOutlineCheck } from 'react-icons/ai';

const Checkbox = ({toggled, clickEvent, labelText, reverse=false, styles="", groupHover = false}) => {

  const [hovered, setHovered] = useState(false);

  return (
    <button
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      clickEvent(); 
    }}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
    className={"flex outline-none items-center mt-auto  gap-2 group " + (reverse ? " flex-row-reverse " : " flex-row ml-auto ") + styles}
  >
    <h1 className="text-xs">{labelText}</h1>
    <div
      className={
        "w-7 h-7 p-0.5 border rounded-md transition-all flex items-center justify-center   " +
        (toggled
          ? ` bg-th-accent  border-th-accent ring-th-border  ${hovered || groupHover ? " group-hover:ring-2 " : ""}  `
          : ` hover:bg-th-highlight border-th-border  ring-th-accent  ${hovered || groupHover ? " group-hover:border-0 group-hover:ring-2" : ""}`)
      }
    >
      <AiOutlineCheck
        className={
          " w-4 h-4  pt-[1px] pl-[1px] flex-none transition-all text-white" +
          (toggled ? " scale-100 " : " scale-0") + " hover:scale-125 "
        }
      />
    </div>
  </button>
  )
}

export default Checkbox