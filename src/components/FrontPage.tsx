import { useEffect, useState } from "react";
import Post from "./Post";
import Search from "./Search";
import axios from "axios";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";

import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { getSession, useSession } from "next-auth/client";
//import { fetchFrontPage } from "../redditapi/frontpage";

const FrontPage = ({ sort, range }) => {
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [posts, setPosts] = useState([]);
  const [after, setAfter] = useState("");
  const [subURL, setSubURL] = useState("");
  const BASE_URL = "https://www.reddit.com";

  const [mysubs, setMySubs] = useState([]);

  const context:any = useMainContext();

  const [session, sessionLoading] = useSession();

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

    const fetchFrontPage = async () => {
      console.log(context);
      if (context?.token?.accessToken ?? false) {
        //console.log("token!");
        //console.log(range);
        axios
          .get(`https://oauth.reddit.com/${sort}`, {
            headers: {
              authorization: `bearer ${context.token.accessToken}`,
            },
            params: {
              raw_json: 1,
              t: range,
            },
          })
          .then((response) => {
            // const posts = [];
            // response.data.data.children.forEach((post) => {
            //   posts.push(post.data);
            // });
            setLoading(false);
            setAfter(response.data.data.after);
            setPosts(response.data.data.children);
            //console.log(posts);
          })
          .catch((err) => {
            const token = getSession();
            console.log(err)
          });
      } else {
        axios
          .get(`${BASE_URL}/${sort}.json?t=${range}`, {
            params: {
              raw_json: 1,
            },
          })
          .then((response) => {
            //console.log(response);
            // const posts = [];
            // response.data.data.children.forEach((post) => {
            //   posts.push(post.data);
            // });
            setLoading(false);
            setAfter(response.data.data.after);
            setPosts(response.data.data.children);
          });
      }
    };
  

    fetchFrontPage();
    return (() => {
      setPosts([]);
      setAfter("");
      setLoading(false);
    })
  }, [route, context, session?.token, range, sort]);

  const initialLoad = async () => {
    if (sort != undefined) {
      //fetchFrontPage();
    }
  };

  

  const loadmore = () => {
    setLoadingMore(true);
    //console.log(after);
    if (context?.token?.accessToken ?? false) {
      //console.log(range);
      axios
        .get(`https://oauth.reddit.com/${sort}`, {
          headers: {
            authorization: `bearer ${context.token.accessToken}`,
          },
          params: {
            after: after,
            count: posts.length,
            raw_json: 1,
            t: range,
          },
        })
        .then((response) => {
          // response.data.data.children.forEach((post) => {
          //   posts.push(post.data);
          // });
          setLoading(false);
          setAfter(response.data.data.after);
          setPosts(prevposts => ([...prevposts, ...response.data.data.children]));
          //console.log(posts);
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
          // response.data.data.children.forEach((post) => {
          //   posts.push(post.data);
          // });
          setLoadingMore(false);
          setAfter(response.data.data.after);
          setPosts(prevposts => ([...prevposts, ...response.data.data.children]));
          //posts.map(post => (console.log(post[0].title)));
        });
    }
  };

  if (loading) {
    return <section>Loading...</section>;
  }
  return (
    <section className="bg-gray">
      <div>{mysubs}</div>
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
            <Post key={`${post.data.id}_${i}`} post={post.data} />
          ))}
        </Masonry>
      </InfiniteScroll>
      <button onClick={loadmore}>Load More</button>
    </section>
  );
};

export default FrontPage;
