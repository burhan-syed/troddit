import React from "react";

const PostTitle = ({ post, read=false }) => {
  return (
    <h1
      className={
        " hover:underline " +
        (post?.distinguished == "moderator" || post?.stickied
          ? " text-th-green "
          : " ")
          + (read ? " opacity-50 " : "")
      }
      style={{
        wordBreak: "break-word"
      }}
    >
      {`${post?.title ?? ""}`}
    </h1>
  );
};

export default PostTitle;
