import Media from "./Media";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Awardings from "./Awardings";
import { secondsToTime } from "../../lib/utils";
import PostTitle from "./PostTitle";
import TitleFlair from "./TitleFlair";
const MediaWrapper = ({
  hideNSFW,
  post,
  columns = undefined,
  curPostName = undefined,
  forceMute,
  imgFull,
  postMode,
  handleClick = () => {},
  fullMediaMode = false,
  showCrossPost = true,
  showCrossPostMedia = true,
  containerDims = undefined as any,
  read = false,
  card = false,
  fill = false,
  checkCardHeight = (h?: number) => {},
  hide = false,
  fullRes = false,
  uniformMediaMode = false,
  mediaDimensions = [0, 0] as [number, number],
  inView = true,
  cardStyle = "",
  mediaOnly = false,
}) => {
  const [hideText, setHideText] = useState("");
  const [postData, setPostData] = useState<any>();
  const [isXPost, setIsXPost] = useState(false);
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
  useEffect(() => {
    if (post?.crosspost_parent_list?.[0]) {
      setIsXPost(true);
      setPostData(post.crosspost_parent_list[0]);
    } else if (!postData || post?.name !== postData?.name) {
      setPostData(post);
    }
    return () => {
      //
    };
  }, [post]);

  const toggleHide = (e) => {
    if (hideText) {
      e.preventDefault();
      e.stopPropagation();
      setHideText("");
    }
  };

  const NSFWWrapper = (
    <div
      className={hideNSFW && hideText ? "relative overflow-hidden " : " "}
      onClick={toggleHide}
    >
      <div
        className={" " + (hideNSFW && hideText ? " blur-3xl" : "")}
        style={
          mediaDimensions?.[1] > 0
            ? {
                height: `${mediaDimensions[1]}px`,
                backgroundColor: "transparent",
              }
            : {}
        }
      >
        <Media
          post={postData}
          forceMute={forceMute}
          imgFull={imgFull}
          postMode={postMode}
          containerDims={containerDims}
          columns={columns}
          mediaDimensions={mediaDimensions}
          read={read}
          card={card}
          fill={fill}
          handleClick={handleClick}
          fullMediaMode={fullMediaMode}
          hide={hide}
          fullRes={fullRes}
          uniformMediaMode={uniformMediaMode}
          curPostName={curPostName}
          xPostMode={isXPost && showCrossPost}
          inView={inView}
          checkCardHeight={checkCardHeight}
        />
      </div>
      {hideNSFW && hideText && (
        <div className="absolute flex flex-col items-center justify-center w-full opacity-50 translate-x-[-1px] group -translate-y-11 top-1/2 text-white hover:cursor-pointer">
          <div className="flex flex-col items-center justify-center p-4 bg-opacity-50 rounded-lg bg-black/30 backdrop-blur-xl">
            <VscEyeClosed className="w-10 h-10 group-hover:hidden " />
            <VscEye className="hidden w-10 h-10 group-hover:block" />
            <span className="hidden text-sm group-hover:block">
              Click to Unhide
            </span>
            <span className="group-hover:hidden">{hideText}</span>
          </div>
        </div>
      )}
    </div>
  );

  const XPostData = (
    <div className="p-2">
      <div className="py-0">
        <h2
          className={
            " items-center   leading-none cursor-pointer pb-2 flex flex-row flex-wrap gap-2"
          }
        >
          <a
            aria-label={postData?.title}
            href={postData?.permalink}
            //onClick={(e) => e.preventDefault()}
            className=""
          >
            <PostTitle post={postData} />
          </a>
          <span className="text-xs ">
            <TitleFlair post={postData} />
          </span>
        </h2>

        {/* <div className="pb-1 text-xs">
              
            </div> */}
      </div>
      <div className="flex flex-row items-start py-0 text-xs truncate select-auto text-th-textLight">
        <div className="flex flex-row flex-wrap items-start text-xs truncate select-auto text-th-textLight">
          <Link
            href={`/r/${postData?.subreddit}`}
            title={`go to r/${postData?.subreddit}`}
            className="mr-1"
            onClick={(e) => {
              e.stopPropagation();
            }}>

            <h2 className="font-semibold hover:underline text-th-text ">
              r/{postData?.subreddit ?? ""}
            </h2>

          </Link>
          <p>•</p>
          <Link
            href={`/u/${postData?.author}`}
            title={`see u/${postData?.author}'s posts`}
            onClick={(e) => {
              e.stopPropagation();
            }}>

            <h2 className="ml-1 mr-1 hover:underline">
              u/{postData?.author ?? ""}
            </h2>

          </Link>
          <p>•</p>
          <p className="ml-1 ">
            {secondsToTime(postData?.created_utc, [
              "s ago",
              "m ago",
              "h ago",
              "d ago",
              "mo ago",
              "yr ago",
            ])}
          </p>
          {postData?.over_18 && (
            <div className="flex flex-row pl-1 space-x-1">
              <p>•</p>
              <span className="text-th-red">NSFW</span>
            </div>
          )}
          {postData?.spoiler && (
            <div className="flex flex-row pl-1 space-x-1">
              <p>•</p>
              <span className="text-th-red">SPOILER</span>
            </div>
          )}
          <div className="mx-1"></div>
          {postData?.all_awardings?.length > 0 && (
            <Awardings
              all_awardings={postData?.all_awardings}
              truncate={false}
            />
          )}
        </div>
        {/* <div className="flex flex-row flex-none ml-auto hover:underline">
        //nested a tags
          <a
            title="open source"
            href={`${postData?.url}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="">{`(${postData?.domain})`}</p>
          </a>
        </div> */}
      </div>
    </div>
  );

  if (postData && (!isXPost || !showCrossPost)) return <>{NSFWWrapper}</>;
  if (postData && isXPost)
    return (
      <div
        className={
          (!mediaOnly || postMode
            ? "flex flex-col overflow-hidden transition-colors  bg-th-post  "
            : "") +
          (cardStyle == "card2" && !postMode ? " " : "") +
          ((cardStyle !== "card2" && !mediaOnly) || postMode
            ? " border hover:bg-th-postHover border-th-border2 hover:border-th-borderHighlight2 rounded"
            : "")
        }
      >
        {(cardStyle == "card1" ||
          cardStyle == "default" ||
          cardStyle == "row1" ||
          postMode) &&
          (!mediaOnly || postMode) && <>{XPostData}</>}
        {showCrossPostMedia && (
          <div className="relative w-full">{NSFWWrapper}</div>
        )}
        {cardStyle == "card2" && !postMode && <>{XPostData}</>}
      </div>
    );

  return <></>;
};

export default MediaWrapper;
