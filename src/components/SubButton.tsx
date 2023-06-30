import { getSession, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { useSubsContext } from "../MySubs";
import { localSubInfoCache } from "../MainContext";
import useRefresh from "../hooks/useRefresh";
import React from "react";

const SubButton = ({ sub, miniMode = false, userMode = false }) => {
  const [loadAPI, setloadAPI] = useState(true);
  const [subbed, setSubbed] = useState(false);
  const [hovered, setHovered] = useState(false);
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const subsContext: any = useSubsContext();
  const {invalidateKey} = useRefresh();
  const {
    mySubs,
    myFollowing,
    myLocalSubs,
    myMultis,
    subscribe,
    loadedSubs,
    addToSubCache,
  } = subsContext;
  //prevent spinner show when already loaded subs once
  const [loadedOnce, setLoadedOnce] = useState(false);
  useEffect(() => {
    loadedSubs && setLoadedOnce(true);
  }, [loadedSubs]);
  //checking subs
  useEffect(() => {
    let subbed = false;
    if (session && loadedSubs) {
      (userMode ? myFollowing : mySubs).forEach((s) => {
        let name = s?.data?.name;
        let subname = s?.data?.display_name;
        if (s?.data?.subreddit) {
          name = s.data.subreddit?.name;
          subname = s.data.subreddit?.display_name;
        }
        //console.log(sub, subname);
        if (subname?.toUpperCase() == sub?.toUpperCase()) {
          subbed = true;
          setSubbed(true);
          setloadAPI(false);
        }
      });
      !subbed && setSubbed(false);
      setloadAPI(false);
    }
  }, [session, mySubs, sub, userMode, myFollowing, loadedSubs]);
  //checking local subs
  useEffect(() => {
    if (!loading && !session) {
      let subbed = false;
      myLocalSubs.forEach((s) => {
        if (s?.data?.name?.toUpperCase() == sub?.toUpperCase()) {
          subbed = true;
          setSubbed(true);
          setloadAPI(false);
        }
      });
      !subbed && setSubbed(false);
      setloadAPI(false);
      //console.log("checked local subs");
    } else if (loading) {
    }
  }, [loading, session, myLocalSubs, sub]);

  const startSubscribe = async (action, sub2sub) => {
    //don't send subscribe request if invalid sub or session not established
    if (sub2sub && !loading) {
      setloadAPI(true);
      let s = await subscribe(action, sub2sub, session);
      if (s){
        //setSubbed((p) => !p);
        invalidateKey(["feed", "HOME"])
      }
      setloadAPI(false);
    }
  };

  return (
    <div
      title={
        subbed
          ? userMode
            ? "unfollow"
            : "unsubscribe"
          : userMode
          ? "follow"
          : "subscribe"
      }
      className={
        "relative select-none flex-none " +
        (!miniMode
          ? " h-9 text-center flex justify-center items-center  border  focus:outline-none  bg-th-background2 border-th-border hover:border-th-borderHighlight hover:bg-th-highlight"
          : " hover:bg-th-highlight hover:ring-2 ring-th-accent flex items-center justify-center h-full") +
        " rounded-md cursor-pointer  "
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loadAPI) {
          startSubscribe(subbed ? "unsub" : !subbed && "sub", sub);
        }
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!loadedSubs && !loadedOnce ? (
        <>
          <div className={!miniMode ? "p-2" : ""}>
            <ImSpinner2 className="animate-spin" />
            {/* {subbed ? <span>Unfollow</span> : <span>Follow</span>} */}
          </div>
        </>
      ) : (
        <>
          {subbed && !loadAPI ? (
            <div className="flex items-center space-x-1 group">
              {miniMode ? (
                <AiOutlineMinus />
              ) : (
                <>
                  <span className={hovered ? "hidden" : ""}>
                    {userMode ? "Followed" : "Joined"}
                  </span>
                  <span className={hovered ? "block" : "hidden"}>
                    {userMode ? "Unfollow" : "Leave"}
                  </span>
                </>
              )}
            </div>
          ) : !subbed && !loadAPI ? (
            <div className="flex items-center space-x-1">
              {miniMode ? (
                <AiOutlinePlus />
              ) : (
                <span>{userMode ? "Follow" : "Join"}</span>
              )}
            </div>
          ) : loadAPI ? (
            <div className={!miniMode ? "p-2" : ""}>
              <ImSpinner2 className="animate-spin" />
              {/* {subbed ? <span>Unfollow</span> : <span>Follow</span>} */}
            </div>
          ) : (
            <div className={!miniMode ? "p-2" : ""}>
              <ImSpinner2 className="animate-spin" />
              {/* {subbed ? <span>Unfollow</span> : <span>Follow</span>} */}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SubButton;
