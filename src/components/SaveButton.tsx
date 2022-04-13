import { useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { BsBookmarks } from "react-icons/bs";
import { useMainContext } from "../MainContext";
import { saveLink } from "../RedditAPI";

const SaveButton = ({
  id,
  saved,
  post = false,
  isPortrait = false,
  row = false,
  category = "",
  children = <></>,
  postindex = undefined,
  menu = false,
}) => {
  const [session, loading] = useSession();
  const context: any = useMainContext();
  const [isSaved, setIsSaved] = useState(false);
  useEffect(() => {
    saved && setIsSaved(true);
    return () => {
      setIsSaved(false);
    };
  }, [saved]);

  const save = async () => {
    if (session) {
      let pstatus = isSaved;
      setIsSaved((s) => !s);
      const res = await saveLink(category, id, isSaved);
      if (res) {
        context.updateSaves(postindex, !pstatus);
      } else {
        setIsSaved(pstatus);
      }
    } else if (!loading) {
      context.setLoginModal(true);
    }
  };
  return (
    <div
      className={
        "flex flex-row items-center " +
        (menu ? " pl-2 pr-4 py-1 " : " space-x-1 ")
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        save();
      }}
    >
      {(post || row || menu) && (
        <BsBookmarks
          className={
            "flex-none   " +
            (row || menu ? " w-4 h-4 " : " w-5 h-5 ") +
            (!isPortrait && !row ? " md:mr-2 " : " ") +
            (menu ? " mr-2 " : "") +
            (isSaved ? " dark:text-yellow-300 text-yellow-600 " : " ")
          }
        />
      )}

      {!isPortrait && (
        <h1 className={post && "hidden " + (!isPortrait && " md:block ")}>
          {isSaved ? "Unsave" : "Save"}
          {menu ? " Post" : ""}
        </h1>
      )}
    </div>
  );
};

export default SaveButton;
