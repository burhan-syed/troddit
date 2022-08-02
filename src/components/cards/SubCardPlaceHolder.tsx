import React from "react";
import SubButton from "../SubButton";

const SubCardPlaceHolder = ({ user = false, tall = false }) => {
  return (
    <div
      className={
        "relative z-0 transition-colors bg-contain border  shadow-md  hover:bg-th-postHover hover:shadow-2xl bg-th-post border-th-border  group" +
        " rounded-lg "
      }
    >
      <div
        className={
          ` absolute w-full h-16 bg-cover bg-th-scrollbar bg-center z-[-1]  ` +
          " rounded-t-md "
        }
        // style={{ zIndex: -1, backgroundColor: "#b8001f" }}
      ></div>
      <div className="flex flex-col h-24 mx-2 my-2 ">
        <div className="flex flex-row translate-y-6 ">
          <div className="z-10 flex-none w-16 h-16 border-2 rounded-full bg-th-post ">
            <div
              className={
                "rounded-full bg-th-accent " +
                " w-full h-full  text-white text-6xl items-center justify-center flex overflow-hidden"
              }
            >
              {user ? " /" : " /"}
            </div>
          </div>
          <div className="flex flex-col ">
            <div className="flex flex-row items-baseline p-1 pb-2 pl-5 pr-2 space-x-2 -translate-x-3 translate-y-2 rounded-tr-md pl-auto bg-th-post hover:bg-th-postHover">
              <div className="w-20 h-5 rounded bg-th-highlight animate-pulse"></div>
              <div className="w-16 h-4 rounded bg-th-highlight animate-pulse"></div>
            </div>
            {/* <h1>{secondsToDate(data?.data?.created)}</h1> */}
          </div>
        </div>
        <div className="flex flex-row pl-5 ml-16 -translate-x-3 ">
          <h1 className="flex flex-col flex-grow h-8 gap-1 overflow-x-hidden overflow-y-scroll text-xs scrollbar-none">
            {[...Array(2)].map((u, i) => (
              <div
                key={i}
                className="w-11/12 h-2 rounded bg-th-highlight animate-pulse"
              ></div>
            ))}
            <div className="w-3/4 h-2 rounded bg-th-highlight animate-pulse"></div>
          </h1>
          <div
            className="mb-auto ml-auto  -translate-y-0.5 flex flex-row relative "
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="flex-none w-24 h-full">
              <SubButton sub={undefined} userMode={false} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCardPlaceHolder;
