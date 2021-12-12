import ChildComments from "./ChildComments";

const Comments = ({ comments, depth = 0, op="", portraitMode=false }) => {
  return (
    <div>
      {comments?.map((comment, i) => (
        <div key={`${i}_${comment?.data?.id}`} className="py-1">
          <ChildComments comment={comment} depth={depth} hide={false} op={op} portraitMode={portraitMode} />
        </div>
      ))}
    </div>
  );
};

export default Comments;
