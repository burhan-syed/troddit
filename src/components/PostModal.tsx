import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import { loadPost } from "../RedditAPI";
import Media from "./Media";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [post_comments, setComments] = useState([]);

  useEffect(() => {
    const fetchPost = async () => {
      const { post, comments } = await loadPost(permalink);
      //console.log(post);
      setPost(post);
      //console.log(comments);
      setComments(comments);
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
    <div className="fixed inset-0 z-20 w-screen h-screen min-h-screen border-4 border-red-500 overflow-y-none overscroll-y-contain">
      <div className="flex flex-row h-screen ">
        <div
          onClick={() => handleBack()}
          className="left-0 bg-black lg:w-1/6 opacity-80 "
        ></div>
        <div className="mt-10 overflow-y-auto border-4 border-green-600 lg:w-4/6 md:flex md:flex-col md:items-center overscroll-y-contain ">
          {/* media */}
          <div className="w-full bg-gray-400 border-4 border-blue-500">
            <h1>{apost?.title}</h1>
              <div className="block bg-green-900 border-2 border-blue-600">
                <Media post={apost} allowIFrame={true} imgFull={true} />
              </div>
          </div>

          {/* comments */}
          <div
            className="w-full text-white border-4 border-yellow-500 "
          >
            <Comments comments={post_comments} depth={0} />
          </div>
        </div>
        <div
          onClick={() => handleBack()}
          className="right-0 bg-black lg:w-1/6 opacity-80 "
        ></div>
      </div>
    </div>
  );
};

export default PostModal;
