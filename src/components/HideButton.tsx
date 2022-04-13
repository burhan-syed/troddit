import { useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { BiHide } from "react-icons/bi";
import { useMainContext } from "../MainContext";
import { hideLink } from "../RedditAPI";

const HideButton = ({
  id,
  hidden,
  post = false,
  isPortrait = false,
  row = false,
  category = "",
  postindex = undefined,
  menu = false,
}) => {
  const [session, loading] = useSession();
  const context: any = useMainContext();
  const [isHidden, setIsHidden] = useState(false);
  useEffect(() => {
    hidden && setIsHidden(true);
    return () => {
      setIsHidden(false);
    };
  }, [hidden]);

  const hide = async () => {
    if (session) {
      let pstatus = isHidden;
      setIsHidden((s) => !s);
      const res = await hideLink(id, isHidden);
      if (res) {
        context.updateHidden(postindex, !pstatus);
      } else {
        setIsHidden(pstatus);
      }
    } else if (!loading) {
      context.setLoginModal(true);
    }
  };

  return (
    <div
      className={
        "flex flex-row items-center  " +
        (menu ? " pr-4 pl-2 py-1 " : " space-x-1 ")
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        hide();
      }}
    >
      {(post || row || menu) && (
        <BiHide
          className={
            "flex-none   " +
            (row || menu ? " w-4 h-4 " : " w-6 h-6 ") +
            (!isPortrait && !row ? " md:mr-2 " : " ") +
            (menu ? " mr-2 " : "") +
            (isHidden ? " dark:text-red-500 text-red-400 " : " ")
          }
        />
      )}

      {!isPortrait && (
        <h1 className={post && "hidden " + (!isPortrait && " md:block ")}>
          {isHidden ? "Unhide" : "Hide"}
          {menu ? " Post" : ""}
        </h1>
      )}
    </div>
  );
};

export default HideButton;
