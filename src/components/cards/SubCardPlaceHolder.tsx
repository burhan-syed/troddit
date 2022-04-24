import { useSession } from "next-auth/react";
import Image from "next/image";
import router from "next/router";
import { useEffect, useState } from "react";
import { numToString, secondsToDate } from "../../../lib/utils";
import { useMainContext } from "../../MainContext";
import SubButton from "../SubButton";
import SubOptButton from "../SubOptButton";

const SubCardPlaceHolder = ({ user = false }) => {
  const context: any = useMainContext();

  return (
    <div
      className={
        "relative z-0 transition-colors bg-contain border border-gray-300 shadow-md bg-lightPost hover:bg-lightPostHover dark:hover:bg-darkPostHover hover:shadow-2xl dark:bg-darkBG dark:border-trueGray-700 dark:hover:border-trueGray-500 hover:border-gray-400 group" +
        (context?.cardStyle === "card2" || context?.mediaOnly
          ? "  "
          : " rounded-md ")
      }
    >
      <div
        className={
          ` absolute  w-full h-16 bg-cover bg-center z-[-1] bg-blue-400 dark:bg-red-800  ` +
          (context?.cardStyle === "card2" || context?.mediaOnly
            ? "  "
            : " rounded-t-md ")
        }
        // style={{ zIndex: -1, backgroundColor: "#b8001f" }}
      ></div>
      <div className="flex flex-col h-24 mx-2 my-2 ">
        <div className="flex flex-row translate-y-6 ">
          <div className="z-10 flex-none w-16 h-16 border-2 rounded-full dark:bg-darkBG bg-lightPost">
            <div
              className={
                "rounded-full bg-blue-700 " +
                " w-full h-full  text-lightText text-6xl items-center justify-center flex overflow-hidden"
              }
            >
              {user ? " /" : " /"}
            </div>
          </div>
          <div className="flex flex-col ">
            <div className="flex flex-row items-baseline p-1 pb-2 pl-5 pr-2 space-x-2 -translate-x-3 translate-y-2 rounded-tr-md pl-auto dark:bg-darkBG bg-lightPost dark:group-hover:bg-darkPostHover group-hover:bg-lightPostHover">
              <div className="w-20 h-5 bg-gray-300 rounded dark:bg-gray-800 animate-pulse"></div>
              <div className="w-16 h-4 bg-gray-300 rounded dark:bg-gray-800 animate-pulse"></div>
            </div>
            {/* <h1>{secondsToDate(data?.data?.created)}</h1> */}
          </div>
        </div>
        <div className="flex flex-row pl-5 ml-16 -translate-x-3 ">
          <h1 className="flex flex-col flex-grow h-8 gap-1 overflow-x-hidden overflow-y-scroll text-xs scrollbar-none">
            {[...Array(2)].map((u, i) => (
              <div
                key={i}
                className="w-11/12 h-2 bg-gray-300 rounded dark:bg-gray-800 animate-pulse"
              ></div>
            ))}
            <div className="w-3/4 h-2 bg-gray-300 rounded dark:bg-gray-800 animate-pulse"></div>
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
            {/* {data?.kind === "t5" && (
              <div className="z-50">
                <SubOptButton
                  subInfo={data.data}
                  currMulti={undefined}
                  subArray={[data?.data?.display_name]}
                />
              </div>
            )} */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubCardPlaceHolder;
