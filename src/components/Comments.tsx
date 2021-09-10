import { useEffect, useState } from "react";
import { loadComments } from "../RedditAPI";
import ChildComments from "./ChildComments";

const Comments = ({ post, depth=0 }) => {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const getComments = async () => {
      const c = await (await loadComments(post.permalink)).data.children;
      console.log(c);
      setComments(c);
    };

    getComments();
    return () => {};
  }, []);
  return (
    <div >
      {comments.map((comment, i) => (
        <div key={i} className="">
          {/* <div className="bg-red-500">{`${comment?.data?.author} : ${comment?.data?.body}`}</div> */}
        <ChildComments  comment={comment} depth={depth} hide={false}/>
        </div>
      ))}
    </div>
  );
};

export default Comments;
