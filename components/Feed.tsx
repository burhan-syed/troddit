import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import Post from "./Post";
import axios from "axios";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { getAccessToken } from "../accessToken";

const Feed = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState("");
  const [subreddits, setSubreddits] = useState(["wallpapers", "earthporn"]);
  const [subURL, setSubURL] = useState("");
  const BASE_URL = "https://www.reddit.com";

  const [mysubs, setMySubs] = useState([]);

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
    setLoading(true);

    axios
      .get(`${BASE_URL}/${configureSubs(subreddits)}.json`, {
        params: {
          raw_json: 1,
        },
      })
      .then((response) => {
        //console.log(response);
        const posts = [];
        response.data.data.children.forEach((post) => {
          const apost = {
            ...[post.data],
          };
          posts.push(apost);
        });
        setLoading(false);
        setAfter(response.data.data.after);
        setPosts(posts);
        //posts.map(post => (console.log(post[0].title)));
      });
  }, [subreddits]);

  const configureSubs = (subs) => {
    let substring = "/r/";
    console.log(subs);
    subs.forEach((sub) => {
      if (substring === "/r/") {
        substring = substring + sub;
      } else {
        substring = substring + "+" + sub;
      }
    });
    console.log(substring);
    if (substring.length <= 3) return "";
    else return substring;
  };

  const loadmore = () => {
    setLoadingMore(true);
    //console.log(after);
    axios
      .get(`${BASE_URL}/${subURL}.json?&after=${after}`, {
        params: { raw_json: 1 },
      })
      .then((response) => {
        response.data.data.children.forEach((post) => {
          const apost = {
            ...[post.data],
          };
          posts.push(apost);
        });
        setLoadingMore(false);
        setAfter(response.data.data.after);
        setPosts(posts);
        //posts.map(post => (console.log(post[0].title)));
      });
  };

  const getsubs = async () => {
    let subs = await (await axios.get("/api/reddit/mysubreddits")).data.data;
    console.log(subs);
    // let allsubs = [];
    // subs.forEach((sub) => {
    //   allsubs.push(sub.data.url);
    // });
    // setMySubs(allsubs);
  };
  const getfrontpage = async () => {
    let posts = await (await axios.get("/api/reddit/frontpage")).data;
    console.log(posts);
    let displayposts = [];
    posts.data.forEach((post) => {
      displayposts.push(post);
    });
    setPosts(displayposts);
  };

  if (loading) {
    return <section>Loading...</section>;
  }
  return (
    <section>
      <div>{mysubs}</div>
      <h1>Posts</h1>
      <button onClick={getsubs}>getsubs</button>
      <button onClick={getfrontpage}>getfrontpage</button>
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
          {posts.map((post) => (
            <Post key={post[0].id ?? post.id} post={post[0] ?? post} />
          ))}
        </Masonry>
      </InfiniteScroll>
      <button onClick={loadmore}>Load More</button>
    </section>
  );
};

export default Feed;
