import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { BiHide } from "react-icons/bi";
import { VscEye, VscEyeClosed } from "react-icons/vsc";
import useMutate from "../hooks/useMutate";
import { useMainContext } from "../MainContext";

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
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const context: any = useMainContext();
  const [isHidden, setIsHidden] = useState(false);
  useEffect(() => {
    hidden && setIsHidden(true);
    return () => {
      setIsHidden(false);
    };
  }, [hidden]);

  const { hideMutation } = useMutate();

  useEffect(() => {
    setIsHidden(hidden);
  }, [hideMutation.isError]);

  const hide = async () => {
    if (session) {
      let pstatus = isHidden;
      setIsHidden((s) => !s);
      hideMutation.mutate({ id: id, isHidden: isHidden });
    } else if (!loading) {
      context.toggleLoginModal(true);
    }
  };

  const eyeStyle =
    "flex-none   " +
    (row || menu ? " w-4 h-4 " : " w-6 h-6 ") +
    (!isPortrait && !row ? " md:mr-2 " : " ") +
    (menu ? " mr-2 " : "") +
    (isHidden ? " text-th-red" : " ");

  return (
    <div
      className={
        "flex flex-row items-center  " +
        (menu ? " pr-4 pl-2 py-2.5 md:py-1 " : " space-x-1 ")
      }
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        hide();
      }}
    >
      {(post || row || menu) && (
        <>
          {isHidden ? (
            <VscEyeClosed className={eyeStyle + (" mt-0.5")} />
          ) : (
            <VscEye className={eyeStyle} />
          )}
        </>
      )}

      {!isPortrait && (
        <h1 className={(post ? "hidden " : "") + (!isPortrait && !row ? " md:block " : "") + (row ? "hidden sm:block " : "")}>
          {isHidden ? "Unhide" : "Hide"}
          {menu ? " Post" : ""}
        </h1>
      )}
    </div>
  );
};

export default HideButton;
