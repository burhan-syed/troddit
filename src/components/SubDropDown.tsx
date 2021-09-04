import axios from "axios";
import router from "next/router";
import { useState } from "react";
import { useMainContext } from "../MainContext";

import { getAllMySubs, getMyMultis, getMySubs } from "../RedditAPI";

import InfiniteScroll from "react-infinite-scroll-component";

const SubDropDown = () => {
  const [mySubs, setMySubs] = useState([]);
  const [myMultis, setMyMultis] = useState([]);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState("");
  const [clicked, setClicked] = useState(false);
  const [hidden, setHidden] = useState(true);

  const context: any = useMainContext();

  const handleClick = () => {
    if (!clicked) {
      loadMultis();
      loadAllSubs();
    }
    setHidden((hidden) => !hidden);
  };

  const loadSubs = async () => {
    try {
      let data = await getMySubs(after, mySubs.length);
      console.log(data);
      setAfter(data.after);
      setMySubs((subs) => [...subs, ...data.children]);
    } catch (err) {
      console.log(err);
    }
    setClicked(true);
  };

  const loadMultis = async () => {
    try {
      let data = await getMyMultis();
      setMyMultis(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAllSubs = async () => {
    try {
      let data = await getAllMySubs();
      setMySubs(data);
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

  const goToMulti = (e,suggestion) => {
    let suggestions = "";
    for (let s of suggestion){
      suggestions = suggestions + "+" + s.name;
    }
    goToSub(e,suggestions);
  }

  return (
    <div>
      <button onClick={handleClick}>My Subs {hidden ? " v " : " ^ "}</button>

      <div
        id="scrollableDiv"
        className={
          (hidden ? `hidden` : "overflow-auto h-32") + " absolute bg-gray"
        }
      >
        {/* <InfiniteScroll
          dataLength={mySubs.length}
          next={loadSubs}
          hasMore={after ? true : false}
          loader={<h1>Loading more...</h1>}
          scrollableTarget="scrollableDiv"
        > */}

        {myMultis.map((multi, i) => {
          return (
            <div
              className="text-blue"
              key={`${i}_${multi.data.display_name}`}
              onClick={(e) => goToMulti(e, multi.data.subreddits)}
            >
              {multi.data.display_name}
            </div>
          );
        })}
        {mySubs.map((sub, i) => {
          return (
            <div
              className="text-white "
              key={`${i}_${sub.data.display_name}`}
              onClick={(e) => goToSub(e, sub.data.display_name)}
            >
              {sub.data.display_name}
            </div>
          );
        })}
        {/* <button onClick={loadSubs}>Load more</button>
        </InfiniteScroll> */}
      </div>
    </div>
  );
};

export default SubDropDown;
