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
    <div className="fixed inset-0 z-10 w-screen h-screen min-h-screen overflow-y-auto border-4 border-red-500 overscroll-y-contain">
      <div className="flex flex-row flex-none ">
        <div
          onClick={() => handleBack()}
          className="left-0 object-contain w-1/5 bg-black opacity-80 blur"
        ></div>
        <div className="border-4 border-green-600 md:w-4/6 md:flex md:flex-col md:items-center ">
          <div className="w-full border-4 border-blue-500 ">
            <h1>{apost?.title}</h1>
            <div className="">
              <div className="flex flex-col items-center max-h-full bg-green-900 border-2 border-green-600">
                <Media post={apost} allowIFrame={true} imgFull={true} />
              </div>
            </div>
          </div>

          <div
            // onClick={() => handleBack()}
            className="w-full text-white border-4 border-yellow-500 "
          >
            <Comments comments={post_comments} depth={0} />
          </div>
        </div>
        <div
          onClick={() => handleBack()}
          className="right-0 w-1/5 bg-black opacity-80 blur "
        ></div>
      </div>
    </div>
  );
};

export default PostModal;
