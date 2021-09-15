import { useState, useEffect } from "react";
import { loadMoreComments, postVote } from "../RedditAPI";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import Markdown from "markdown-to-jsx";

const ChildComments = ({ comment, depth, hide }) => {
  const [moreComments, setMoreComments] = useState([]);
  const [moreLoaded, setMoreLoaded] = useState(false);
  const [score, setScore] = useState("");
  const [color, setColor] = useState(100);
  const [hideChildren, setHideChildren] = useState(false);
  const [vote, setVote] = useState(0);

  const castVote = async (e, v) => {
    e.stopPropagation();
    v === vote ? (v = 0) : undefined;
    let res = await postVote(v, comment?.data?.name);
    res ? setVote(v) : undefined;
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
  };

  const fixformat = async (comments) => {
    if (comments.length > 0) {
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
          console.log(i, comment.data.parent_id, comment.data.body);
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
          ? "bg-white dark:bg-darkBG"
          : depth % 2 === 0
          ? " bg-white dark:bg-darkBG"
          : "bg-lightHighlight dark:bg-black") +
        (hide ? " hidden " : "") +
        " border border-lightBorder dark:border-darkBorder rounded-md"
      }
    >
      <div className={"flex flex-row"}>
        {/* Left column */}

        <div
          onClick={() => setHideChildren((h) => !h)}
          className={"min-h-full w-0  md:w-4 flex-none  cursor-pointer group"}
        >
          <div className="flex-none w-2 min-h-full bg-blue-600 hover:bg-blue-800 group-hover:bg-blue-800 dark:bg-red-700 rounded-l-md dark:hover:bg-red-600 dark:group-hover:bg-red-600"></div>
          {/* Vote Buttons */}
        </div>
        <div
          className={
            " flex-col items-center justify-start flex-none pr-2 pt-4 hidden " +
            (hideChildren ? " hidden " : " md:flex ")
          }
        >
          <BiUpvote
            onClick={(e) => castVote(e, 1)}
            className={
              (vote === 1 && "text-upvote ") +
              " flex-none cursor-pointer w-6 h-6 hover:text-upvote hover:scale-110"
            }
          />{" "}
          <BiDownvote
            onClick={(e) => castVote(e, -1)}
            className={
              (vote === -1 && "text-downvote ") +
              " flex-none cursor-pointer w-6 h-6 hover:text-downvote hover:scale-110"
            }
          />{" "}
        </div>

        {/* Comment Body */}
        <div
          className={"flex-grow mt-3  " + (hideChildren && " md:pl-8 mb-3")}
          onClick={(e) => {
            e.stopPropagation();
            setHideChildren((h) => !h);
          }}
        >
          {/* Author */}
          <div className="flex flex-row justify-start pl-3 space-x-1 text-base text-gray-400 md:pl-0 dark:text-gray-500">
            <h1 className="">{`${comment?.data?.author}`}</h1>
            <p>•</p>
            <h1 className={(vote === 1 ? "text-upvote" : vote===-1 ? "text-downvote" : "")}>{score ?? "0"} pts</h1>
            <p>•</p>
            <p className="">
              {Math.floor(
                (Math.floor(Date.now() / 1000) - comment?.data?.created_utc) /
                  3600
              )}{" "}
              hours ago
            </p>
          </div>

          {/* Main Comment Body */}
          <div className={(hideChildren ? "hidden" : " ") + " "}>
            <div className="flex-grow ">
              {/* Comment Text */}
              <div
                className="pb-2 pl-3 md:pl-0"
                id="innerhtml"
                dangerouslySetInnerHTML={{
                  __html:
                    comment?.data?.body_html ??
                    `<div>${comment?.data?.body ?? "No comment found"}</div>`,
                }}
              ></div>

              {/* Children */}
              <div className="min-w-full py-2">
                {comment?.data?.replies?.data?.children.map(
                  (childcomment, i) => (
                    <div key={`${i}_${childcomment?.data?.id}`}>
                      {childcomment.kind == "more" ? (
                        <div className={hideChildren ? "hidden" : " "}>
                          {!moreLoaded ? (
                            <div
                              className="pt-2 pl-3 cursor-pointer hover:font-semibold md:pl-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                loadChildComments(
                                  childcomment?.data?.children,
                                  comment?.data?.link_id
                                );
                              }}
                            >
                              {"Load More... " +
                                `(${childcomment.data?.count})`}
                            </div>
                          ) : (
                            moreComments?.map((morecomment, i) => (
                              <ChildComments
                                key={i + morecomment?.data?.id}
                                comment={morecomment}
                                depth={morecomment?.data?.depth ?? depth + 1}
                                hide={hideChildren}
                              />
                            ))
                          )}
                        </div>
                      ) : (
                        <ChildComments
                          comment={childcomment}
                          depth={depth + 1}
                          hide={hideChildren}
                        />
                      )}
                    </div>
                  )
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
