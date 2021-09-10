import Comments from "./Comments";

const PostModal = ({ post }) => {
  return (
    <div className="fixed inset-0 z-10 w-full h-screen overflow-y-auto bg-black ">
      <div className="flex flex-col items-center flex-none w-5/6">
        <div className="bg-white h-60">

        </div>
        <div className="flex-none text-white bg-black">
          <Comments post={post} depth={0}/>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
