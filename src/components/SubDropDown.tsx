import axios from "axios";
import router from "next/router";
import { useState } from "react";
import { useMainContext } from "../MainContext";

import InfiniteScroll from "react-infinite-scroll-component";

const SubDropDown = () => {
  const [mySubs, setMySubs] = useState([]);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState("");
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);

  const context: any = useMainContext();

  const handleClick = () => {
    if (!clicked) getSubs();
    setHidden((hidden) => !hidden);
  };

  const getSubs = async () => {
    if (context?.token?.accessToken ?? false) {
      console.log("getting mysubs");
      try {
        let data = await axios.get(
          "https://oauth.reddit.com/subreddits/mine/subscriber",
          {
            headers: {
              authorization: `bearer ${context.token.accessToken}`,
            },
            params: {
              after: after,
              before: "",
              count: count,
            },
          }
        );
        if (data?.data?.data?.children ?? false) {
          console.log(data.data.data);
          setAfter(data.data.data.after);
          setMySubs((subs) => {
            return [...subs, ...data.data.data.children];
          });
          setClicked(true);
          console.log(mySubs);
        }
      } catch (err) {
        console.log(err);
      }
    }
  };

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    console.log(suggestion);
    router.push({
      pathname: "/r/[subs]",
      query: { subs: suggestion },
    });
  };

  return (
    <div>
      <button onClick={handleClick}>My Subs {hidden ? " v " : " ^ " }</button>

      <div
        id="scrollableDiv"
        className={hidden ? `hidden` : "overflow-auto h-32"}
      >
        <InfiniteScroll
          dataLength={mySubs.length}
          next={getSubs}
          hasMore={after ? true : false}
          loader={<h1>Loading more...</h1>}
          scrollableTarget="scrollableDiv"
        >
          {mySubs.map((sub) => {
            return (
              <div
                key={sub.id}
                onClick={(e) => goToSub(e, sub.data.display_name)}
              >
                {sub.data.display_name}
              </div>
            );
          })}
          <button onClick={getSubs}>Load more</button>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default SubDropDown;
