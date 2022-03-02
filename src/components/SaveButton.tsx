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
      className="flex flex-row space-x-1 "
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        save();
      }}
    >
      {(post || row) && (
        <BsBookmarks
          className={
            "flex-none   " +
            (row ? " w-4 h-4 " : " w-6 h-6 ") +
            (!isPortrait && !row ? " md:pr-2 " : row ? "  " : " ") +
            (isSaved ? " dark:text-yellow-300 text-yellow-600 " : " ")
          }
        />
      )}

      {!isPortrait && (
        <h1 className={post && "hidden " + (!isPortrait && " md:block ")}>
          {isSaved ? "Unsave" : "Save"}
        </h1>
      )}
    </div>
  );
};

export default SaveButton;
