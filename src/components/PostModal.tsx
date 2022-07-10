import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { RiArrowGoBackLine } from "react-icons/ri";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";
import { useMainContext } from "../MainContext";
import { useKeyPress } from "../hooks/KeyPress";
import Thread from "./Thread";
import useFeedGallery from "../hooks/useFeedGallery";

const PostModal = ({
  setSelect,
  returnRoute,
  permalink,
  curKey,
  fetchMore = () => {},
  allPosts = [] as any[],
  postData = {},
  postNum,
  direct = false,
  commentsDirect = false,
  commentMode = false,
  withcontext = false,
}) => {
  const router = useRouter();
  const context: any = useMainContext();
  const { getFeedData } = useFeedGallery();
  const [flattenedPosts, setFlattenedPosts] = useState(
    () => getFeedData() as any[]
  );

  const [sort, setSort] = useState<string>(
    (router?.query?.sort as string) ?? "top"
  );
  const [curPost, setCurPost] = useState<any>(postData);
  const [curPostNum, setCurPostNum] = useState(postNum);

  //prevent scrolling on main body when open
  useEffect(() => {
    if (true) {
      const width = document.body.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.width = `${width}px`;
    } else {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    }

    return () => {
      document.body.style.overflow = "visible";
      document.body.style.width = `auto`;
    };
  }, []);

  const updateSort = async (e, sort) => {
    e.preventDefault();
    setSort(sort);
  };

  const handleBack = () => {
    setSelect(false);
    if (returnRoute === "multimode") {
      //do nothing
    } else if (returnRoute) {
      //console.log("last route", returnRoute);
      router.replace(returnRoute);
    } else {
      router.back();
    }
  };

  useEffect(() => {
    if (curPostNum + 5 > flattenedPosts?.length) fetchMore();
    let feedData = getFeedData() as any[];
    if (feedData?.length !== flattenedPosts?.length)
      setFlattenedPosts(feedData);
  }, [curPostNum]);

  const changePost = (move: 1 | -1) => {
    if (flattenedPosts?.[curPostNum + move]?.data) {
      const nextPost = flattenedPosts?.[curPostNum + move]?.data;
      setCurPost(nextPost);
      if (
        !(
          router.route === "/u/[...slug]" &&
          router.query?.slug?.[1]?.toUpperCase() === "M"
        )
      ) {
        router.replace(
          "",
          router.query?.frontsort
            ? nextPost?.id
            : router.route === "/u/[...slug]"
            ? `/u/${router?.query?.slug?.[0]}${nextPost?.permalink}`
            : nextPost.permalink,
          {
            shallow: true,
          }
        );
      }
      setCurPostNum((p) => p + move);
    }
  };

  const nextPress = useKeyPress("ArrowRight");
  const backPress = useKeyPress("ArrowLeft");
  const escapePress = useKeyPress("Escape");

  useEffect(() => {
    if (!context.replyFocus) {
      if (nextPress) {
        changePost(1);
      } else if (backPress) {
        changePost(-1);
      } else if (escapePress) {
        handleBack();
      }
    }

    return () => {};
  }, [nextPress, backPress, escapePress, context.replyFocus]);

  const [touchStart, setTouchStart] = useState([0]);
  const [touchEnd, setTouchEnd] = useState([0]);
  const [touchStartY, setTouchStartY] = useState([0]);
  const [touchEndY, setTouchEndY] = useState([0]);
  const handleTouchStart = (e) => {
    touchStart[0] = e.targetTouches[0].clientX as number;
    touchStartY[0] = e.targetTouches[0].clientY as number;
  };
  const handleTouchMove = (e) => {
    touchEnd[0] = e.targetTouches[0].clientX as number;
    touchEndY[0] = e.targetTouches[0].clientY as number;
  };
  const handleTouchEnd = (e) => {
    if (touchStart[0] - touchEnd[0] > 100) {
    } else if (
      touchStart[0] - touchEnd[0] < -100 &&
      Math.abs(touchStartY[0] - touchEndY[0]) < 20
    ) {
      handleBack();
    }
  };

  return (
    <div
      className={
        "fixed inset-0 z-30 w-screen min-w-full min-h-screen overflow-y-auto overscroll-y-contain"
      }
      onTouchStart={(e) => handleTouchStart(e)}
      onTouchMove={(e) => handleTouchMove(e)}
      onTouchEnd={(e) => handleTouchEnd(e)}
    >
      <div
        onClick={() => handleBack()}
        className="fixed top-0 left-0 w-screen h-full bg-black/75 opacity-80 backdrop-filter backdrop-blur-lg overscroll-none"
      ></div>
      <div
        className={
          "fixed z-50 right-5 bottom-5 md:left-4 md:top-16 md:bottom-auto  " +
          " bg-th-border/40  backdrop-opacity-10 backdrop-blur-lg rounded-full w-14 h-9 flex items-center justify-center md:dark:bg-transparent md:bg-transparent  md:h-auto   "
        }
      >
        <RiArrowGoBackLine
          title={"back (esc)"}
          onClick={() => handleBack()}
          className={
            "w-8 h-8 md:mt-1  md:text-gray-400 cursor-pointer md:hover:text-gray-300"
          }
        />
      </div>
      {flattenedPosts?.[curPostNum - 1]?.data && (
        <div
          title={`previous post (left arrow)`}
          onClick={(e) => changePost(-1)}
          className="fixed hidden p-2 text-gray-400 cursor-pointer md:block left-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineLeft className="w-10 h-10" />
        </div>
      )}
      <Thread
        key={curPost?.name ?? curPostNum}
        permalink={direct ? permalink : curPost?.permalink}
        commentMode={commentMode}
        initialData={curPost}
        updateSort={updateSort}
        sort={sort}
        commentsDirect={commentsDirect}
        goBack={handleBack}
        withContext={withcontext}
      />
      {/* context.posts?.length > 0 */}
      {flattenedPosts?.[curPostNum + 1]?.data && (
        <div
          title={`next post (right arrow)`}
          onClick={(e) => changePost(1)}
          className="fixed hidden p-2 text-gray-400 cursor-pointer md:block right-4 hover:text-gray-300 top-1/2"
        >
          <AiOutlineRight className="w-10 h-10" />
        </div>
      )}
    </div>
  );
};

export default PostModal;
