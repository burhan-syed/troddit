import { useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import { ImSpinner2 } from "react-icons/im";
import { useSubsContext } from "../MySubs";
import { useMainContext } from "../MainContext";

const SubButton = ({ sub, miniMode = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [loadAPI, setloadAPI] = useState(true);
  const [subbed, setSubbed] = useState(false);
  const context: any = useMainContext();
  const [session, loading] = useSession();
  const subsContext: any = useSubsContext();
  const { mySubs, myLocalSubs, myMultis, subscribe, loadedSubs } = subsContext;

  useEffect(() => {
    //console.log("mySub", mySubs);
    //console.log(sub);
    setloadAPI(true);
    if (loadedSubs) {
      // if (mySubs?.length < 1) return;
      if (!loading) {
        if (session) {
          mySubs.forEach((s) => {
            if (s?.data?.name == sub) {
              setSubbed(true);
              setLoaded(true);
              setloadAPI(false);
            }
          });
        } else if (!session) {
          myLocalSubs.forEach((s) => {
            if (s?.data?.name == sub) {
              setSubbed(true);
              setLoaded(true);
              setloadAPI(false);
            }
          });
        }
        setloadAPI(false);
        setLoaded(true);
      }
    }

    return () => {
      setSubbed(false);
      setLoaded(false);
      setloadAPI(true);
    };
  }, [sub, mySubs, loadedSubs, myLocalSubs, session, loading]);

  const startSubscribe = (action, sub2sub) => {
    if (sub2sub) {
      setloadAPI(true);
      subscribe(action, sub2sub);
    }
  };

  return (
    <div>
      {loaded && (
        <div className="relative">
          <div className="rounded-md cursor-pointer dark:hover:bg-darkBorder hover:bg-white group">
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
                {miniMode ? (
                  <AiOutlinePlus  />
                ) : (
                  <span>Join</span>
                )}
              </div>
            ) : loadAPI ? (
              <div className="">
                <ImSpinner2 className="animate-spin" />
                {/* {subbed ? <span>Unfollow</span> : <span>Follow</span>} */}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubButton;
