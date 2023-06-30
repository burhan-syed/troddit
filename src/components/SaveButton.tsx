import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { BsBookmarks, BsBookmarksFill } from "react-icons/bs";
import { useKeyPress } from "../hooks/KeyPress";
import useMutate from "../hooks/useMutate";
import { useMainContext } from "../MainContext";
const SaveButton = ({
  id,
  saved,
  useKeys = false,
  post = false,
  isPortrait = false,
  row = false,
  fullmedia = false,
  category = "",
  children = <></>,
  menu = false,
}) => {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const context: any = useMainContext();
  const [isSaved, setIsSaved] = useState(false);
  const aPress = useKeyPress("s");

  useEffect(() => {
    saved && setIsSaved(true);
    return () => {
      setIsSaved(false);
    };
  }, [saved, id]);

  const { saveMutation } = useMutate();

  useEffect(() => {
    setIsSaved(saved);
  }, [saveMutation.isError]);

  const save = async () => {
    if (session) {
      setIsSaved((s) => !s);
      saveMutation.mutate({ id: id, isSaved: isSaved });
    } else if (!loading) {
      context.toggleLoginModal(true);
    }
  };

  useEffect(() => {
    if (!context.replyFocus && useKeys) {
      if (aPress) {
        save();
      }
    }

    return () => {};
  }, [aPress, context.replyFocus]);

  const bookmarkStyle =
    "flex-none   " +
    (row || menu || fullmedia ? " w-4 h-4 " : " w-5 h-5 ") +
    (!isPortrait && !row ? " md:mr-2 " : " ") +
    (menu ? " mr-2 " : "") +
    (isSaved ? " text-th-upvote " : " ");

  return (
    <button
      title={`save ${useKeys ? "(s)" : ""}`}
      aria-label="save"
      className={
        "flex flex-row items-center outline-none  " +
        (menu
          ? " pl-2 pr-4 py-2.5  md:py-1 w-full "
          : row
          ? " px-3 sm:px-2 py-1 h-8 sm:h-[26px] space-x-1 border border-transparent rounded-md hover:border-th-borderHighlight hover:cursor-pointer w-full "
          : post
          ? " cursor-pointer p-2  border rounded-md border-th-border hover:border-th-borderHighlight w-full "
          : fullmedia
          ? " w-10 h-10 flex-none bg-black/40 backdrop-blur-lg rounded-full justify-center text-white"
          : " space-x-1 w-full ") +
        (isSaved ? "" : " hover:text-th-upvote ")
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        save();
      }}
    >
      {(post || row || menu || fullmedia) && (
        <>
          {!!isSaved ? (
            <BsBookmarksFill className={bookmarkStyle} />
          ) : (
            <BsBookmarks className={bookmarkStyle} />
          )}
        </>
      )}

      {!isPortrait && !fullmedia && (
        <span
          className={
            (post ? "hidden " : "") +
            (!isPortrait && !row ? " md:block " : "") +
            (row ? " hidden sm:block " : "")
          }
        >
          {isSaved ? "Unsave" : "Save"}
          {menu ? " Post" : ""}
        </span>
      )}
    </button>
  );
};

export default SaveButton;
