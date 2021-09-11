import { useEffect, useState } from "react";
import Post from "./Post";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { loadFront, loadPost, loadSubreddits } from "../RedditAPI";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { getSession, useSession } from "next-auth/client";
import PostModal from "./PostModal";

const Feed = ({ query }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState("");

  const [sort, setSort] = useState("");
  const [range, setRange] = useState("");
  const [subreddits, setSubreddits] = useState("");

  const context: any = useMainContext();

  const [session, sessionLoading] = useSession();

  const route = useRouter();
  const breakpointColumnsObj = {
    default: 3,
    1400: 3,
    1280: 2,
    767: 1,
  };
  useEffect(() => {
    //console.log(query);
    console.log("new posts");
    if (query.frontsort) {
      setSort(query?.frontsort ?? "best");
      setRange(query?.t ?? "");
      fetchFront();
    }
    if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "best");
      setRange(query?.t ?? "");
      fetchSubs();
    }
    // console.log(query?.slug?.[0] ?? "noslug");
    // console.log("sort", sort);
    // console.log("range", range);
    // console.log("subreddits", subreddits);

    return () => {
      setPosts([]);
      setAfter("");
      setRange("");
      setSubreddits("");
      setLoading(true);
    };
  }, [range, sort, subreddits]);

  //determine if we need to load new posts
  const [newFeed, setNewFeed] = useState(false);
  useEffect(() => {
    console.log("FRONT", query);
    if (query.frontsort) {
      setSort(query?.frontsort ?? "best");
      setRange(query?.t ?? "");
    }
    if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "best");
      setRange(query?.t ?? "");
    }
    return () => {
      ("");
    };
  }, [query]);

  const fetchFront = async () => {
    let data = await loadFront(query?.frontsort ?? "hot", query?.t ?? "");
    if (data) {
      setLoading(false);
      setAfter(data?.after);
      setPosts(data.children);
    }
  };

  const [fetchPost, setFetchPost] = useState(false);

  const fetchSubs = async () => {
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
      setLoading(false);
    } else {
      let data = await loadSubreddits(
        query?.slug?.[0] ?? "",
        query?.slug?.[1] ?? "hot",
        query?.t ?? ""
      );
      if (data) {
        setLoading(false);
        setAfter(data?.after);
        setPosts(data.children);
      } else {
        setLoading(false);
        setError(true);
      }
    }
  };

  const loadmore = async () => {
    setLoadingMore(true);
    //console.log(after);
    let data = { after: "", children: [] };
    if (!subreddits) {
      data = await loadFront(sort, range, after, posts.length);
    } else {
      data = data = await loadSubreddits(
        query?.slug?.[0] ?? "",
        query?.slug?.[1] ?? "hot",
        query?.t ?? "",
        after,
        posts.length
      );
    }
    setAfter(data?.after);
    setPosts((prevposts) => [...prevposts, ...data.children]);
  };

  if (loading) {
    return (
      <div className="absolute w-screen h-1 bg-blue-700 animate-pulse"></div>
    );
  }
  if (fetchPost) {
    return (
      <div className="mt-10">
        FETCHING A POST
        <PostModal
          permalink={"/r/" + query.slug.join("/")}
          returnRoute={query.slug?.[0] ? `/r/${query.slug[0]}` : "/"}
          setSelect={setFetchPost}
        />
      </div>
    );
  }
  if (error) {
    return <div>{"Oops something went wrong :("}</div>;
  }
  return (
    <section className="flex flex-col items-center flex-none w-screen pt-5">
      {`query: slug[0] ${query?.slug?.[0]}   slug[1] ${query?.slug?.[1]}   t: ${query?.t}`}
      <div className="w-5/6">
        <InfiniteScroll
          dataLength={posts.length}
          next={loadmore}
          hasMore={after ? true : false}
          loader={<h1>Loading More..</h1>}
          endMessage={
            <p className="text-align-center">
              <b>You have reached the end</b>
            </p>
          }
        >
          <Masonry
            breakpointCols={breakpointColumnsObj}
            className="my-masonry-grid"
            columnClassName="my-masonry-grid_column"
          >
            {posts.map((post, i) => (
              <Post key={`${post.data.id}_${i}`} post={post.data} />
            ))}
          </Masonry>
        </InfiniteScroll>
      </div>
      <button onClick={loadmore}>Load More</button>
    </section>
  );
};

export default Feed;
