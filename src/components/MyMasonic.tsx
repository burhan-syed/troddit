/* eslint-disable react/no-children-prop */
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import useWindowScroll from "@react-hook/window-scroll";
import { useWindowSize } from "@react-hook/window-size";
import {
  MasonryScroller,
  Masonry,
  useContainerPosition,
  usePositioner,
  useInfiniteLoader,
} from "masonic";
import { loadFront, loadSubreddits } from "../RedditAPI";
import Post from "./Post";
import * as gtag from "../../lib/gtag";

const randInt = (min = 200, max = 500) =>
  Math.floor(Math.random() * (max - min)) + min;
// const getFakeItems = (cur = 0) => {
//   const fakeItems = [];
//   for (let i = 5000 * cur; i < cur * 5000 + 5000; i++)
//     fakeItems.push({ id: i, height: randInt() });
//   return fakeItems;
// };

const getFakeItems = (start = 0, end = 32) => {
  const fakeItems = [];
  for (let i = start; i < end + 10; i++)
    fakeItems.push({ id: i, height: randInt() });
  return fakeItems;
};

const getFakeItemsPromise = (start, end) =>
  Promise.resolve(getFakeItems(start, end));

let allowload = true;

const MyMasonic = ({ query, initItems, initAfter,  }) => {
  const [posts, setPosts] = useState([]);
  const [numposts, setNumPosts] = useState(0);
  const [after, setAfter] = useState("");
  const [subreddits, setSubreddits] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [items, setItems] = useState([]);

  const [sort, setSort] = useState("");
  const [range, setRange] = useState("");

  useEffect(() => {
    if (query.frontsort) {
      setSort(query?.frontsort ?? "best");
      setRange(query?.t ?? "");
    }
    if (query.slug) {
      setSubreddits(query?.slug?.[0] ?? "");
      setSort(query?.slug?.[1] ?? "best");
      setRange(query?.t ?? "");
    }

    setAfter(initAfter);
    setNumPosts(initItems.length);
    setItems(initItems);
    setLoading(false);
    
    return () => {
      setFetchPost(false);
      setError(false);
      setItems([]);
      setAfter("");
      setRange("");
      setSubreddits("");
      setLoading(true);
      setCount(0);
    };
    //handling these in the other useeffect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initItems,initAfter]);

  useEffect(() => {
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

  const getPostsPromise = (start, end) => Promise.resolve(getPosts(start, end));

  const containerRef = React.useRef(null);
  const [windowWidth, windowHeight] = useWindowSize();
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight,
  ]);
  const positioner = usePositioner(
    {
      width,
      columnGutter: 0,
      columnWidth: windowWidth / 3,
    },
    [items]
  );

  const maybeLoadMore = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      const nextItems = await getFakeItemsPromise(startIndex, stopIndex);
      setItems((current) => [...current, ...nextItems]);
    },
    {
      isItemLoaded: (index, items) => !!items[index],
      minimumBatchSize: 10,
      threshold: 3,
    }
  );
  const maybeLoadMorePosts = useInfiniteLoader(
    async (startIndex, stopIndex, currentItems) => {
      //console.log("load more posts..", startIndex, stopIndex);
      if (allowload) {
        const nextItems = await getPostsPromise(startIndex, stopIndex);
        //console.log("nextitems", nextItems, after);
        setItems((current) => {
          //console.log("after", after);
          return [...current, ...nextItems];
        });
      }
    },
    {
      isItemLoaded: (index, items) => {
        //console.log("isitemloaded",index,items, !!items[index]);
        return !!items[index];
      },
      minimumBatchSize: 10,
      threshold: 10,
    }
  );

  const fetchFront = async () => {
    //console.log(query);
    let data = await loadFront(query?.frontsort ?? "hot", query?.t ?? "");
    if (data) {
      //console.log("DATA", data);
      let n = numposts;
      for (let c = 0; c < data.children.length; c++) {
        //console.log(data.children[c]);
        data.children[c]["id"] = n;
        n = n + 1;
        data.children[c]["height"] = randInt();
        //console.log(data.children[c]);
      }
      setLoading(false);

      setNumPosts((n) => n + data.children.length);
      setAfter(data?.after);
      setItems(data.children);
      return data.children;
    }
  };

  const [fetchPost, setFetchPost] = useState(false);

  const fetchSubs = async () => {
    if (query?.slug?.[1] === "comments") {
      setFetchPost(true);
      setLoading(false);
    } else {
      let data: any = await loadSubreddits(
        query?.slug?.[0] ?? "",
        query?.slug?.[1] ?? "hot",
        query?.t ?? ""
      );
      if (data) {
        let n = numposts;
        for (let c = 0; c < data.children.length; c++) {
          data.children[c]["id"] = n;
          n = n + 1;
          data.children[c]["height"] = randInt();
        }

        setLoading(false);
        setAfter(data?.after);
        setItems(data.children);
        setNumPosts((n) => n + data.children.length);
      } else {
        setLoading(false);
        setError(true);
      }
    }
  };

  const loadmore = async (loadafter = after) => {
    setCount((c) => c + 1);
    console.log("loadmore after:", loadafter);
    let data = { after: "", children: [] };
    if (!subreddits) {
      data = await loadFront(
        query?.frontsort ?? "best",
        query?.t ?? "",
        loadafter
        //items.length
      );
    } else {
      data = await loadSubreddits(
        query?.slug?.[0] ?? "",
        query?.slug?.[1] ?? "hot",
        query?.t ?? "",
        loadafter
        //numposts //posts.length
      );
    }
    // gtag.event({
    //   action: "infinite-scroll",
    //   category: "main-feed",
    //   label: `${subreddits ? subreddits : "home"}`,
    //   value: count,
    // });
    setAfter(data?.after);
    return { data: { posts: data.children, after: data?.after } };
    //setPosts((prevposts) => [...prevposts, ...data.children]);
  };
  const getPosts = async (start = 0, end = 24) => {
    allowload = false;
    let caughtup = false;
    let n = numposts;
    const payload = [];
    let fastafter = after;
    while (payload.length < end - start && !caughtup) {
      //console.log("getposts");
      //console.log(posts);
      let data = await (await loadmore(fastafter)).data;
      console.log("data returned", data.after);
      fastafter = data?.after;
      if (!data.posts) {
        console.log("no data");
        caughtup = true;
      }
      //console.log("data", data.data);

      for (let c = 0; c < data.posts.length; c++) {
        data.posts[c]["id"] = n;
        n = n + 1;
        data.posts[c]["height"] = randInt();
        payload.push(data.posts[c]);
        //console.log(payload[c]);
      }
    }
    setNumPosts((n) => n + payload.length);
    allowload = true;
    return payload;
    // const fakeItems = [];
    // for (let i = start; i < end + 10; i++)
    //   fakeItems.push({ id: i, height: randInt() });
    // return fakeItems;
  };

  const getFakePosts = async (start = 0, end = 32) => {
    const fakeItems = [];
    for (let i = start; i < end + 10; i++)
      fakeItems.push({ id: i, height: randInt() });
    //return fakeItems;
    setItems(fakeItems);
  };

  // useEffect(() => {
  //   const i = fetchFront();
  //   //setItems(i);
  //   //const items = getFakeItems();
  //   //setItems(items);
  // }, []);

  return (
    <div>
      <Masonry
        onRender={maybeLoadMorePosts}
        //positioner={positioner}
        // The distance in px between the top of the document and the top of the
        // masonry grid container
        //offset={offset}
        // The height of the virtualization window
        //height={windowHeight}
        // Forwards the ref to the masonry container element
        //containerRef={containerRef}
        columnGutter={8}
        //columnWidth={(windowWidth*5/6 - 8*2) / 3}
        columnCount={3}
        items={items}
        itemHeightEstimate={800}
        overscanBy={2}
        render={FakeCard}
      />
    </div>
  );
};

const FakeCard = (props) => {
  //console.log("fakecard");
  return (
    <div>
      {/* <span children={`${props.data.id} : ${props.data?.data?.title}`} /> */}
      {/* <p>{props.data.id}</p> */}
      <Post post={props.data.data} />
    </div>
  );
};

export default MyMasonic;
