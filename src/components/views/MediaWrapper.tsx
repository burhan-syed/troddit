import Media from "../Media";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import { useState, useEffect } from "react";

const MediaWrapper = ({
  hideNSFW,
  post,
  forceMute,
  allowIFrame,
  imgFull,
  postMode,
  containerDims = undefined,
}) => {
  const [hidden, setHidden] = useState(true);
  const [hideText, setHideText] = useState("");
  useEffect(() => {
    post?.over_18 && post?.spoiler
      ? setHideText("NSFW SPOILER")
      : post?.over_18
      ? setHideText("NSFW")
      : post?.spoiler
      ? setHideText("SPOILER")
      : setHideText("");
    return () => {
      //
    };
  }, [post]);

  const toggleHide = (e) => {
    if (hidden) {
      e.preventDefault();
      e.stopPropagation();
      setHidden(false);
    }
  };

  return (
    <div
      className={hideNSFW && hidden ? "relative overflow-hidden " : undefined}
      onClick={toggleHide}
    >
      <div
        className={"relative " + (hideNSFW && hidden ? " blur-3xl" : undefined)}
      >
        <Media
          post={post}
          forceMute={forceMute}
          allowIFrame={allowIFrame}
          imgFull={imgFull}
          postMode={postMode}
          containerDims={containerDims}
        />
      </div>
      {hideNSFW && hidden && (
        <div className="absolute flex flex-col items-center justify-center w-full opacity-50 translate-x-[-1px] group -translate-y-7 top-1/2 text-lightText hover:cursor-pointer">
          <VscEyeClosed className="w-10 h-10 group-hover:hidden " />
          <VscEye className="hidden w-10 h-10 group-hover:block" />
          <h1 className="hidden text-xs group-hover:block">Click to Unhide</h1>
          <h1 className="group-hover:hidden">{hideText}</h1>
        </div>
      )}
    </div>
  );
};

export default MediaWrapper;
