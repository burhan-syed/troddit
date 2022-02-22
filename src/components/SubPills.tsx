import { useEffect, useRef } from "react";
import { AiOutlinePlus } from "react-icons/ai";


const SubPills = ({subArray, currMulti, multiSub, goToMulti, goToMultiSub, removeSub}) => {
 
  const pillsRef: any = useRef();
  useEffect(() => {
    const el = pillsRef.current;
    if (el) {
      const onWheel = (e) => {
        if (e.deltaY == 0) return;
        e.preventDefault();
        el.scrollTo({
          left: el.scrollLeft + e.deltaY * 2,
          behavior: "smooth",
        });
      };
      el.addEventListener("wheel", onWheel);
      return () => el.removeEventListener("wheel", onWheel);
    }
  }, []);
 
  return (
    <div className="">
    <div
      className={
        (subArray?.length < 12 ? "md:w-11/12 mx-auto " : " ") +
        " flex items-center justify-start text-sm space-x-2"
      }
    >
      <div onClick={(e) => goToMulti(e)} className="flex-none">
        <a
          href={`${subArray.join("+")}${
            currMulti ? `?m=${currMulti}` : ""
          }`}
        >
          <div
            className={
              "items-center px-4 py-1.5 text-center border rounded-md select-none  dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover" +
              (multiSub === "" && "  ring-2")
            }
          >
            {`${currMulti ? `${currMulti}` : "Multi"} (${
              subArray.length
            })`}
          </div>
        </a>
      </div>
      <div
        ref={pillsRef}
        className="flex p-1 space-x-2 overflow-x-scroll capitalize scrollbar-none"
      >
        {subArray.map((s) => (
          <div
            onClick={(e) => {
              goToMultiSub(e, s);
            }}
            key={s}
          >
            <a href={`${s}`}>
              <div
                className={
                  "flex items-center px-3 py-1 space-x-2 border rounded-full select-none dark:bg-trueGray-900 border-lightBorder bg-lightPost dark:border-2 dark:border-darkPostHover hover:bg-lightHighlight dark:hover:bg-darkPostHover" +
                  (s.toUpperCase() === multiSub.toUpperCase() &&
                    "  ring-2")
                }
              >
                <h1 className="">{s}</h1>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    removeSub(s);
                  }}
                  className=" border rounded-full p-0.5 dark:border-darkPostHover dark:hover:bg-trueGray-900 hover:ring-1"
                >
                  <AiOutlinePlus className="flex-none w-4 h-4 rotate-45 " />
                </button>
              </div>
            </a>
          </div>
        ))}
      </div>
    </div>
  </div>
  )
}

export default SubPills