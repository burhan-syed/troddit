import { useState, useEffect } from "react";
import { loadMoreComments, postVote } from "../RedditAPI";
import { BiDownvote, BiUpvote } from "react-icons/bi";
import { useSession } from "next-auth/client";
import { useMainContext } from "../MainContext";
import CommentReply from "./CommentReply";
import { secondsToTime } from "../../lib/utils";
import Link from "next/dist/client/link";
import Vote from "./Vote";
import { ImSpinner2 } from "react-icons/im";

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
  const [score, setScore] = useState("");
  const [color, setColor] = useState(100);
  const [hideChildren, setHideChildren] = useState(false);
  const [vote, setVote] = useState(0);
  const [session, loading] = useSession();
  const context: any = useMainContext();

  const [childcomments, setchildcomments] = useState([]);

  const [myReplies, setmyReplies] = useState([]);
  const [openReply, setopenReply] = useState(false);
  const updateMyReplies = (html) => {
    const newreply = {
      myreply: true,
      kind: "t1",
      data: {
        author: session?.user?.name,
        body_html: html,
        created_utc: Math.floor(Date.now() / 1000),
        depth: comment?.depth + 1,
        parent_id: comment?.name,
        score: 1,
      },
    };
    setmyReplies((replies) => [newreply, ...myReplies]);
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

  const castVote = async (e, v) => {
    e.stopPropagation();
    if (session) {
      v === vote ? (v = 0) : undefined;
      let res = await postVote(v, comment?.data?.name);
      res ? setVote(v) : undefined;
    } else {
      context.setLoginModal(true);
    }
  };
  useEffect(() => {
    setScore(
      calculateScore(comment?.data?.score ? comment.data.score + vote : 0)
    );
    //console.log(comment);
    return () => {
      setScore("0");
    };
  }, [comment, depth, vote]);

  const calculateScore = (x: number) => {
    if (x < 10000) {
      return x.toString();
    } else {
      let y = Math.floor(x / 1000);
      let z = (x / 1000).toFixed(1);
      return z.toString() + "k";
    }
  };

  const loadChildComments = async (children, link_id) => {
    let childrenstring = children.join();
    //console.log(childrenstring);
    //console.log(link_id);
    const morecomments = await loadMoreComments(childrenstring, link_id);
    setMoreComments(await fixformat(morecomments));
    setMoreLoaded(true);
    setLoadingComments(false);
  };

  const fixformat = async (comments) => {
    if (comments?.length > 0) {
      let basedepth = comments[0].data.depth;

      let idIndex = new Map();
      comments.forEach((comment) => {
        idIndex.set(`t1_${comment.data.id}`, comment);
      });
      //console.log(idIndex);
      await comments.forEach((comment, i) => {
        //console.log(comment.data.parent_id);
        let c = idIndex.get(comment.data.parent_id);
        //!c && console.log(comment.data.body);
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
          //console.log(i, comment.data.parent_id, comment.data.body);
        }
      });

      //console.log(fixedcomments);
      return fixedcomments;
    }
    return comments;
  };

  return (
    <div
      className={
        `${depth !== 0 ? " " : ""}` +
        (depth == 0
          ? "bg-white dark:bg-[#121212] darkBG border-r "
          : depth % 2 === 0
          ? " bg-white dark:bg-[#121212] darkBG"
          : "bg-lightHighlight dark:bg-darkBG black") +
        (hide ? " hidden " : "") +
        " border-t border-l border-b border-lightBorder dark:border-darkBorder rounded-md"
      }
    >
      <div
        className={"flex flex-row"}
        onClick={(e) => {
          e.stopPropagation();
          setHideChildren((h) => !h);
        }}
      >
        {/* Left column */}
        {/* Left Ribbon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            setHideChildren((h) => !h);
          }}
          className={
            "min-h-full w-0 md:w-2  lg:w-4 flex-none  cursor-pointer group"
          }
        >
          <div className="flex-none w-1 min-h-full bg-blue-600 hover:bg-blue-800 group-hover:bg-blue-800 dark:bg-red-700 rounded-l-md dark:hover:bg-red-600 dark:group-hover:bg-red-600"></div>
        </div>
        {/* Vote Buttons */}
        <div
          className={
            " flex-col items-center justify-start flex-none lg:pr-2 md:pr-0.5 pt-4 hidden " +
            (hideChildren || portraitMode ? " hidden " : " md:flex ")
          }
        >
          {/* <Vote name={comment?.data?.name} likes={comment?.data?.likes} score={comment?.data?.score} hideScore={true}/> */}
        </div>

        {/* Comment Body */}
        <div
          className={
            "flex-grow mt-3 max-w-full   " +
            (hideChildren && !portraitMode
              ? " md:pl-2 mb-3 "
              : hideChildren
              ? " mb-3 "
              : " ")
          }
          onClick={(e) => {
            e.stopPropagation();
            setHideChildren((h) => !h);
          }}
        >
          {/* Author and comment data*/}
          <div className="flex flex-row justify-start pl-3 space-x-1 text-base text-gray-400 md:pl-0 dark:text-gray-500">
            {/* <h1 className="">{`${comment?.data?.author}`}</h1> */}
            <Link href={`/user/${comment?.data?.author}`}>
              <a
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <h1 className="">{comment?.data?.author ?? ""}</h1>
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
                <p className="px-0.5 font-medium text-green-500 dark:text-green-700 dark:opacity-80">
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
            {!portraitMode && (
              <div className="flex-row hidden space-x-1 md:flex ">
                <p>•</p>
                <h1
                  className={
                    vote === 1 || comment?.myreply || comment?.likes
                      ? "text-upvote"
                      : vote === -1 || comment?.likes === false
                      ? "text-downvote"
                      : "" + " "
                  }
                >
                  {score ?? "0"} pts
                </h1>
              </div>
            )}

            <p>•</p>
            <p className="">
              {secondsToTime(comment?.data?.created_utc, [
                "s",
                "min",
                "hr",
                "dy",
                "mo",
                "yr",
              ])}
            </p>
          </div>

          {/* Main Comment Body */}
          <div className={(hideChildren ? "hidden" : " ") + " "}>
            <div className="">
              {/* Comment Text */}
              <div
                onClick={(e) => {
                  const cellText = document.getSelection();
                  //console.log(cellText);
                  if (cellText.anchorNode.nodeName != "#text")
                    e.stopPropagation();
                  if (cellText.type === "Range") e.stopPropagation();
                }}
                className="pb-2 pl-3 mr-1 md:pl-0"
                id="innerhtml"
                dangerouslySetInnerHTML={{
                  __html:
                    comment?.data?.body_html ??
                    `<div>${comment?.data?.body ?? "No comment found"}</div>`,
                }}
              ></div>

              {/* Vote */}
              <div
                className={
                  (portraitMode ? "flex " : "flex ") +
                  " flex-row items-center justify-start flex-none text-gray-400 dark:text-gray-500 space-x-1 "
                }
              >
                <div
                  className={
                    (!portraitMode && "ml-1.5 md:ml-0") +
                    " flex flex-row items-center justify-center sm:p-0.5 md:p-0  space-x-1 border border-transparent rounded-md "
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
                    hideChildren || comment?.myreply ? "hidden" : "block"
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
              </div>

              {/* Comment Reply */}
              <div
                className={openReply ? "block mr-2 ml-4 md:ml-0" : "hidden"}
                onClick={(e) => e.stopPropagation()}
              >
                <CommentReply
                  parent={comment?.data?.name}
                  getHtml={updateMyReplies}
                />
              </div>

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
                              <div
                                className={
                                  (portraitMode ? "" : "") + (loadingComments && " animate-pulse ") + 
                                  " pt-2 cursor-pointer hover:font-semibold ml-3 md:pl-0"
                                }
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (session) {
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
                                {"Load More... " +
                                  `(${childcomment.data?.count})`}
                                
                              </div>
                              {/* {loadingComments && (
                                  
                                  <div className="animate-spin">
                                    <ImSpinner2 />
                                  </div>
                                
                              )} */}
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
