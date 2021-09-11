import { useEffect } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";

const PostModal = ({ post, setSelect, returnRoute }) => {
  const router = useRouter();

  const handleBack = () => {
    setSelect(false);
    //for handling returning to [frontsort] routes, only clicking in the app works... browser back button kicks to front page
    if (returnRoute) {
      console.log("last route", returnRoute);
      router.push(returnRoute);
    } else {
      router.back();
    }
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
