import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import { loadPost } from "../RedditAPI";
import Media from "./Media";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [post, setPost] = useState({});
  const [comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      const data = await loadPost(permalink);
      if (data) {
        console.log(data);
        setPost(data?.post);
        setComments(data?.comments);
      }
    };
    fetchPost();
    return () => {
      setPost({});
      setComments([]);
    };
  }, [permalink]);

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
    <div className="fixed inset-0 z-10 w-full h-screen overflow-y-auto bg-black overscroll-y-contain">
      <div className="flex flex-col items-center flex-none w-5/6">
        <div className=""><Media post={post} allowIFrame={true}/></div>

        <div
          // onClick={() => handleBack()}
          className="flex flex-row flex-none text-white border-4 border-yellow-500 "
        >
          <Comments comments={comments} depth={0} />
        </div>
      </div>
    </div>
  );
};

export default PostModal;
