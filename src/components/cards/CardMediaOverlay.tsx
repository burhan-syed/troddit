import React, { useEffect, useState } from "react";
import Media from "../Media";
import { useWindowSize } from "@react-hook/window-size/throttled";
import SubIcon from "../SubIcon";
import TitleFlair from "../TitleFlair";

const CardMediaOverlay = ({ post, voteScore, setShowCardMediaOverlay }) => {
  const [windowWidth, windowHeight] = useWindowSize();
  const mediaHeight = Math.min(
    windowHeight * 0.8,
    ((windowWidth * 0.9) / post?.mediaInfo?.dimensions?.[0]) *
      post?.mediaInfo?.dimensions?.[1]
  );

  const [color, setColor] = useState<string>();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    let baseColor = window
      .getComputedStyle(document.documentElement)
      .getPropertyValue("--base")
      .trim();
    if (baseColor === "#000") {
      baseColor = "#000000";
    }
    setColor(baseColor);
    setMounted(true);
  }, []);
  useEffect(() => {
    const onMouseUp = () => setShowCardMediaOverlay(false);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchcancel", onMouseUp);
    window.addEventListener("touchend", onMouseUp);

    return () => {
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchcancel", onMouseUp);
      window.removeEventListener("touchend", onMouseUp);
    };
  }, [setShowCardMediaOverlay]);

  useEffect(() => {
    if (true) {
      const width = document.body.clientWidth;
      document.documentElement.style.setProperty("--overflow", "hidden hidden");
      document.body.style.width = `${width}px`;
    } else {
      document.documentElement.style.setProperty(
        "--overflow",
        "hidden visible"
      );
      document.body.style.width = `auto`;
    }

    return () => {
      document.documentElement.style.setProperty(
        "--overflow",
        "hidden visible"
      );
      document.body.style.width = `auto`;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/40"
      onContextMenuCapture={(e) => {
        if (true || windowWidth < 640) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}
    >
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-lg top-1/2 left-1/2 backdrop-blur-md ring-1 ring-th-border2"
        style={{ backgroundColor: `${color}50` }}
      >
        <div className="flex flex-col gap-0.5 p-1 px-2">
          <h2 className="text-sm font-light ">
            <span className="mr-2">{post?.title}</span>
            <span className="text-xs ">
              <TitleFlair post={post} />
            </span>
          </h2>
        </div>

        <div
          className="relative"
          style={{
            width: `${windowWidth * 0.9}px`,
            height: `${mediaHeight}px`,
          }}
          onContextMenuCapture={(e) => {
            if (true || windowWidth < 640) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
        >
          <Media
            post={post}
            postMode={true}
            columns={1}
            containerDims={[windowWidth * 0.9, mediaHeight]}
          />
        </div>
        <div className="flex justify-between p-1 px-2">
          <div className="flex items-center gap-1 text-xs font-light">
            {false && post?.sr_detail && (
              <div className="flex-none w-6 h-6 rounded-full ">
                <SubIcon subInfo={post?.sr_detail} />
              </div>
            )}
            <span>{`u/${post.author}`}</span>
            <span>on</span>
            <span className="">{`r/${post.subreddit}`}</span>
          </div>
          <span
            className={
              " text-white text-xs font-light flex items-center gap-0.5 pr-0.5 " +
              (post?.likes === true || post?.likes === 1
                ? " text-th-upvote "
                : post?.likes === false || post?.likes === -1
                ? " text-th-downvote "
                : "")
            }
          >
            <span>{voteScore}</span>
            <span className="flex-none w-3 h-3 mb-0.5 opacity-60">
              {VoteFilledUp}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};

const VoteFilledUp = (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M12.781,2.375C12.4,1.9,11.6,1.9,11.219,2.375l-8,10c-0.24,0.301-0.286,0.712-0.12,1.059C3.266,13.779,3.615,14,4,14h2h2 v3v4c0,0.553,0.447,1,1,1h6c0.553,0,1-0.447,1-1v-5v-2h2h2c0.385,0,0.734-0.221,0.901-0.566c0.166-0.347,0.12-0.758-0.12-1.059 L12.781,2.375z"></path>
  </svg>
);

export default CardMediaOverlay;
