import axios from "axios";
import router from "next/router";
import { useState } from "react";
import { useMainContext } from "../MainContext";
import Image from "next/dist/client/image";

import { BsChevronDown } from "react-icons/bs";

import { getAllMySubs, getMyMultis, getMySubs } from "../RedditAPI";

import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import DropdownSubItem from "./DropdownSubItem";

const SubDropDown = ({ hide }) => {
  const [mySubs, setMySubs] = useState([]);
  const [myMultis, setMyMultis] = useState([]);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState("");
  const [clicked, setClicked] = useState(false);
  const [show, setShow] = useState(false);

  const context: any = useMainContext();

  const handleClick = () => {
    if (!clicked) {
      loadMultis();
      loadAllSubs();
    }
    setShow((show) => !show);
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
      console.log(data);
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

  const goToMulti = (e, suggestion) => {
    let suggestions = "";
    for (let s of suggestion) {
      suggestions = suggestions + "+" + s.name;
    }
    goToSub(e, suggestions);
  };

  return (
    <div className="flex flex-col items-center w-full h-full select-none hover:cursor-pointer">
      {/* Close when clicking outisde element */}
      <div
        className={
          (show && !hide ? "" : "w-0 h-0") +
          "absolute  top-0 left-0 w-screen h-screen bg-transparent "
        }
        onClick={() => setShow((show) => !show)}
      ></div>
      {/* Main Button */}
      <div
        className="flex flex-row items-center justify-between flex-none w-full h-full px-2"
        onClick={handleClick}
      >
        <h1>My Subs</h1>
        <BsChevronDown className={
              show
                ? "-rotate-180"
                : "rotate-0" + "transform transition duration-200 "
            }/>
      </div>
      {/* Dropdown */}
      <div
        className={
          "flex flex-col w-full transform transition border border-t-0 duration-150 ease-in-out origin-top bg-white " +
          `${show && !hide ? "block" : "hidden"}`
        }
      >
        {/* scroll */}
        <div className="px-3 py-3 overflow-y-auto overscroll-contain max-h-96">
          {/* Quick Links */}
          <Link href="/" passHref>
            <h1 className="">Home</h1>
          </Link>

          {/* Multis */}
          {myMultis
            ? myMultis.map((multi, i) => {
                return (
                  <div
                    className="text-blue"
                    key={`${i}_${multi.data.display_name}`}
                    onClick={(e) => goToMulti(e, multi.data.subreddits)}
                  >
                    {multi.data.display_name}
                  </div>
                );
              })
            : ""}

          {/* Subs */}
          {mySubs
            ? mySubs.map((sub, i) => {
                return <DropdownSubItem key={i} sub={sub} />;
              })
            : ""}
        </div>
      </div>
    </div>
  );
};

export default SubDropDown;
