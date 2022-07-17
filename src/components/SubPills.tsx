import React, { useEffect, useRef, useState } from "react";
import { MdOutlineClear } from "react-icons/md";
import { BsChevronDown } from "react-icons/bs";

const SubPills = ({
  subArray,
  currMulti,
  multiSub,
  goToMulti,
  goToMultiSub,
  removeSub,
}) => {
  const pillsRef: any = useRef();
  const [expand, setExpand] = useState(false);
  useEffect(() => {
    const el = pillsRef.current;
    if (el && !expand) {
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
  }, [expand]);

  const multiButton = (
    <div
      onClick={(e) => goToMulti(e)}
      className="flex-none"
      title={`show all ${subArray.length} subreddits in this feed`}
    >
      <a href={`${subArray.join("+")}${currMulti ? `?m=${currMulti}` : ""}`}>
        <div
          className={
            "items-center flex h-9 px-4 py-1.5 text-center ring-th-accent border rounded-md select-none border-th-border bg-th-post hover:bg-th-postHover hover:ring-2 hover:border-transparent " +
            (multiSub === "" ? "  ring-2 border-transparent " : "")
          }
        >
          {`${currMulti ? `${currMulti}` : "Feed"} (${subArray.length})`}
        </div>
      </a>
    </div>
  );
  const expandButton = (
    <div
      title={!expand ? "expand" : "collapse"}
      onClick={() => setExpand((e) => !e)}
      className="flex items-center justify-center flex-none text-center border rounded-md cursor-pointer select-none h-9 w-7 border-th-border bg-th-post ring-th-accent hover:bg-th-postHover hover:ring-2 hover:border-transparent"
    >
      {" "}
      <BsChevronDown className={expand ? "-rotate-180" : " rotate-0 "} />
    </div>
  );

  const Pills = (
    <div
      ref={pillsRef}
      className={
        "flex gap-2  items-center    capitalize scrollbar-none" +
        (expand
          ? " flex-wrap justify-start  "
          : " p-1 ml-auto overflow-x-scroll")
      }
    >
      {subArray.map((s) => (
        <div
          onClick={(e) => {
            goToMultiSub(e, s);
          }}
          key={s}
        >
          <a href={`${s}?m=${currMulti}`}>
            <div
              title={`show only posts from r/${s}`}
              className={
                "flex h-9 items-center px-3 py-1 space-x-2 border rounded-full select-none border-th-border bg-th-post hover:bg-th-postHover hover:ring-2 hover:border-transparent ring-th-accent  " +
                (s.toUpperCase() === multiSub.toUpperCase() && "  ring-2  ")
              }
            >
              <h1 className="">{s}</h1>
              <button
                aria-label="remove sub"
                title={`remove posts from r/${s}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  removeSub(s);
                }}
                className=" border rounded-full p-0.5 border-th-postHover hover:bg-th-base hover:ring-1 cursor-pointer"
              >
                <MdOutlineClear className="flex-none w-4 h-4 " />
              </button>
            </div>
          </a>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col w-full gap-2 text-sm">
      {expand && (
        <div className="flex flex-row justify-start w-full gap-2 py-1 ">
          {multiButton}
          {expandButton}
        </div>
      )}
      <div className={"w-full flex items-center   space-x-2 "}>
        {!expand && (
          <>
            {multiButton}
            {expandButton}
          </>
        )}

        {Pills}
      </div>
    </div>
  );
};

export default SubPills;
