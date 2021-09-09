import { useEffect, useState } from "react";
import Post from "./Post";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { loadFront, loadSubreddits } from "../RedditAPI";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { getSession, useSession } from "next-auth/client";

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
    default: 4,
    1400: 3,
    1280: 2,
    767: 1,
  };
  useEffect(() => {
    //console.log(query);
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
  }, [query, range, sort, subreddits]);

  const fetchFront = async () => {
    let data = await loadFront(query?.frontsort ?? "hot", query?.t ?? "");
    if (data) {
      setLoading(false);
      setAfter(data?.after);
      setPosts(data.children);
    }
  };

  const fetchSubs = async () => {
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
    return (<div className="absolute w-screen h-1 bg-blue-700 animate-pulse"></div>);
  }
  if (error) {
    return <div>{"Oops something went wrong :("}</div>;
  }
  return (
    <section className="bg-gray">
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
      <button onClick={loadmore}>Load More</button>
    </section>
  );
};

export default Feed;
