import { useEffect, useState } from "react";
import Post from "./Post";
import Search from "./Search";
import axios from "axios";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";

import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/client";
import { useRouter } from "next/router";
//import { fetchFrontPage } from "../redditapi/frontpage";

const FrontPage = ({ sort, range }) => {
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

  const route = useRouter();
  const breakpointColumnsObj = {
    default: 4,
    1400: 3,
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
  }, [accessToken, route]);

  const initialLoad = async () => {
    //const snoowrap = new Snoowrap();
    const session = await getSession();
    if (session) {
      await getToken();
    }
    if (sort != undefined) {
      fetchFrontPage(accessToken, sort);
    }
  };

  const fetchFrontPage = async (token?: string, sort?: string) => {
    if (token) {
      console.log("token!");
      console.log(range);
      axios
        .get(`https://oauth.reddit.com/${sort}`, {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            raw_json: 1,
            t: range,
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
        .get(`${BASE_URL}/${sort}.json?t=${range}`, {
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
      console.log(range);
      axios
        .get(`https://oauth.reddit.com/${sort}`, {
          headers: {
            authorization: `bearer ${accessToken}`,
          },
          params: {
            after: after,
            count: posts.length,
            raw_json: 1,
            t: range,
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
          `${BASE_URL}/${sort}.json??t=${range}&after=${after}&count=${posts.length}`,
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
      <Search accessToken={accessToken} />
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
