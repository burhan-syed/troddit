import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import Post from "./Post";
import axios from "axios";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { b2a } from "../accessToken";
import Snoowrap from "snoowrap";
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/client";
//import { fetchFrontPage } from "../redditapi/frontpage";

const Feed = ({ subreddits, sort }) => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState("");
  const [subURL, setSubURL] = useState("");
  const BASE_URL = "https://www.reddit.com";

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  // let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
  // let limitUrl     = "limit=" + limit;
  // let afterUrl     = (after == null) ? "" : "&after="+after;
  // let countUrl     = (count == 0) ? "" : "&count="+count;
  // let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;
  useEffect(() => {
    console.log(subreddits);
    fetchPage();
  }, [subreddits, sort]);

  const fetchPage = async () => {
    subreddits
      ? axios
          .get(`${BASE_URL}/r/${subreddits}/${sort}/.json`, {
            params: {
              raw_json: 1,
            },
          })
          .then((response) => {
            //console.log(response);
            const posts = [];
            response.data.data.children.forEach((post) => {
              posts.push(post.data);
            });
            setLoading(false);
            setAfter(response.data.data.after);
            setPosts(posts);
            console.log(posts);
            //posts.map(post => (console.log(post[0].title)));
          })
          .catch((err) => console.log(err))
      : "";
  };

  const loadmore = () => {
    setLoadingMore(true);
    //console.log(after);
    axios
      .get(
        `${BASE_URL}/r/${subreddits}/${sort}/.json?&after=${after}&count=${posts.length}`,
        {
          params: { raw_json: 1 },
        }
      )
      .then((response) => {
        response.data.data.children.forEach((post) => {
          posts.push(post.data);
        });
        setLoadingMore(false);
        setAfter(response.data.data.after);
        setPosts(posts);
        //posts.map(post => (console.log(post[0].title)));
      });
  };

  if (loading) {
    return <section>Loading...</section>;
  }
  return (
    <section>
      <h1>Posts</h1>
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
            <Post key={`${post.id}_${i}`} post={post} />
          ))}
        </Masonry>
      </InfiniteScroll>
      <button onClick={loadmore}>Load More</button>
    </section>
  );
};

export default Feed;
