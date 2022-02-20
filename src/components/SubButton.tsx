import { getSession, useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { useSubsContext } from "../MySubs";
import { useMainContext } from "../MainContext";

const SubButton = ({ sub, miniMode = false, userMode = false }) => {
  const [loadAPI, setloadAPI] = useState(true);
  const [subbed, setSubbed] = useState(false);
  const [session, loading] = useSession();
  const subsContext: any = useSubsContext();
  const { mySubs, myFollowing, myLocalSubs, myMultis, subscribe, loadedSubs } =
    subsContext;

  //checking subs
  useEffect(() => {
    let subbed = false;
    if (session) {
      let subs = mySubs;
      if (userMode) subs = myFollowing;
      subs.forEach((s) => {
        if (s?.data?.name == sub) {
          subbed = true;
          setSubbed(true);
          setloadAPI(false);
        }
      });
      !subbed && setSubbed(false);
      setloadAPI(false);
      //console.log("checked session subs");
    }
  }, [session, mySubs, sub, userMode, myFollowing]);
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
      //getSession(); causing loop?
    }
  }, [loading, session, myLocalSubs, sub]);

  const startSubscribe = async (action, sub2sub) => {
    //don't send subscribe request if invalid sub or session not established
    if (sub2sub && !loading) {
      setloadAPI(true);
      //console.log("attempting", session?.user?.name, action, sub2sub);
      let s = await subscribe(action, sub2sub, session);
      //console.log(s);
      s && setSubbed((p) => !p);
      setloadAPI(false);
    }
  };

  return (
    <div
      className="relative select-none"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!loadAPI) {
          startSubscribe(subbed ? "unsub" : !subbed && "sub", sub);
        }
      }}
    >
      <div
        className={
          (!miniMode
            ? "w-24 text-center flex justify-center items-center dark:border border-2 dark:border-lightBorder hover:bg-lightHighlight "
            : " hover:bg-white") +
          " rounded-md cursor-pointer dark:hover:bg-darkBorder  group"
        }
      >
        {!loadedSubs ? (
          <>
            <div className={!miniMode ? "p-2" : ""}>
              <ImSpinner2 className="animate-spin" />
              {/* {subbed ? <span>Unfollow</span> : <span>Follow</span>} */}
            </div>
          </>
        ) : (
          <>
            {subbed && !loadAPI ? (
              <div className="flex items-center p-1 space-x-1 group">
                {miniMode ? (
                  <AiOutlineMinus />
                ) : (
                  <>
                    <span className="group-hover:hidden">
                      {userMode ? "Followed" : "Joined"}
                    </span>
                    <span className="hidden group-hover:block">
                      {userMode ? "Unfollow" : "Leave"}
                    </span>
                  </>
                )}
              </div>
            ) : !subbed && !loadAPI ? (
              <div className="flex items-center p-1 space-x-1">
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
    </div>
  );
};

export default SubButton;
