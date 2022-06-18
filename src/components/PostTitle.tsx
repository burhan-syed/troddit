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
    >
      {`${post?.title ?? ""}`}
    </h1>
  );
};

export default PostTitle;
