import Media from "./Media";
import { VscEyeClosed, VscEye } from "react-icons/vsc";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Awardings from "./Awardings";
import { secondsToTime } from "../../lib/utils";
import PostTitle from "./PostTitle";
import TitleFlair from "./TitleFlair";
import { useMainContext } from "../MainContext";

const MediaWrapper = ({
  hideNSFW,
  post,
  forceMute,
  imgFull,
  postMode,
  containerDims = undefined as any,
  read = false,
  card = false,
}) => {
  const context: any = useMainContext();
  const [hidden, setHidden] = useState(true);
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
    if (hidden) {
      e.preventDefault();
      e.stopPropagation();
      setHidden(false);
    }
  };

  const NSFWWrapper = (
    <div
      className={hideNSFW && hidden ? "relative overflow-hidden " : undefined}
      onClick={toggleHide}
    >
      <div
        className={"relative " + (hideNSFW && hidden ? " blur-3xl" : undefined)}
      >
        <Media
          post={postData}
          forceMute={forceMute}
          imgFull={imgFull}
          postMode={postMode}
          containerDims={containerDims}
          read={read}
          card={card}
        />
      </div>
      {hideNSFW && hidden && (
        <div className="absolute flex flex-col items-center justify-center w-full opacity-50 translate-x-[-1px] group -translate-y-11 top-1/2 text-white hover:cursor-pointer">
          <div className="flex flex-col items-center justify-center p-4 bg-opacity-50 rounded-lg bg-black/30 backdrop-blur-xl">
            <VscEyeClosed className="w-10 h-10 group-hover:hidden " />
            <VscEye className="hidden w-10 h-10 group-hover:block" />
            <h1 className="hidden text-sm group-hover:block">
              Click to Unhide
            </h1>
            <h1 className="group-hover:hidden">{hideText}</h1>
          </div>
        </div>
      )}
    </div>
  );

  const XPostData = (
    <div className="p-2">
      <div className="py-0">
        <h1
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
        </h1>

        {/* <div className="pb-1 text-xs">
              
            </div> */}
      </div>
      <div className="flex flex-row items-start py-0 text-xs truncate select-auto text-th-textLight">
        <div className="flex flex-row flex-wrap items-start text-xs truncate select-auto text-th-textLight">
          <Link href={`/r/${postData?.subreddit}`}>
            <a
              title={`go to r/${postData?.subreddit}`}
              className="mr-1"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h2 className="font-semibold hover:underline text-th-text ">
                r/{postData?.subreddit ?? ""}
              </h2>
            </a>
          </Link>
          <p>•</p>
          <Link href={`/u/${postData?.author}`}>
            <a
              title={`see u/${postData?.author}'s posts`}
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <h2 className="ml-1 mr-1 hover:underline">
                u/{postData?.author ?? ""}
              </h2>
            </a>
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
        <div className="flex flex-row flex-none ml-auto hover:underline">
          <a
            title="open source"
            href={`${postData?.url}`}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="">{`(${postData?.domain})`}</p>
          </a>
        </div>
      </div>
    </div>
  );

  if (postData && !isXPost) return <>{NSFWWrapper}</>;
  if (postData && isXPost)
    return (
      <div
        className={
          (!context?.mediaOnly || postMode
            ? "transition-colors border rounded bg-th-post hover:bg-th-postHover border-th-border2 hover:border-th-borderHighlight2 "
            : "") + (context?.cardStyle == "card2" && !postMode ? " m-2" : "")
        }
      >
        {(context?.cardStyle == "card1" ||
          context?.cardStyle == "default" ||
          context?.cardStyle == "row1" ||
          postMode) &&
          (!context.mediaOnly || postMode) && <>{XPostData}</>}
        {NSFWWrapper}
        {context?.cardStyle == "card2" && !postMode && <>{XPostData}</>}
      </div>
    );

  return <></>;
};

export default MediaWrapper;
