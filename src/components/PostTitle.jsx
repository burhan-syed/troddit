const PostTitle = ({ post }) => {
  return (
    <div
      className={
        " group-hover:underline " +
        (post?.distinguished == "moderator" || post?.stickied
          ? " text-lightGreen dark:text-darkGreen"
          : " ")
      }
    >
      {`${post?.title ?? ""}`}
    </div>
  );
};

export default PostTitle;
