import { useState, useEffect, useRef, useCallback } from "react";
import { loadMoreComments, postVote } from "../RedditAPI";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { useSession } from "next-auth/react";
import { useMainContext } from "../MainContext";
import CommentReply from "./CommentReply";
import { secondsToTime } from "../../lib/utils";
import Link from "next/dist/client/link";
import Vote from "./Vote";
import { ImSpinner2 } from "react-icons/im";
import Awardings from "./Awardings";
import SaveButton from "./SaveButton";
import ParseBodyHTML from "./ParseBodyHTML";
import UserFlair from "./UserFlair";
import Image from "next/image";

const ChildComments = ({
  comment,
  depth,
  hide,
  op = "",
  portraitMode = false,
}) => {
  const [moreComments, setMoreComments] = useState([]);
  const [moreLoaded, setMoreLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hideChildren, setHideChildren] = useState(false);
  const { data: session, status } = useSession();
  const context: any = useMainContext();
  const parentRef = useRef(null);
  const executeScroll = () => {
    if (parentRef.current.getBoundingClientRect().top < 0) {
      return parentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const [childcomments, setchildcomments] = useState([]);
  const [myReplies, setmyReplies] = useState([]);
  const [openReply, setopenReply] = useState(false);
  const updateMyReplies = (resdata) => {
    const newreply = {
      myreply: true,
      kind: "t1",
      data: resdata,
    };
    setmyReplies((replies) => [newreply, ...replies]);
    setopenReply(false);
  };

  useEffect(() => {
    setchildcomments(comment?.data?.replies?.data?.children);
  }, [comment]);

  useEffect(() => {
    if (comment?.data?.body_html?.includes("<a ")) {
      comment.data.body_html = comment.data.body_html?.replaceAll(
        "<a ",
        '<a target="_blank" '
      );
      //console.log(comment?.data?.body_html);
    }

    return () => {};
  }, [comment]);

  useEffect(() => {
    if (childcomments?.length > 0) {
      setchildcomments((p) => p.filter((pr) => pr?.myreply !== true));
      setchildcomments((p) => [...myReplies, ...p]);
    } else if (!comment?.data?.replies?.data?.children) {
      setchildcomments(myReplies);
    }
  }, [myReplies]);

  const fixformat = useCallback(async (comments) => {
    if (comments?.length > 0) {
      let basedepth = comments[0].data.depth;

      let idIndex = new Map();
      comments.forEach((comment) => {
        idIndex.set(`t1_${comment.data.id}`, comment);
      });
      await comments.forEach((comment, i) => {
        let c = idIndex.get(comment.data.parent_id);
        if (c && c.data.replies?.data?.children) {
          c.data.replies.data.children.push(comment);
        } else if (c) {
          c.data.replies = {
            kind: "Listing",
            data: {
              children: [comment],
            },
          };
        }
        c && idIndex.set(comment.data.parent_id, c);
      });

      let fixedcomments = [];
      idIndex.forEach((comment, i) => {
        if (comment?.data?.depth === basedepth) {
          fixedcomments.push(comment);
        } else {
        }
      });
      return fixedcomments;
    }
    return comments;
  }, []);

  const loadChildComments = useCallback(
    async (children, link_id) => {
      let childrenstring = children.join();
      //console.log(childrenstring);
      //console.log(link_id);
      const data = await loadMoreComments(
        childrenstring,
        link_id,
        comment?.data?.permalink,
        session ? true : false,
        context?.token
      );
      data?.token && context?.setToken(data?.token);
      let morecomments = data?.data;
      if (morecomments?.[0]?.data?.replies?.data?.children) {
        setMoreComments(morecomments?.[0]?.data?.replies?.data?.children);
      } else {
        setMoreComments(await fixformat(morecomments));
      }
      setMoreLoaded(true);
      setLoadingComments(false);
    },
    [comment?.data?.permalink, session, context, fixformat]
  );

  return (
    <div
      ref={parentRef}
      className={
        `${depth !== 0 ? " " : ""}` +
        (depth == 0
          ? "bg-white dark:bg-[#161616]  border-r "
          : depth % 2 === 0
          ? " bg-white dark:bg-[#161616]"
          : "bg-lightHighlight  dark:bg-darkBG ") +
        (hide ? " hidden " : "") +
        " border-t border-l border-b border-lightBorder dark:border-darkBorder rounded-md"
      }
    >
      <div
        className={"flex flex-row"}
        onClick={(e) => {
          e.stopPropagation();
          setHideChildren((h) => !h);
          executeScroll();
        }}
      >
        {/* Left Ribbon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setHideChildren((h) => !h);
            executeScroll();
          }}
          className={
            "min-h-full w-1  flex-none  cursor-pointer group" +
            (portraitMode ? " w-2.5 " : " md:w-2  lg:w-4")
          }
        >
          <div className="flex-none w-0.5  min-h-full bg-blue-600 hover:bg-blue-800 group-hover:bg-blue-800 dark:bg-red-700 rounded-l-md dark:hover:bg-red-600 dark:group-hover:bg-red-600"></div>
        </div>
        {/* Comment Body */}
        <div
          className={
            "flex-grow mt-3 max-w-full   " +
            (hideChildren && !portraitMode
              ? " md:pl-0 mb-3 "
              : hideChildren
              ? " mb-3 "
              : " ")
          }
          onClick={(e) => {
            e.stopPropagation();
            setHideChildren((h) => !h);
            executeScroll();
          }}
        >
          {/* comment metadata*/}
          <div className="flex flex-row items-start justify-between ml-3 space-x-1 text-sm text-gray-400 md:ml-0 dark:text-gray-500">
            {/* Author */}
            <div className="flex flex-row flex-wrap items-center gap-1 ">
              <Link href={`/u/${comment?.data?.author}`}>
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={
                    "flex items-center group justify-start group gap-1"
                  }
                >
                  {comment?.data?.profile_img?.includes("http") ? (
                    <div className="w-6 h-6 rounded-full overflow-clip mr-0.5">
                      <Image
                        src={comment.data.profile_img}
                        height={"256"}
                        width={"256"}
                        alt={""}
                        unoptimized={true}
                        className={"w-8 h-8"}
                      ></Image>
                    </div>
                  ) : (
                    <div className="flex items-center mr-0.5 justify-center w-6 h-6 border-2 rounded-full overflow-clip bg-lightScroll dark:bg-darkScroll">
                      <h4 className="text-xl ml-0.5 mb-1 text-white">u/</h4>
                    </div>
                  )}
                  <h1 className="group-hover:underline">
                    {comment?.data?.author ?? ""}
                    {comment?.data?.author_flair_text?.length > 0 && (
                      <span className="ml-2 mr-0.5 text-xs">
                        <UserFlair post={comment.data} />
                      </span>
                    )}
                  </h1>
                </a>
              </Link>

              {(comment?.data?.author == op || comment?.data?.is_submitter) && (
                <>
                  <p className="px-0.5 font-medium text-blue-500 dark:text-blue-700 dark:opacity-80">
                    {"OP"}
                  </p>
                </>
              )}
              {comment?.data?.distinguished == "moderator" && (
                <>
                  <p className="px-0.5 font-medium text-lightGreen dark:text-darkGreen ">
                    {"MOD"}
                  </p>
                </>
              )}
              {comment?.data?.distinguished == "admin" && (
                <>
                  <p className="px-0.5 font-medium text-red-500 dark:text-red-700 dark:opacity-80">
                    {"ADMIN"}
                  </p>
                </>
              )}

              <p>•</p>
              <p className="">
                {secondsToTime(comment?.data?.created_utc, [
                  "s ago",
                  "min ago",
                  "hr ago",
                  "dy ago",
                  "mo ago",
                  "yr ago",
                ])}
              </p>

              {comment?.data?.all_awardings?.length > 0 && (
                <>
                  <div className="ml-0.5"></div>
                  <Awardings
                    all_awardings={comment?.data?.all_awardings}
                    truncate={false}
                    styles={"flex flex-row items-center -mb-0.5 "}
                  />
                </>
              )}
            </div>
            {comment?.data?.edited && (
              <p className="pr-2 mt-1 text-xs italic ">
                edited{" "}
                {secondsToTime(comment?.data?.edited, [
                  "s ago",
                  "min ago",
                  "hr ago",
                  "dy ago",
                  "mo ago",
                  "yr ago",
                ])}
              </p>
            )}
          </div>

          {/* Main Comment Body */}
          <div className={(hideChildren ? "hidden" : " ") + " "}>
            <div className="">
              {/* Comment Text */}
              <div
                onClick={(e) => {
                  const cellText = document.getSelection();
                  //console.log(cellText);
                  if (cellText?.anchorNode?.nodeName != "#text")
                    e.stopPropagation();
                  if (cellText?.type === "Range") e.stopPropagation();
                }}
                className="py-2 ml-2 mr-4 "
              >
                <ParseBodyHTML html={comment?.data?.body_html} />
              </div>

              {/* Buttom Row */}
              <div
                className={
                  (portraitMode ? " ml-1 " : " ml-2 ") +
                  " flex-row flex items-center justify-start flex-none flex-wrap gap-2  text-gray-400 dark:text-gray-500  "
                }
              >
                {/* Vote */}
                <div
                  className={
                    (!portraitMode && " ") + //ml-1.5 md:ml-0
                    " flex flex-row items-center justify-center sm:p-0.5 md:p-0 gap-1.5 border border-transparent rounded-full   "
                  }
                >
                  <Vote
                    name={comment?.data?.name}
                    likes={comment?.data?.likes}
                    score={comment?.data?.score}
                  />
                </div>
                <button
                  className={
                    "text-sm " +
                    (hideChildren || comment?.myreply
                      ? "hidden"
                      : "block hover:underline")
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    session
                      ? setopenReply((p) => !p)
                      : context.toggleLoginModal();
                  }}
                >
                  Reply
                </button>
                <div className="pl-2 text-sm cursor-pointer hover:underline">
                  <SaveButton
                    id={comment?.data?.name}
                    saved={comment?.data?.saved}
                  />
                </div>
              </div>

              {/* Comment Reply */}
              {openReply && (
                <div
                  className={openReply ? "block mr-2 ml-4 md:ml-0" : "hidden"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CommentReply
                    parent={comment?.data?.name}
                    getResponse={updateMyReplies}
                  />
                </div>
              )}

              {/* Children */}
              <div className="min-w-full py-2">
                {childcomments && (
                  <>
                    {childcomments.map((childcomment, i) => (
                      <div key={`${i}_${childcomment?.data?.id}`}>
                        {childcomment.kind == "more" ? (
                          <div className={hideChildren ? "hidden" : " "}>
                            {!moreLoaded ? (
                              <>
                                {childcomment.data?.count > 0 ? (
                                  <div
                                    className={
                                      (portraitMode ? "" : "") +
                                      (loadingComments && " animate-pulse ") +
                                      " pt-2 cursor-pointer hover:font-semibold ml-3 md:pl-0 select-none text-sm"
                                    }
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();

                                      if (true) {
                                        setLoadingComments(true);
                                        loadChildComments(
                                          childcomment?.data?.children,
                                          comment?.data?.link_id
                                        );
                                      } else {
                                        context.setLoginModal(true);
                                      }
                                    }}
                                  >
                                    {`Load ${childcomment.data?.count} More... `}
                                  </div>
                                ) : (
                                  <></>
                                )}
                              </>
                            ) : (
                              moreComments?.map((morecomment, i) => (
                                <ChildComments
                                  key={i + morecomment?.data?.id}
                                  comment={morecomment}
                                  depth={morecomment?.data?.depth ?? depth + 1}
                                  hide={hideChildren}
                                  portraitMode={portraitMode}
                                />
                              ))
                            )}
                          </div>
                        ) : (
                          <ChildComments
                            comment={childcomment}
                            depth={depth + 1}
                            hide={hideChildren}
                            portraitMode={portraitMode}
                          />
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildComments;
