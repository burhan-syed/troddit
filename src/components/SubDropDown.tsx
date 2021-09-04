import axios from "axios";
import router from "next/router";
import { useState } from "react";
import { useMainContext } from "../MainContext";

import { getSubs } from "../RedditAPI";

import InfiniteScroll from "react-infinite-scroll-component";

const SubDropDown = () => {
  const [mySubs, setMySubs] = useState([]);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState("");
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);

  const context: any = useMainContext();

  const handleClick = () => {
    if (!clicked) loadSubs();
    setHidden((hidden) => !hidden);
  };

  const loadSubs = async () => {
    try {
      let data = await getSubs(after, mySubs.length);
      console.log(data);
      setAfter(data.after);
      setMySubs((subs) => [...subs, ...data.children]);
    } catch (err) {
      console.log(err);
    }
    setClicked(true);
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
      <button onClick={handleClick}>My Subs {hidden ? " v " : " ^ "}</button>

      <div
        id="scrollableDiv"
        className={
          (hidden ? `hidden` : "overflow-auto h-32") + " absolute bg-gray"
        }
      >
        <InfiniteScroll
          dataLength={mySubs.length}
          next={loadSubs}
          hasMore={after ? true : false}
          loader={<h1>Loading more...</h1>}
          scrollableTarget="scrollableDiv"
        >
          {mySubs.map((sub) => {
            return (
              <div
                className="text-white "
                key={sub.id}
                onClick={(e) => goToSub(e, sub.data.display_name)}
              >
                {sub.data.display_name}
              </div>
            );
          })}
          <button onClick={loadSubs}>Load more</button>
        </InfiniteScroll>
      </div>
    </div>
  );
};

export default SubDropDown;
