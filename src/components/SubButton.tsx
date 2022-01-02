import { getSession, useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { useSubsContext } from "../MySubs";
import { useMainContext } from "../MainContext";

const SubButton = ({ sub, miniMode = false }) => {
  const [loadAPI, setloadAPI] = useState(true);
  const [subbed, setSubbed] = useState(false);
  const [session, loading] = useSession();
  const subsContext: any = useSubsContext();
  const { mySubs, myLocalSubs, myMultis, subscribe, loadedSubs } = subsContext;

  
  //checking subs
  useEffect(() => {
    let subbed = false; 
    if (session) {
      mySubs.forEach((s) => {
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
  }, [session, mySubs, sub]);
  //checking local subs
  useEffect(() => {
    if (!loading && !session){
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
  }, [loading, session, myLocalSubs, sub])

  const startSubscribe = async (action, sub2sub) => {
    //don't send subscribe request if invalid sub or session not established
    if (sub2sub && !loading) {
      setloadAPI(true);
      //console.log("attempting", session?.user?.name, action, sub2sub);
      let s = await subscribe(action, sub2sub, session);
      console.log(s);
      s && setSubbed(p => !p)
      setloadAPI(false);
     
    }
  };

  return (
      <div className="relative select-none">
        <div
          className={
            (!miniMode ?
              "w-24 text-center flex justify-center items-center dark:border border-2 dark:border-lightBorder " : " ") +
            " rounded-md cursor-pointer dark:hover:bg-darkBorder hover:bg-lightHighlight group"
          }
        >
          {subbed && !loadAPI ? (
            <div
              onClick={(e) => {
                e.preventDefault();
                startSubscribe("unsub", sub);
              }}
              className="flex items-center p-1 space-x-1 group"
            >
              {miniMode ? (
                <AiOutlineMinus />
              ) : (
                <>
                  <span className="group-hover:hidden">Joined</span>
                  <span className="hidden group-hover:block">Leave</span>
                </>
              )}
            </div>
          ) : !subbed && !loadAPI ? (
            <div
              onClick={(e) => {
                e.preventDefault();
                startSubscribe("sub", sub);
              }}
              className="flex items-center p-1 space-x-1"
            >
              {miniMode ? <AiOutlinePlus /> : <span>Join</span>}
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
        </div>
      </div>
  );
};

export default SubButton;
