import { useEffect } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";

const PostModal = ({ post, setSelect }) => {
  const router = useRouter();

  const handleBack = () => {
    setSelect(false);
    router.back();
  };

  return (
    <div className="fixed inset-0 z-10 w-full h-screen overflow-y-auto bg-black ">
      <div className="flex flex-col items-center flex-none w-5/6">
        <div className="bg-white h-60"></div>
        <div
          onClick={() => handleBack()}
          className="flex-none text-white border-4 border-yellow-500"
        >
          <Comments post={post} depth={0} />
        </div>
      </div>
    </div>
  );
};

export default PostModal;
