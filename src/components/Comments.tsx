import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useMainContext } from "../MainContext";
import { loadMoreComments, loadPost } from "../RedditAPI";
import ChildComments from "./ChildComments";

const Comments = ({ comments, sort="top", depth = 0, op = "", portraitMode = false, }) => {
  const { data: session, status } = useSession();
  const context: any = useMainContext();
  const [commentsData, setCommentsData] = useState(comments);
  const [moreLoading, setMoreLoading] = useState(false);
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

  const loadChildComments = async (children: string[], link_id) => {
    let childrenstring = children.join(",");
    if (session) {
      setMoreLoading(true);
      const data = await loadMoreComments(
        childrenstring,
        link_id,
        undefined,
        session ? true : false,
        context?.token,
        sort
      );
      data?.token && context?.setToken(data?.token);
      let morecomments = await fixformat(data?.data);
      setCommentsData((c) => [
        ...c.filter((comment) => comment?.kind !== "more"),
        ...morecomments,
      ]);
      setMoreLoading(false);
    } else {
      context.toggleLoginModal();
    }
  };
  return (
    <div className="">
      {commentsData?.map((comment, i) => (
        <div key={`${i}_${comment?.data?.id}`} className="py-1 ">
          {comment?.kind === "more" ? (
            <button
              className={
                "text-sm pl-2 text-semibold flex hover:font-semibold w-full " +
                (moreLoading ? " animate-pulse" : " ")
              }
              disabled={moreLoading}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                loadChildComments(
                  comment?.data?.children,
                  comment?.data?.parent_id
                );
              }}
            >
              Load {comment?.data?.count} More...
            </button>
          ) : (
            <>
              <ChildComments
                comment={comment}
                depth={depth}
                hide={false}
                op={op}
                portraitMode={portraitMode}
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default Comments;
