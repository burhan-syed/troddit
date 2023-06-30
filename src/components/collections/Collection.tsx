import { useEffect, useLayoutEffect, useState } from "react";
import Image from "next/legacy/image";
import Link from "next/link";

import { useSubsContext } from "../../MySubs";
import SubButton from "../SubButton";
import { AiOutlineCheck } from "react-icons/ai";
import CollectionOptions from "./CollectionOptions";
import {
  BsBoxArrowInUpRight,
  BsChevronDown,
  BsArrowRight,
} from "react-icons/bs";
import { useCollectionContext } from "./CollectionContext";
import React from "react";
const CheckBox = ({ toggled }) => {
  return (
    <div
      className={
        "flex h-full border rounded-md transition-all items-center justify-center  " +
        (toggled
          ? "  bg-th-accent border-th-accent "
          : " group-hover:bg-th-highlight border-th-border  ")
      }
    >
      <AiOutlineCheck
        className={
          " transition-all text-white" +
          (toggled ? " scale-100 hover:scale-110" : " scale-0")
        }
      />
    </div>
  );
};

const Collection = ({
  name = "Name",
  subreddits = [] as string[],
  icon = "",
  over_18 = false,
  owner = "",
  key_color = "",
  collapsed = true,
  isOwner = false,
  bannerMode = false,
  goToMultiSub = (e, s) => {},
}) => {
  const [expand, setExpand] = useState(!collapsed);
  const [toggledSubs, setToggledSubs] = useState([]);
  const [allToggled, setAllToggled] = useState(false);
  // const [sortedSubs, setSortedSubs] = useState([]);
  const mySubs: any = useSubsContext();
  const myCollections: any = useCollectionContext();
  const { selected, toggleSelected, toggleAllSelected } = myCollections;
  useEffect(() => {
    setAllToggled(
      selected?.filter((s) =>
        subreddits.find((sub) => sub?.toUpperCase() === s?.toUpperCase())
      )?.length == subreddits.length
    );
    return () => {};
  }, [selected, subreddits]);

  const toggleSub = (sub) => {
    toggleSelected(sub);
  };

  const toggleAll = () => {
    toggleAllSelected(subreddits);
  };

  const toggleExpand = () => {
    setExpand((e) => !e);
  };

  return (
    <div
      className={
        "relative  transition-colors bg-contain  border-th-border bg-th-post  shadow-md  select-none " +
        (bannerMode ? " border-t border-b " : " rounded-lg border")
      }
    >
      <div
        className={` absolute  w-full  bg-cover bg-center  bg-th-scrollbar ${
          bannerMode ? " h-[121px] " : " h-16 rounded-t-md"
        }`}
      ></div>
      <div
        className={
          "flex flex-col my-2 " + (bannerMode ? " md:mx-16 " : " mx-2")
        }
      >
        <div
          className={
            "flex flex-row " + (bannerMode ? " mt-[3.75rem]" : " mt-6")
          }
        >
          <div
            className={
              "z-20 flex-none  rounded-full bg-th-post" +
              (bannerMode ? " w-24 h-24 mt-1 border-4" : " w-16 h-16 border-2")
            }
          >
            {icon?.includes("https://") ? (
              <>
                <Image
                  src={icon}
                  alt=""
                  height={256}
                  width={256}
                  unoptimized={true}
                  objectFit="cover"
                  className={"rounded-full "}
                />
              </>
            ) : (
              <div
                className={
                  "rounded-full bg-red-400 " +
                  " w-full h-full  text-white text-6xl items-center   justify-center flex overflow-hidden"
                }
              >
                {"f"}
              </div>
            )}
          </div>
          <div
            className={
              "z-10 flex flex-row items-baseline gap-2 p-1 pr-4 pl-11 -ml-9 rounded-tr-md pl-auto bg-th-post " +
              (bannerMode ? " mt-6 pt-1.5" : " mt-1 ")
            }
          >
            <div
              className="flex flex-row items-baseline gap-2 cursor-pointer group "
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleAll();
              }}
            >
              <div className="w-6 h-6 group-hover:cursor-pointer">
                <CheckBox toggled={allToggled} />
              </div>
              <h1 className="text-base ">{name}</h1>
            </div>

            {over_18 && (
              <span className="text-xs  text-th-red text-color pb-0.5">
                NSFW
              </span>
            )}
          </div>
        </div>
        <div
          className={
            "z-30 flex flex-row pl-5  " +
            (bannerMode ? " -mt-10 ml-[5.5rem] py-1" : " -mt-7 ml-14")
          }
        >
          <div
            className="flex flex-row flex-grow group hover:cursor-pointer "
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleExpand();
            }}
          >
            <span className="my-auto text-xs opacity-70">
              A collection of {subreddits.length} subreddits
            </span>

            <div className="flex items-center justify-center w-10 h-8 ml-auto border border-transparent rounded-md group-hover:bg-th-highlight group-hover:border-th-borderHighlight ">
              <BsChevronDown
                className={
                  (expand ? "-rotate-180 " : "rotate-0 ") +
                  "transform transition duration-200"
                }
              />
            </div>
          </div>
          <div className="ml-2 "></div>
          <CollectionOptions
            subArray={selected?.filter((s) =>
              subreddits.find((sub) => sub?.toUpperCase() === s?.toUpperCase())
            )}
            currMulti={name}
            isOwner={isOwner}
          />
          {!bannerMode && (
            <>
              <div className="mr-1 "></div>
              <Link
                href={`/r/${subreddits.join("+")}?m=${name}`}
                passHref
                className="flex items-center justify-center w-10 h-8 border rounded-md border-th-border hover:border-th-borderHighlight hover:bg-th-highlight ">

                <BsArrowRight />

              </Link>
            </>
          )}
        </div>
        <div
          className={
            //"flex flex-row flex-wrap gap-2 transition-all  overflow-hidden    " +
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 overflow-hidden transition-all" +
            (expand ? " max-h-[100rem] my-2  " : " max-h-0  ")
          }
        >
          {subreddits
            ?.sort((a, b) => {
              let A = a?.toUpperCase();
              let B = b?.toUpperCase();
              return A < B ? -1 : A > B ? 1 : 0;
            })
            ?.map((sub, i) => (
              <div
                className="flex flex-row-reverse items-center text-sm border rounded-md overflow-ellipsis border-th-border "
                key={sub + i}
              >
                <div className="flex flex-row items-center flex-none ml-auto">
                  <Link
                    href={`/r/${sub}${bannerMode ? `?m=${name}` : ""}`}
                    passHref
                    onClick={(e) => {
                      if (bannerMode) {
                        e.preventDefault();
                        e.stopPropagation();
                        goToMultiSub(e, sub);
                      }
                    }}>

                    <BsBoxArrowInUpRight className="ml-0.5 w-3 h-3 transition-transform hover:scale-125" />

                  </Link>

                  <div className="flex-none w-5 h-5 mx-2">
                    <SubButton
                      sub={sub}
                      miniMode={true}
                      userMode={sub?.substring(0, 2) == "u_"}
                    />
                  </div>
                </div>
                <div
                  className="flex flex-row items-center flex-grow p-2 truncate rounded-md hover:cursor-pointer group"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    toggleSub(sub);
                  }}
                >
                  <div className="flex-none w-5 h-5 mr-1">
                    <CheckBox
                      toggled={selected.find(
                        (s) => s?.toUpperCase() === sub?.toUpperCase()
                      )}
                    />
                  </div>

                  <span title={sub} className="ml-auto truncate select-none">
                    {sub}
                  </span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
