import { useState } from "react";
import { loadMoreComments } from "../RedditAPI";

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
    // const fixed = [];
    // let fixindex = 0;
    // let depthindex = {}
    // comments.forEach((comment,i) => {
    // if (i===0){
    //   depthindex[comment.data.depth] = fixindex;
    //   depth = comment.data.depth;
    //   fixed.push(comment);
    //   fixed[fixindex].replies.data.children = [];
    // } else if (comment.data.depth === depth+1){
    //   fixed[depthindex[depth]].replies.data.children.push(comment);
    //   depthindex[comment.data.depth] =
    // }
    // });
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
      idIndex.forEach((comment,i) => {
        if (comment?.data?.depth === basedepth) {
          fixedcomments.push(comment);
        } else {
          console.log(i,comment.data.parent_id,comment.data.body);
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
        `${depth !== 0 ? "ml-10 " : ""}` +
        (depth == 0
          ? "bg-red-500"
          : depth % 2 === 0
          ? " bg-green-400"
          : "bg-blue-400") +
        (hide ? " hidden " : "")
      }
    >
      <h1 className="font-bold">{depth}</h1>

      <div onClick={() => setHideChildren((h) => !h)}>{"+"}</div>

      <div>{`${comment?.data?.author} : ${comment?.data?.body}`}</div>
      <div className="">
        {comment?.data?.replies?.data?.children.map((childcomment, i) => (
          <div key={`${i}_${childcomment?.data?.id}`}>
            {childcomment.kind == "more" ? (
              <div>
                {!moreLoaded ? (
                  <div
                    onClick={() =>
                      loadChildComments(
                        childcomment.data.children,
                        comment?.data?.link_id
                      )
                    }
                  >
                    {"Load More... " + `(${childcomment.data?.count})`}
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
        ))}
      </div>
      <div></div>
    </div>
  );
};

export default ChildComments;
