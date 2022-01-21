import { signIn, useSession } from "next-auth/client";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { AiOutlineHome } from "react-icons/ai";
import { BiRightTopArrowCircle } from "react-icons/bi";
import { CgLivePhoto } from "react-icons/cg";
import { useMainContext } from "../MainContext";
import { useSubsContext } from "../MySubs";
import { getMySubs, getMyMultis, getAllMySubs } from "../RedditAPI";
import DropdownItem from "./DropdownItem";

const SideDropDown = ({ visible = false }) => {
  const subsContext: any = useSubsContext();
  const {
    mySubs,
    myLocalSubs,
    myLocalMultis,
    myMultis,
    loadedSubs,
    loadedMultis,
    tryLoadAll,
    error,
    currSubInfo,
    currLocation,
  } = subsContext;

  const router = useRouter();

  const [session, loading] = useSession();

  useEffect(() => {
    if (!loadedSubs && visible) {
      tryLoadAll();
    }
  }, [visible]);

  return (
    <div className="grid h-full grid-cols-1 overflow-y-auto select-none overscroll-contain scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-red-800">
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
          {myLocalMultis?.length > 0 && (
            <>
              <div className="pl-2 text-xs tracking-widest">local multis</div>
              <div className="py-2">
                {myLocalMultis
                  ? myLocalMultis.map((multi, i) => {
                      return (
                        <div
                          className="px-4 py-2 hover:bg-lightHighlight dark:hover:bg-darkHighlight"
                          key={i}
                        >
                          <DropdownItem sub={multi} />
                        </div>
                      );
                    })
                  : ""}
              </div>
            </>
          )}
          {myLocalSubs?.length > 0 ? (
            <>
              <div className="pl-2 text-xs tracking-widest">local subs</div>
              <div className="py-2">
                {myLocalSubs
                  ? myLocalSubs.map((sub, i) => {
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
            </>
          ) : (
            <button
              className="p-2 m-2 border rounded-md border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
              onClick={() => signIn("reddit")}
            >
              <span className="text-blue-300 dark:text-blue-600">Login</span> to
              see your subs
            </button>
          )}
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
                          <div className="w-6 h-6 text-center bg-red-400 rounded text-lightText ">
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
                          <div className="w-6 h-6 text-center bg-blue-700 rounded-full text-lightText ">
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
  );
};

export default SideDropDown;
