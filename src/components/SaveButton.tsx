import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { BsBookmarks, BsBookmarksFill } from "react-icons/bs";
import useMutate from "../hooks/useMutate";
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
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const context: any = useMainContext();
  const [isSaved, setIsSaved] = useState(false);
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
      context.setLoginModal(true);
    }
  };

  const bookmarkStyle =
    "flex-none   " +
    (row || menu ? " w-4 h-4 " : " w-5 h-5 ") +
    (!isPortrait && !row ? " md:mr-2 " : " ") +
    (menu ? " mr-2 " : "") +
    (isSaved ? " text-th-upvote  " : " ");

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
        <>
          {!!isSaved ? (
            <BsBookmarksFill className={bookmarkStyle} />
          ) : (
            <BsBookmarks className={bookmarkStyle} />
          )}
        </>
      )}

      {!isPortrait && (
        <h1
          className={
            (post ? "hidden " : "") + (!isPortrait && !row ? " md:block " : "") + (row ? " hidden sm:block " : "")
          }
        >
          {isSaved ? "Unsave" : "Save"}
          {menu ? " Post" : ""}
        </h1>
      )}
    </div>
  );
};

export default SaveButton;
