import React from "react";

const PostTitle = ({ post, read = false, newPost = false }) => {
  return (
    <h2>
      <span
        className={
          " hover:underline " +
          (post?.distinguished == "moderator" || post?.stickied
            ? " text-th-green "
            : " ") +
          (read ? " opacity-50 " : "") + 
          (newPost ? " mr-2" :"")
        }
        style={{
          wordBreak: "break-word",
        }}
      >{`${post?.title ?? ""}`}</span>
      {newPost && (
        <span className="text-xs italic font-light text-th-textLight">{`(new)`}</span>
      )}
    </h2>
  );
};

export default PostTitle;
