import { BsThreeDotsVertical } from "react-icons/bs";
import { BiUser, BiLink } from "react-icons/bi";
import { MdOutlineClear } from "react-icons/md";
import { AiOutlineTag } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";
import SubButton from "./SubButton";
import SaveButton from "./SaveButton";
import HideButton from "./HideButton";
import { useMainContext, localRead } from "../MainContext";
import useFilterSubs from "../hooks/useFilterSubs";
import { useRead } from "../hooks/useRead";

const MyLink = (props) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
};

const PostOptButton = ({ post, postNum, mode = "" }) => {
  const context: any = useMainContext();
  const { addSubFilter, addUserFilter } = useFilterSubs();
  const filterMenuRef = useRef(null);
  const { read } = useRead(post?.name);

  const toggleRead = async () => {
    context?.toggleReadPost({
      postId: post?.name,
      numComments: post?.num_comments,
    });
  };

  return (
    <>
      <Menu as="div" className={" relative font-normal "}>
        {({ open }) => (
          <>
            <div
              className="flex items-center justify-center w-4 "
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Menu.Button
                aria-label="post options"
                className={
                  " flex justify-center items-center  border rounded-md  " +
                  (mode == "row"
                    ? " border-transparent hover:border-th-borderHighlight "
                    : " border-th-border hover:border-th-borderHighlight ")
                }
              >
                <BsThreeDotsVertical
                  className={mode == "post" ? "w-5 h-9" : "w-4 h-6"}
                />
              </Menu.Button>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-800"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items
                className={
                  "absolute translate-x-[-13.4rem] z-50  w-52 bg-th-background2 ring-th-base rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border border-th-border select-none cursor-pointer  py-1" +
                  (mode == "post" || mode == "row"
                    ? " top-0 origin-top-right"
                    : " bottom-0 origin-bottom-right")
                }
              >
                <Menu.Item>
                  {({ active }) => (
                      <MyLink
                      href={`/r/${post?.subreddit}`}
                      passHref
                      onClick={(e) => e.stopPropagation()}
                      className={
                        (active ? "bg-th-highlight " : "") +
                        " px-2 py-1 text-sm flex flex-row items-center"
                      }
                    >
                      <div className="flex items-center justify-center flex-none w-4 h-4 mr-2 overflow-hidden rounded-full select-none ">
                        <h1>r/</h1>
                      </div>
                      <h1 className="truncate">{`${post?.subreddit}`}</h1>
                      <div className="flex-none w-8 h-8 ml-auto md:w-5 md:h-5">
                        <SubButton sub={post?.subreddit} miniMode={true} />
                      </div>
                    </MyLink>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                      <MyLink
                      href={`/u/${post?.author}`}
                      passHref
                      onClick={(e) => e.stopPropagation()}
                      className={
                        (active ? "bg-th-highlight " : "") +
                        "  px-2 py-1 text-sm flex flex-row items-center"
                      }
                    >
                      <BiUser className="flex-none w-4 h-4 mr-2" />
                      <h1 className="truncate">{`${post?.author}`}</h1>
                      <div className="flex-none w-8 h-8 ml-auto md:w-5 md:h-5">
                        <SubButton
                          sub={`u_${post?.author}`}
                          userMode={true}
                          miniMode={true}
                        />
                      </div>
                    </MyLink>
                  )}
                </Menu.Item>
                {mode !== "row" && (
                  <Menu.Item disabled={mode == "row"}>
                    {({ active }) => (
                      <a
                        href={post?.url}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " px-2 py-2.5  md:py-1 text-sm flex flex-row items-center"
                        }
                      >
                        <BiLink className="flex-none w-4 h-4 mr-2" />

                        <h1>{`Open Source Link`}</h1>
                      </a>
                    )}
                  </Menu.Item>
                )}

                {post?.link_flair_text && (
                  <Menu.Item disabled={post?.link_flair_text ? false : true}>
                    {({ active }) => (
                      <MyLink
                        href={`/r/${
                          post?.subreddit
                        }/search?sort=new&q=flair%3A${encodeURIComponent(
                          post?.link_flair_text
                        )}`}
                        onClick={(e) => e.stopPropagation()}
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " px-2 py-2.5  md:py-1 text-sm flex flex-row items-center"
                        }
                      >
                        <AiOutlineTag className="flex-none w-4 h-4 mr-2" />
                        <h1>Search Flair {post?.link_flair_text}</h1>
                      </MyLink>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={(active ? "bg-th-highlight " : "") + "  "}
                    >
                      <button
                        aria-label="add to filters"
                        onClick={(e) => {
                          filterMenuRef?.current?.click();
                          //e.preventDefault();
                          //e.stopPropagation();
                        }}
                        className="flex flex-row items-center min-w-full px-2 py-2.5  md:py-1 text-sm hover:cursor-pointer"
                      >
                        <FiFilter className="flex-none w-4 h-4 mr-2 mt-0.5 " />
                        <h1>Filter...</h1>
                      </button>
                    </div>
                  )}
                </Menu.Item>
                {mode !== "row" && mode !== "post" && (
                  <Menu.Item disabled={mode == "row" || mode == "post"}>
                    {({ active }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block  text-sm hover:cursor-pointer"
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        <SaveButton
                          id={post?.name}
                          saved={post?.saved}
                          isPortrait={false}
                          postindex={postNum}
                          menu={true}
                        ></SaveButton>
                      </div>
                    )}
                  </Menu.Item>
                )}
                {mode !== "row" && (
                  <Menu.Item disabled={mode == "row"}>
                    {({ active }) => (
                      <div
                        className={
                          (active ? "bg-th-highlight " : "") +
                          " block  text-sm hover:cursor-pointer"
                        }
                        onClick={(e) => e.stopPropagation()}
                      >
                        <HideButton
                          id={post?.name}
                          hidden={post?.hidden}
                          isPortrait={false}
                          postindex={postNum}
                          menu={true}
                        ></HideButton>
                      </div>
                    )}
                  </Menu.Item>
                )}
                <Menu.Item>
                  {({ active }) => (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      className={(active ? "bg-th-highlight " : "") + "  "}
                    >
                      <button
                        aria-label="toggle read"
                        onClick={(e) => {
                          toggleRead();
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        className="flex flex-row items-center min-w-full px-2 py-2.5  md:py-1 text-sm hover:cursor-pointer"
                      >
                        <MdOutlineClear className="flex-none w-4 h-4 mr-2 mt-0.5 " />
                        <h1>{read ? "Mark Unread" : "Mark Read"}</h1>
                      </button>
                    </div>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      <Menu as={"div"} className={"relative font-normal"}>
        <Menu.Button aria-label="filter options" ref={filterMenuRef} className="hidden"></Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-800"
          enterFrom="transform opacity-100 scale-100"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items
            className={
              "absolute  z-50  w-52 bg-th-background2 rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border select-none cursor-pointer  py-1" +
              (mode == "post"
                ? " top-[-2.31rem] origin-top-right translate-x-[-13.4rem]  "
                : mode == "row"
                ? "  -top-0 origin-top-right right-5"
                : mode == "media"
                ? "origin-bottom-right bottom-0 right-[1.35rem] "
                : context.cardStyle === "card2"
                ? " origin-bottom-right bottom-0 right-[1.35rem]"
                : " -bottom-3 origin-bottom-right translate-x-[-14.8rem] ")
            }
          >
            <h4 className="py-1 ml-2.5" onClick={(e) => e.stopPropagation()}>
              Add to Filter..
            </h4>
            <Menu.Item>
              {({ active }) => (
                <button
                  aria-label="filter subreddit"
                  onClick={(e) => {
                    addSubFilter(post?.subreddit);
                    e.stopPropagation();
                  }}
                  className={
                    (active ? "bg-th-highlight " : "") +
                    " px-2 py-2.5  md:py-1 text-sm flex flex-row items-center w-full"
                  }
                >
                  <div className="flex items-center justify-center flex-none w-4 h-4 mr-2 overflow-hidden border-black rounded-full select-none border-1">
                    <h1>r/</h1>
                  </div>
                  <h1>{` ${post?.subreddit}`}</h1>
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button
                  aria-label="filter author"
                  onClick={(e) => {
                    addUserFilter(post?.author);
                    e.stopPropagation();
                  }}
                  className={
                    (active ? "bg-th-highlight " : "") +
                    "  px-2 py-2.5 md:py-1 text-sm flex flex-row items-center w-full"
                  }
                >
                  <BiUser className="flex-none w-4 h-4 mr-2" />
                  <h1>{`${post?.author}`}</h1>
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Transition>
      </Menu>
    </>
  );
};

export default PostOptButton;
