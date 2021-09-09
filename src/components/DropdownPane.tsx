import axios from "axios";
import router, { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { useMainContext } from "../MainContext";
import Image from "next/dist/client/image";

import { BsChevronDown } from "react-icons/bs";
import { AiOutlineHome } from "react-icons/ai";
import { CgArrowTopRightO } from "react-icons/cg";
import { IoMdList } from "react-icons/io";
import { CgLivePhoto } from "react-icons/cg";
import { BiRightTopArrowCircle } from "react-icons/bi";
import { getAllMySubs, getMyMultis, getMySubs } from "../RedditAPI";

import InfiniteScroll from "react-infinite-scroll-component";
import Link from "next/link";
import DropdownItem from "./DropdownItem";

const DropdownPane = ({ hide }) => {
  const [mySubs, setMySubs] = useState([]);
  const [myMultis, setMyMultis] = useState([]);
  const [count, setCount] = useState(0);
  const [after, setAfter] = useState("");
  const [clicked, setClicked] = useState(false);
  const [show, setShow] = useState(false);

  const router = useRouter();
  const [location, setLocation] = useState("home");

  const context: any = useMainContext();

  useEffect(() => {
    console.log(router.query);
    if (router?.query?.slug?.[0]) {
      setLocation(router.query.slug[0]);
    } else {
      setLocation("home");
    }
    return () => {};
  }, [router]);

  const handleClick = async () => {
    if (!clicked) {
      loadAllFast();
      setClicked(true);
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
      setMySubs(data);
    } catch (err) {
      console.log(err);
    }
  };

  const loadAllFast = async () => {
    try {
      const subs = getAllMySubs();
      const multis = getMyMultis();
      setMySubs(await subs);
      setMyMultis(await multis);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full select-none hover:cursor-pointer">
      {/* Close when clicking outside element */}
      <div
        className={
          (show && !hide ? "" : "w-0 h-0") +
          "absolute  top-0 left-0 w-screen h-screen bg-transparent "
        }
        onClick={() => setShow((show) => !show)}
      ></div>
      {/* Main Button */}
      <div
        className="flex flex-row items-center justify-between flex-none w-full h-full px-2 border border-red-500"
        onClick={handleClick}
      >
        <div className="flex flex-row items-center">
          {location === "home" ? (
            <AiOutlineHome className="w-6 h-6" />
          ) : location === "popular" ? (
            <BiRightTopArrowCircle className="w-6 h-6" />
          ) : location === "all" ? (
            <CgLivePhoto className="w-6 h-6" />
          ) : (
            <div>r/</div>
          )}
          <h1 className="capitalize truncate">{location}</h1>
        </div>
        <BsChevronDown
          className={
            show
              ? "-rotate-180"
              : "rotate-0" + "transform transition duration-200"
          }
        />
      </div>
      {/* Dropdown */}
      <div
        className={
          "flex flex-col w-full transform transition border border-t-0 duration-150 ease-in-out origin-top  " +
          `${show && !hide ? "block" : "hidden"}`
        }
      >
        {/* scroll */}
        <div className="px-3 py-3 overflow-y-auto overscroll-contain max-h-96">
          {/* Quick Links */}
          <div className="flex flex-col font-light">
            <Link href="/" passHref>
              <div className="flex flex-row items-center pl-1 py-1.5 space-x-2" >
                <AiOutlineHome className="w-6 h-6" />
                <h1 className="">Home</h1>
              </div>
            </Link>
            <Link href="/r/popular" passHref>
              <div className="flex flex-row items-center pl-1 py-1.5 space-x-2 ">
                <BiRightTopArrowCircle className="w-6 h-6" />
                <h1>Popular</h1>
              </div>
            </Link>
            <Link href="/r/all" passHref>
              <div className="flex flex-row items-center pl-1 py-1.5 space-x-2 ">
                <CgLivePhoto className="w-6 h-6" />
                <h1>All</h1>
              </div>
            </Link>
          </div>

          {/* Multis */}
          {myMultis
            ? myMultis.map((multi, i) => {
                return (
                  <DropdownItem
                    key={`${i}_${multi.data.display_name}`}
                    sub={multi}
                  />
                );
              })
            : ""}

          {/* Subs */}
          {mySubs
            ? mySubs.map((sub, i) => {
                return <DropdownItem key={i} sub={sub} />;
              })
            : ""}
        </div>
      </div>
    </div>
  );
};

export default DropdownPane;
