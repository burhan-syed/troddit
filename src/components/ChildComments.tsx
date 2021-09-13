import { useState } from "react";
import { loadMoreComments } from "../RedditAPI";
import { BiDownvote, BiUpvote } from "react-icons/bi";

import Markdown from "markdown-to-jsx";

const ChildComments = ({ comment, depth, hide }) => {
  const [moreComments, setMoreComments] = useState([]);
  const [moreLoaded, setMoreLoaded] = useState(false);

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
      console.log(idIndex);
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

      console.log(fixedcomments);
      return fixedcomments;
    }
    return comments;
  };

  const [hideChildren, setHideChildren] = useState(false);
  return (
    <div
      className={
        `${depth !== 0 ? " " : ""}` +
        (depth == 0
          ? "bg-white"
          : depth % 2 === 0
          ? " bg-white"
          : "bg-coolGray-200") +
        (hide ? " hidden " : "") +
        " border-2 border-blue-900 rounded-md "
      }
    >

      <div className={"flex flex-row"}>
        {/* Left column */}
        <div className={"w-10 flex-none flex flex-col items-center"}>
          <div
            onClick={() => setHideChildren((h) => !h)}
            className="flex-1 w-1 bg-gray-100 hover:bg-gray-400"
          ></div>
        </div>

        {/* Right Column */}
        <div className="flex-grow">
          {/* Author */}
          <div>{`${comment?.data?.author}`}</div>

          {/* Main Comment Body */}
          <div className={hideChildren && "hidden"}>
            <div className="flex-grow">
              {/* Comment Text */}
              <div
                dangerouslySetInnerHTML={{
                  __html:
                    comment?.data?.body_html ??
                    `<div>${comment?.data?.body ?? "No comment found"}</div>`,
                }}
              ></div>
              {/* Comment Buttons */}
              <div className="flex flex-row items-center justify-start">
                <BiUpvote/>
                {comment?.data?.score ?? "0"}
                <BiDownvote/>
              </div>

              {/* Children */}
              <div className="min-w-full bg-red-500">
                {comment?.data?.replies?.data?.children.map(
                  (childcomment, i) => (
                    <div key={`${i}_${childcomment?.data?.id}`}>
                      {childcomment.kind == "more" ? (
                        <div className={hideChildren && "hidden"}>
                          {!moreLoaded ? (
                            <div
                              onClick={() =>
                                loadChildComments(
                                  childcomment.data.children,
                                  comment?.data?.link_id
                                )
                              }
                            >
                              {"Load More... " +
                                `(${childcomment.data?.count})`}
                            </div>
                          ) : (
                            moreComments.map((morecomment, i) => (
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
