import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import Post from "./Post";
import Search from "./Search";
import axios from "axios";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";
import { b2a } from "../accessToken";
import Snoowrap from "snoowrap";
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/client";
//import { fetchFrontPage } from "../redditapi/frontpage";

const FrontPage = () => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState("");
  const [subURL, setSubURL] = useState("");
  const BASE_URL = "https://www.reddit.com";

  const [mysubs, setMySubs] = useState([]);
  const [session, sessionloading] = useSession();
  const [accessToken, setAccessToken] = useState("");
  const [refreshtoken, setRefreshToken] = useState("");

  const breakpointColumnsObj = {
    default: 4,
    1920: 3,
    1280: 2,
    767: 1,
  };

  // let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
  // let limitUrl     = "limit=" + limit;
  // let afterUrl     = (after == null) ? "" : "&after="+after;
  // let countUrl     = (count == 0) ? "" : "&count="+count;
  // let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;
  useEffect(() => {
    initialLoad();
  }, [accessToken]);

  const initialLoad = async () => {
    setLoading(true);
    //const snoowrap = new Snoowrap();
    const session = await getSession();
    if (session) {
      await getToken();
    }
    fetchFrontPage(accessToken);
  };

  const fetchFrontPage = async (token?: string, sort?: string) => {
    if (token) {
      console.log("token!");
      axios
        .get(`https://oauth.reddit.com/hot`, {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            raw_json: 1,
          },
        })
        .then((response) => {
          const posts = [];
          response.data.data.children.forEach((post) => {
            posts.push(post.data);
          });
          setLoading(false);
          setAfter(response.data.data.after);
          setPosts(posts);
          console.log(posts);
        })
        .catch((err) => console.log(err));
    } else {
      axios
        .get(`${BASE_URL}/.json`, {
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
        });
    }
  };

  const getToken = async () => {
    let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
    console.log(tokendata);
    setAccessToken(tokendata.data.accessToken);
    setRefreshToken(tokendata.data.refreshtoken);
  };

  const loadmore = () => {
    setLoadingMore(true);
    //console.log(after);
    if (accessToken) {
      axios
        .get(`https://oauth.reddit.com/hot`, {
          headers: {
            authorization: `bearer ${accessToken}`,
          },
          params: {
            after: after,
            count: posts.length,
            raw_json: 1,
          },
        })
        .then((response) => {
          response.data.data.children.forEach((post) => {
            posts.push(post.data);
          });
          setLoading(false);
          setAfter(response.data.data.after);
          setPosts(posts);
          console.log(posts);
        })
        .catch((err) => console.log(err));
    } else {
      axios
        .get(
          `${BASE_URL}/${subURL}.json?&after=${after}&count=${posts.length}`,
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
    }
  };

  if (loading) {
    return <section>Loading...</section>;
  }
  return (
    <section>
      <div>{accessToken}</div>
      <div>{mysubs}</div>
      <Search/>
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

export default FrontPage;
