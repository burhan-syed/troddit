import { BsThreeDotsVertical } from "react-icons/bs";
import { BiUser, BiLink } from "react-icons/bi";
import { AiOutlineTag } from "react-icons/ai";
import { Fragment, useEffect, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";

import SaveButton from "./SaveButton";
import HideButton from "./HideButton";

const MyLink = (props) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href}>
      <a {...rest}>{children}</a>
    </Link>
  );
};

const PostOptButton = ({ post, postNum, mode = "" }) => {
  return (
    <>
      <Menu as="div" className={" relative"}>
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
                className={
                  " flex justify-center items-center  border-2 dark:border   rounded-md cursor-pointer  border-gray-300  dark:border-trueGray-700 hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight "
                  //   (mode !== "post"
                  //     ? " dark:hover:bg-darkBorder hover:bg-lightHighlight "
                  //     : " hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight")
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
                  "absolute translate-x-[-13.4rem] z-50  w-52 bg-white dark:bg-darkBG rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none  border-2 border-gray-300   dark:border-trueGray-700  py-1" +
                  (mode == "post"
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
                        (active
                          ? "bg-lightHighlight dark:bg-darkHighlight "
                          : "") +
                        " px-2 py-1 text-sm flex flex-row items-center"
                      }
                    >
                      <div className="flex items-center justify-center flex-none w-4 h-4 mr-2 overflow-hidden border-black rounded-full select-none border-1">
                        <h1>r/</h1>
                      </div>
                      <h1>{`Go to ${post?.subreddit}`}</h1>
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
                        (active
                          ? "bg-lightHighlight dark:bg-darkHighlight "
                          : "") +
                        "  px-2 py-1 text-sm flex flex-row items-center"
                      }
                    >
                      <BiUser className="flex-none w-4 h-4 mr-2" />
                      <h1>{`About ${post?.author}`}</h1>
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
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") +
                          " px-2 py-1 text-sm flex flex-row items-center"
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
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") +
                          " px-2 py-1 text-sm flex flex-row items-center"
                        }
                      >
                        <AiOutlineTag className="flex-none w-4 h-4 mr-2" />
                        <h1>Search Flair {post?.link_flair_text}</h1>
                      </MyLink>
                    )}
                  </Menu.Item>
                )}
                {mode !== "row" && mode !== "post" && (
                  <Menu.Item disabled={mode == "row" || mode == "post"}>
                    {({ active }) => (
                      <div
                        className={
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") + " block  text-sm hover:cursor-pointer"
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
                          (active
                            ? "bg-lightHighlight dark:bg-darkHighlight "
                            : "") + " block  text-sm hover:cursor-pointer"
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
                {/* <Menu.Item>{({ active }) => <div>Mark Unread</div>}</Menu.Item>
                <Menu.Item>{({ active }) => <div>Filter..</div>}</Menu.Item> */}
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </>
  );
};

export default PostOptButton;
