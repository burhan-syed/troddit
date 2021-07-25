import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import Post from "./Post";
import axios from "axios";

const Feed = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState("");
  const [subreddits, setSubreddits] = useState([]);
  const BASE_URL = "https://www.reddit.com/";

  // let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
  // let limitUrl     = "limit=" + limit;
  // let afterUrl     = (after == null) ? "" : "&after="+after;
  // let countUrl     = (count == 0) ? "" : "&count="+count;
  // let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}.json?&after=${after}`, {
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
  }, []);

  const loadmore = () => {
    setLoadingMore(true);
    //console.log(after);
    fetch(`${BASE_URL}.json?&after=${after}`)
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        data.data.children.forEach((post) => {
          const apost = {
            ...[post.data],
          };
          posts.push(apost);
        });
        setLoadingMore(false);
        setAfter(data.data.after);
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
      <div className="flex-wrap justify-center px-5 my-10 sm:grid md:grid-cols-2 xl:grid-cols-3 3xl:flex">
        {posts.map((post) => (
          <Post key={post[0].id} post={post[0]} />
        ))}
      </div>
      {loadingMore ? <h1>Loading More</h1> : <div></div>}
      <button onClick={loadmore}>Load More</button>
    </section>
  );
};

export default Feed;
