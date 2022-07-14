import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSession } from "next-auth/react";
import { useMainContext } from "../MainContext";
import CommentReply from "./CommentReply";
import { secondsToTime } from "../../lib/utils";
import Link from "next/dist/client/link";
import Vote from "./Vote";
import Awardings from "./Awardings";
import SaveButton from "./SaveButton";
import ParseBodyHTML from "./ParseBodyHTML";
import UserFlair from "./UserFlair";
import Image from "next/image";
import { BsArrowRightShort } from "react-icons/bs";
import useMutate from "../hooks/useMutate";
import { InView, useInView } from "react-intersection-observer";

const ChildComments = ({
  comment,
  readTime,
  depth,
  hide,
  op = "",
  portraitMode = false,
  locked = false,
  scoreHideMins = 0,
}) => {
  const context: any = useMainContext();
  const { commentCollapse, loadCommentsMutation } = useMutate();
  const { data: session, status } = useSession();
  const [inViewRef, inView] = useInView({
    /* Optional options */
    threshold: 0,
    //skip: depth !== 0 && !(depth % 2 === 0),
    onChange: (inView, entry) => {
     console.log(inView, comment?.data?.author);
     setOutOfView(!InView);
    },
  });
  const [outOfView, setOutOfView] = useState(true);
  const parentRef = useRef<HTMLDivElement | any>(null);
  const [hovered, setHovered] = useState(false);
  const [moreComments, setMoreComments] = useState([]);
  const [moreLoaded, setMoreLoaded] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [hideChildren, setHideChildren] = useState(
    comment?.data?.collapsed ?? false
  );

  const setRefs = useCallback(
    (node) => {
      // Ref's from useRef needs to have the node assigned to `current`
      parentRef.current = node;
      // Callback refs, like the one from `useInView`, is a function that takes the node as an argument
      inViewRef(node);
    },
    [inViewRef],
  );

  const toggleHidden = (override?) => {
    setHideChildren((h) => {
      let collapsed = !h;
      if (override !== undefined) {
        collapsed = override;
      }
      commentCollapse.mutate({
        name: comment?.data?.name,
        thread: comment?.data?.link_id?.substring(3),
        collapse: collapsed,
      });
      return collapsed;
    });
  };

  useEffect(() => {
    context?.defaultCollapseChildren && setHideChildren(true);
  }, [context?.defaultCollapseChildren]);

  const executeScroll = () => {
    if (
      parentRef.current &&
      parentRef.current.getBoundingClientRect().top < 0
    ) {
      return parentRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };
  const [childcomments, setchildcomments] = useState<any[]>([]);
  const [myReplies, setmyReplies] = useState<any[]>([]);
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
    if (childcomments?.length > 0) {
      setchildcomments((p) => p.filter((pr: any) => pr?.myreply !== true));
      setchildcomments((p) => [...myReplies, ...p]);
    } else if (!comment?.data?.replies?.data?.children) {
      setchildcomments(myReplies);
    }
  }, [myReplies]);

  const childCommentCount = useMemo(() => {
    let count = -1;
    const counter = (c) => {
      if (c?.data?.count) {
        count += c?.data?.count;
      } else {
        count += 1;
      }
      for (let i = 0; i < c?.data?.replies?.data?.children?.length ?? 0; i++) {
        counter(c?.data?.replies?.data?.children[i]);
      }
    };
    hideChildren && counter(comment);

    return count;
  }, [childcomments, hideChildren]);

  const loadChildComments = useCallback(
    async (children, link_id) => {
      let newComments = await loadCommentsMutation.mutateAsync({
        parentName: comment?.data?.name,
        children: children,
        link_id: link_id,
        permalink: comment?.data?.permalink,
        childcomments: childcomments,
        token: context?.token,
      });
      setchildcomments((c) => [
        ...c?.filter((k) => k?.kind !== "more"),
        ...newComments?.newComments,
      ]);
      newComments?.newToken && context?.setToken(newComments?.newToken);
      setMoreLoaded(true);
      setLoadingComments(false);
    },
    [comment?.data?.permalink, session, context]
  );

  const [isNew, setIsNew] = useState(false); 
  useEffect(() => {
    setIsNew((readTime/1000)?.toFixed(0) < comment?.data?.created_utc)
  }, [readTime, comment?.data?.created_utc])
  

  return (
    <div
      ref={setRefs}
      className={
        `${depth !== 0 ? " " : ""}` +
        (depth == 0
          ? " bg-th-backgroundComment border-r "
          : depth % 2 === 0
          ? " bg-th-backgroundComment "
          : "bg-th-backgroundCommentAlternate ") +
        (hide ? " hidden " : "") +
        (isNew ? " bg-th-highlight " : " ") +
        " border-t border-l border-l-transparent  border-b border-th-border2 rounded-md"
      }
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* <h1 className="absolute top-0 right-0 z-50 text-lg">{new Date(readTime).toISOString()},{new Date(comment?.data?.created_utc * 1000).toISOString()}, {(readTime/1000)?.toFixed(0) > comment?.data?.created_utc ? "gr" : "ls"}</h1> */}
      <div
        className={"flex flex-row"}
        onClick={(e) => {
          e.stopPropagation();
          toggleHidden();
          executeScroll();
        }}
      >
        {/* Left Ribbon */}
        <div
          onClick={(e) => {
            e.stopPropagation();
            toggleHidden();
            executeScroll();
          }}
          className={
            "min-h-full w-1  flex-none  cursor-pointer group" +
            (portraitMode ? " w-2.5 " : " md:w-2  lg:w-4")
          }
        >
          <div
            className={
              "flex-none w-0.5  min-h-full  rounded-l-md bg-th-commentRibbon hover:bg-th-commentRibbonHover group-hover:bg-commentRibbonHover" +
              (hovered ? " bg-th-commentRibbonHover " : " ")
            }
          ></div>
        </div>
        {/* Comment Body */}
        <div
          className={
            "flex-grow mt-3 max-w-full   " +
            (hideChildren && !context.collapseChildrenOnly && !portraitMode
              ? " md:pl-0 mb-3 "
              : hideChildren && !context.collapseChildrenOnly
              ? " mb-3 "
              : " ")
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleHidden();
            executeScroll();
          }}
        >
          {/* comment metadata*/}
          <div className="flex flex-row items-start justify-between ml-3 space-x-1 text-sm md:ml-0 text-th-textLight">
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
                  {comment?.data?.profile_img?.includes("http") &&
                  context.showUserIcons ? (
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
                    context.showUserIcons && (
                      <div className="flex items-center mr-0.5 justify-center w-6 h-6 border-2 rounded-full overflow-clip bg-th-accent">
                        <h4 className="text-xl ml-0.5 mb-1 text-white">u/</h4>
                      </div>
                    )
                  )}
                  <h1
                    className={
                      "group-hover:underline" +
                      (!context.showUserIcons ? " -ml-1 md:ml-2" : "")
                    }
                  >
                    {comment?.data?.author ?? ""}
                    {comment?.data?.author_flair_text?.length > 0 &&
                      context.showUserFlairs && (
                        <span className="ml-2 mr-0.5 text-xs">
                          <UserFlair post={comment.data} />
                        </span>
                      )}
                  </h1>
                </a>
              </Link>

              {(comment?.data?.author == op || comment?.data?.is_submitter) && (
                <>
                  <p className="px-0.5 font-medium text-th-accent ">{"OP"}</p>
                </>
              )}
              {comment?.data?.distinguished == "moderator" && (
                <>
                  <p className="px-0.5 font-medium text-th-green ">{"MOD"}</p>
                </>
              )}
              {comment?.data?.distinguished == "admin" && (
                <>
                  <p className="px-0.5 font-medium text-th-red ">{"ADMIN"}</p>
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
              {hideChildren && comment?.data?.collapsed_reason && (
                <span className="text-xs italic ">
                  [{comment.data.collapsed_reason}]
                </span>
              )}
            </div>

            <div className="flex items-center gap-1 pr-4 mt-1">
              {isNew && (
                <p className="text-xs italic">{"(new)"}</p>
              )}
              {comment?.data?.edited && (
                <p className="text-xs italic ">
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

              {hideChildren &&
                !context.collapseChildrenOnly &&
                childcomments?.length > 0 && (
                  <div className="text-xs cursor-pointer select-none opacity-70">
                    +{childCommentCount}
                  </div>
                )}
            </div>
          </div>

          {/* Main Comment Body */}
          <div
            className={
              (hideChildren && !context.collapseChildrenOnly
                ? " hidden "
                : " ") + " "
            }
          >
            <div className="">
              {/* Comment Text */}
              <div
                onClick={(e: any) => {
                  const cellText = document.getSelection();
                  if (
                    //cellText?.anchorNode?.nodeName !== "#text" ||
                    cellText?.type === "Range" ||
                    e?.target?.nodeName === "A" ||
                    e?.target?.localName === "a"
                  ) {
                    e.stopPropagation();
                  }
                }}
                className="py-2 ml-2 mr-4 "
              >
                <ParseBodyHTML html={comment?.data?.body_html} />
              </div>

              {/* Buttom Row */}
              <div
                className={
                  (portraitMode ? " ml-1 " : " ml-2 ") +
                  " flex-row flex items-center justify-start flex-none flex-wrap gap-2  text-th-textLight "
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
                    archived={comment?.data?.archived}
                    scoreHideMins={scoreHideMins}
                    postTime={comment?.data?.created_utc}
                  />
                </div>
                <button
                  disabled={comment?.data?.archived || locked}
                  className={
                    "text-sm " +
                    ((hideChildren && !context.collapseChildrenOnly) ||
                    //comment?.myreply ||
                    comment?.data?.archived ||
                    locked
                      ? "hidden"
                      : "block hover:underline")
                  }
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    session && !comment?.data?.archived
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
                {hideChildren &&
                  context.collapseChildrenOnly &&
                  childcomments?.length > 0 && (
                    <div className="ml-auto mr-4 text-xs cursor-pointer select-none opacity-70">
                      +{childCommentCount}
                    </div>
                  )}
              </div>

              {/* Comment Reply */}
              {hideChildren &&
                context.collapseChildrenOnly &&
                childcomments?.length > 0 && <div className="py-1"></div>}
              {openReply && (
                <div
                  className={openReply ? "block mr-2 ml-4 md:ml-0" : "hidden"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <CommentReply
                    parent={comment?.data?.name}
                    getResponse={updateMyReplies}
                    postName={comment?.data?.link_id?.substring(3)}
                  />
                </div>
              )}

              {/* Children */}
              {!outOfView && <>
              
              <div
                onMouseEnter={() => setHovered(false)}
                onMouseLeave={() => setHovered(true)}
                className={
                  "min-w-full py-2" +
                  (hideChildren &&
                  context.collapseChildrenOnly &&
                  childcomments?.length > 0
                    ? " hidden "
                    : "")
                }
              >
                {childcomments && (
                  <>
                    {childcomments.map((childcomment: any, i) => (
                      <div key={`${i}_${childcomment?.data?.id}`}>
                        {childcomment.kind === "t1" && (
                          <ChildComments
                            comment={childcomment}
                            depth={depth + 1}
                            hide={hideChildren}
                            portraitMode={portraitMode}
                            locked={locked}
                            scoreHideMins={scoreHideMins}
                            readTime={readTime}
                          />
                        )}
                        {childcomment.kind == "more" && (
                          <div className={hideChildren ? "hidden" : " flex "}>
                            {true && (
                              <>
                                {childcomment.data?.count > 0 ? (
                                  <button
                                  disabled={loadingComments}
                                    onMouseEnter={() => setHovered(true)}
                                    onMouseLeave={() => setHovered(false)}
                                    className={
                                      (portraitMode ? "" : "") +
                                      (loadingComments && " animate-pulse ") +
                                      " pt-2  w-full text-left hover:font-semibold ml-3 md:pl-0 select-none outline-none text-sm"
                                    }
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      setLoadingComments(true);
                                      loadChildComments(
                                        childcomment?.data?.children,
                                        comment?.data?.link_id
                                      );
                                    }}
                                  >
                                    {`Load ${childcomment.data?.count} More... `}
                                  </button>
                                ) : (
                                  <Link href={comment?.data?.permalink}>
                                    <a
                                      className="flex items-center w-full ml-3 text-sm select-none hover:font-semibold md:pl-0"
                                      onMouseEnter={() => setHovered(true)}
                                      onMouseLeave={() => setHovered(false)}
                                      onClick={e => e.stopPropagation()}
                                    >
                                      Continue thread <BsArrowRightShort />
                                    </a>
                                  </Link>
                                )}
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </div>
              </>}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildComments;
