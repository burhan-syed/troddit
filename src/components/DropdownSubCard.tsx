import { useRouter } from "next/router";
import Image from "next/dist/client/image";
import { useState, useEffect } from "react";
import DropdownItem from "./DropdownItem";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { useMainContext } from "../MainContext";
import { subToSub } from "../RedditAPI";
import { useSession } from "next-auth/client";
const DropdownSubCard = ({ sub, mySubs, refresh }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadAPI, setloadAPI] = useState(true);
  const [subbed, setSubbed] = useState(false);
  const context: any = useMainContext();
  const [session] = useSession();
  useEffect(() => {
    console.log("mySub", mySubs);
    //console.log(sub);
    const thissub = sub?.data?.name;
    // if (mySubs?.length < 1) return;
    mySubs.forEach((s) => {
      if (s?.data?.name == thissub) {
        setSubbed(true);
        setLoaded(true);
        setloadAPI(false);
      }
    });
    setLoaded(true);
    setloadAPI(false);

    return () => {
      setSubbed(false);
      setLoaded(false);
      setloadAPI(true);
    };
  }, [sub, mySubs]);

  const subscribe = async (follow) => {
    //console.log(sub?.data?.name);
    setloadAPI(true);
    let action = "";
    if (follow) {
      action = "sub";
    } else {
      action = "unsub";
    }
    if (session) {
      let status = await subToSub(action, sub?.data?.name);
      if (status) {
        refresh();
      }
    } else {
      let status = context.subToSub(action, sub?.data?.name);
      if (status) {
        refresh();
      }
    }
  };

  return (
    <div className="flex flex-row items-center justify-between">
      <DropdownItem sub={sub} />
      {/* <div>{sub?.data?.subscribers}</div> */}
      {loaded && (
        <div className="relative">
          <div className="p-1 rounded cursor-pointer dark:hover:bg-darkBorder hover:bg-lightHighlight group">
            {subbed && !loadAPI ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  subscribe(false);
                }}
              >
                <AiOutlineMinus />
              </div>
            ) : !subbed && !loadAPI ? (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  subscribe(true);
                }}
              >
                <AiOutlinePlus />
              </div>
            ) : loadAPI ? (
              <div className="animate-spin">
                <ImSpinner2 />
              </div>
            ) : (
              ""
            )}
          </div>
          {/* <div className="absolute top-0 -right-10 group-hover:block">Follow</div> */}
        </div>
      )}
    </div>
  );
};

export default DropdownSubCard;
