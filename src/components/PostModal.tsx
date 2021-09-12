import { useEffect, useState } from "react";
import Comments from "./Comments";
import { useRouter } from "next/router";
import { loadPost } from "../RedditAPI";
import Media from "./Media";

import { CgCloseO } from "react-icons/cg";

const PostModal = ({ setSelect, returnRoute, permalink }) => {
  const router = useRouter();
  const [apost, setPost] = useState<any>({});
  const [post_comments, setComments] = useState([]);
  const [loadingPost, setLoadingPost] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      const { post, comments } = await loadPost(permalink);
      setPost(post);
      //setLoadingPost(false);
      setComments(comments);
      //setLoadingComments(false);
    };
    fetchPost();
    return () => {
      setPost({});
      setComments([]);
      setLoadingComments(true);
      setLoadingPost(true);
    };
  }, [permalink]);

  const handleBack = () => {
    setSelect(false);
    console.log("Clicked back");
    //for handling returning to [frontsort] routes, only clicking in the app works... browser back button kicks to front page
    if (returnRoute) {
      console.log("last route", returnRoute);
      router.push(returnRoute);
    } else {
      router.back();
    }
  };

  return (
    <div className="fixed inset-0 z-20 w-screen h-screen min-h-screen overflow-y-auto border-4 border-red-500 cursor-pointer ">
      <div className="flex flex-row h-screen">
        <div
          onClick={() => handleBack()}
          className="left-0 bg-black lg:w-1/12 opacity-80 "
        ></div>
        <div className="mt-10 overflow-y-auto border-4 border-green-600 lg:w-10/12 md:flex md:flex-col md:items-center overscroll-y-contain ">
          <div className="flex flex-row w-full lg:hidden bg-coolGray-600">
            <CgCloseO className="w-12 h-12 " onClick={() => handleBack()} />
          </div>
          {/* media */}
          {loadingPost ? (
            <div className="w-full p-4 mx-auto bg-black border border-blue-300 rounded-md shadow">
              <div className="flex space-x-4 animate-pulse">
                <div className="flex-1 py-1 space-y-4">
                  <div className="w-3/4 h-4 bg-blue-400 rounded"></div>
                  <div className="space-y-2">
                    <div className="bg-blue-400 rounded h-96"></div>
                    <div className="w-5/6 bg-blue-400 rounded h-44"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-gray-400 border-4 border-blue-500">
              <h1>{apost?.title}</h1>
              <div className="block bg-green-900 border-2 border-blue-600">
                <Media post={apost} allowIFrame={true} imgFull={true} />
              </div>
            </div>
          )}

          {/* comments */}
          {loadingComments ? (
            <div className="w-full p-4 mx-auto bg-black border border-blue-300 rounded-md shadow">
              <div className="flex space-x-4 animate-pulse">
                <div className="flex-1 py-1 space-y-4">
                  <div className="w-3/4 h-4 bg-blue-400 rounded"></div>
                  <div className="space-y-2">
                    <div className="bg-blue-400 rounded h-96"></div>
                    <div className="w-5/6 bg-blue-400 rounded h-44"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full text-white border-4 border-yellow-500">
              <Comments comments={post_comments} depth={0} />
            </div>
          )}
        </div>
        <div
          onClick={() => handleBack()}
          className="right-0 bg-black lg:w-1/12 opacity-80 "
        ></div>
      </div>
    </div>
  );
};

export default PostModal;
