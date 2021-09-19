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
import { signIn, useSession } from "next-auth/client";
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

  const [session, loading] = useSession();
  const context: any = useMainContext();

  const [loadedMultis, setloadedMultis] = useState(false);
  const [loadedSubs, setloadedSubs] = useState(false);

  useEffect(() => {
    //console.log(router.query);
    if (router?.query?.slug?.[0]) {
      let loc = router?.query?.slug?.[0].split("+");
      setLocation(loc[0]);
    } else {
      setLocation("home");
    }
    return () => {};
  }, [router.query]);

  const handleClick = async () => {
    if (!clicked) {
      session && loadAllFast();
      setClicked(true);
    }
    setShow((show) => !show);
  };

  const loadSubs = async () => {
    try {
      let data = await getMySubs(after, mySubs.length);
      //console.log(data);
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
      const multis = getMyMultis();
      const subs = getAllMySubs();
      setMyMultis(await multis);
      setloadedMultis(true);
      setMySubs(await subs);
      setloadedSubs(true);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center w-full h-full select-none">
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
        className={
          "flex flex-row items-center justify-between flex-none w-full h-full px-2 border border-white rounded-md hover:cursor-pointer hover:border-lightBorder rounded-2 dark:bg-darkBG dark:hover:border-darkBorder dark:border-darkBG" +
          (show ? " border-lightBorder dark:border-darkBorder" : "")
        }
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
          <h1 className="ml-2 capitalize truncate">{location}</h1>
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
          "flex flex-col w-full transform transition border duration-150 ease-in-out origin-top dark:bg-darkBG bg-white dark:border-darkBorder border-lightBorder mt-1 rounded-md shadow-sm " +
          `${show && !hide ? " block" : " hidden"}`
        }
      >
        {/* scroll */}
        <div className="grid grid-cols-1 overflow-y-auto overscroll-contain max-h-96 scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800 ">
          {/* Quick Links */}
          <div className="flex flex-col py-2 font-light">
            <Link href="/" passHref>
              <div className="flex flex-row items-center py-1.5 space-x-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight pl-4">
                <AiOutlineHome className="w-6 h-6" />
                <h1 className="">Home</h1>
              </div>
            </Link>
            <Link href="/r/popular" passHref>
              <div className="flex flex-row items-center py-1.5 space-x-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight pl-4">
                <BiRightTopArrowCircle className="w-6 h-6" />
                <h1>Popular</h1>
              </div>
            </Link>
            <Link href="/r/all" passHref>
              <div className="flex flex-row items-center  py-1.5 space-x-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight pl-4">
                <CgLivePhoto className="w-6 h-6" />
                <h1>All</h1>
              </div>
            </Link>
          </div>

          {!session && (
            <>
              <button
                className="p-2 m-2 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
                onClick={() => signIn()}
              >
                <span className="text-blue-300 dark:text-blue-600">Login</span>{" "}
                to see your subs
              </button>
            </>
          )}

          {session && (
            <>
              {/* Multis */}
              {/* onClick={() => {setloadedMultis(m => !m);setloadedSubs(s => !s)}} */}
              <div className="pl-2 text-xs tracking-widest">multis</div>
              {!loadedMultis ? (
                // Loading pane
                <>
                  <div className="py-2">
                    <div className="px-4 py-1 ">
                      {/* Repeated rows */}
                      {[...Array(3)].map((u, i) => (
                        <div key={i} className="py-1">
                          <div className="flex flex-row items-center text-sm text-center animate-pulse ">
                            {/* Image */}
                            <div className="flex flex-row items-center w-6 h-6 ml-1 ">
                              <div className="w-6 h-6 text-center text-white bg-red-400 rounded ">
                                {"m"}
                              </div>
                            </div>
                            {/* Text */}
                            <div className="w-full h-6 ml-2 bg-gray-300 rounded dark:bg-gray-800 "></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="py-2">
                    {myMultis
                      ? myMultis.map((multi, i) => {
                          return (
                            <div
                              className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                              key={`${i}_${multi.data.display_name}`}
                            >
                              <DropdownItem sub={multi} />
                            </div>
                          );
                        })
                      : ""}
                  </div>
                </>
              )}
              {/* Subs */}
              <div className="pl-2 text-xs tracking-widest">subs</div>
              {!loadedSubs ? (
                <>
                  <div className="py-2">
                    <div className="px-4 py-1 ">
                      {/* Repeated rows */}
                      {[...Array(5)].map((u, i) => (
                        <div key={i} className="py-1">
                          <div className="flex flex-row items-center text-sm text-center animate-pulse ">
                            {/* Image */}
                            <div className="flex flex-row items-center w-6 h-6 ml-1 ">
                              <div className="w-6 h-6 text-center text-white bg-blue-700 rounded-full ">
                                {"r/"}
                              </div>
                            </div>
                            {/* Text */}
                            <div className="w-full h-6 ml-2 bg-gray-300 rounded dark:bg-gray-800 "></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-2">
                  {mySubs
                    ? mySubs.map((sub, i) => {
                        return (
                          <div
                            className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                            key={i}
                          >
                            <DropdownItem sub={sub} />
                          </div>
                        );
                      })
                    : ""}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DropdownPane;
