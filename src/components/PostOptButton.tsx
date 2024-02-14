import { BsThreeDotsVertical } from "react-icons/bs";
import { BiUser, BiLink } from "react-icons/bi";
import { MdOutlineClear } from "react-icons/md";
import { AiOutlineTag } from "react-icons/ai";
import { FiFilter } from "react-icons/fi";
import React, { Fragment, useEffect, useRef, useState } from "react";
import { Menu, Transition } from "@headlessui/react";
import Link from "next/link";

import SaveButton from "./SaveButton";
import HideButton from "./HideButton";
import IntInput from "./settings/IntInput";
import { useMainContext, localRead } from "../MainContext";
import useFilterSubs from "../hooks/useFilterSubs";
import { useRead } from "../hooks/useRead";
import Checkbox from "./ui/Checkbox";
import SubButton from "./SubButton";
import { HiOutlineDocumentDuplicate } from "react-icons/hi";
import { useRouter } from "next/router";

const MyLink = (props) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href} {...rest}>
      {children}
    </Link>
  );
};

interface Props {
  post: any;
  mode: "post" | "row" | "media" | "fullmedia" | "card2" | "";
  showUI?: boolean;
  setShowUI?: Function;
  buttonStyles?: string;
}

const PostOptButton = ({
  post,
  mode = "",
  showUI,
  setShowUI,
  buttonStyles = "",
}: Props) => {
  const router = useRouter();
  const context: any = useMainContext();
  const { addSubFilter, addUserFilter } = useFilterSubs();
  const filterMenuRef = useRef<HTMLButtonElement>(null);
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
              className={
                "flex items-center justify-center " +
                (mode !== "fullmedia" ? " w-4 " : "md:w-4")
              }
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Menu.Button
                aria-label="post options"
                className={
                  " flex justify-center items-center  border  " +
                  (mode == "row"
                    ? " border-transparent hover:border-th-borderHighlight px-2 py-0.5 sm:p-0 rounded-md  "
                    : mode == "fullmedia"
                    ? ` border-transparent hover:border-th-borderHighlight  bg-black/40 backdrop-blur-lg md:backdrop-blur-none rounded-full md:rounded-md md:bg-transparent md:hover:bg-black/20 hover:backdrop-blur-lg transition duration-200 ease-in-out w-10 h-10 md:w-auto md:h-auto ${buttonStyles} `
                    : " border-th-border hover:border-th-borderHighlight rounded-md ") +
                  (showUI === false ? " opacity-50 " : " ")
                }
              >
                <BsThreeDotsVertical
                  className={
                    mode == "post"
                      ? "w-5 h-9"
                      : mode === "fullmedia"
                      ? "w-5 h-5 md:w-7 md:h-[46px] "
                      : mode === "row"
                      ? "w-4 h-6  "
                      : "w-4 h-6"
                  }
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
                  "absolute  z-50  bg-th-background2 ring-th-base rounded-md shadow-lg ring-1  ring-opacity-5 focus:outline-none border border-th-border select-none cursor-pointer  py-1  " +
                  (mode === "card2" && context.columns > 1
                    ? " w-36 sm:w-52 "
                    : "  w-52 ") +
                  (mode === "card2" && context.columns > 1
                    ? " translate-x-[-9.2rem] sm:translate-x-[-13.4rem] "
                    : mode !== "fullmedia"
                    ? " translate-x-[-13.4rem] "
                    : " translate-x-[-14rem] ") +
                  (mode == "post" || mode == "row" || mode === "fullmedia"
                    ? " top-0 origin-top-right"
                    : " bottom-0 origin-bottom-right")
                }
              >
                {mode === "fullmedia" && (
                  <>
                    <div className="py-0.5 text-sm text-center hover:cursor-default">
                      Autoplay settings
                    </div>
                    <div className="flex items-center justify-between w-full px-2 py-1.5 text-sm hover:cursor-default">
                      <span className="text-xs">{"Interval (seconds)"}</span>
                      <div className="h-8">
                        <IntInput
                          setting="autoPlayInterval"
                          rounded={false}
                          mini={true}
                          styles="  w-full h-full justify-between text-sm"
                        />
                      </div>
                    </div>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (active ? "bg-th-highlight " : "") +
                            " flex  w-full  "
                          }
                        >
                          <Checkbox
                            toggled={context?.waitForVidInterval}
                            labelText={"Play full videos"}
                            clickEvent={() =>
                              context?.setWaitForVidInterval((w) => !w)
                            }
                            reverse={false}
                            styles={" py-1 px-2 w-full justify-between"}
                          />
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (active ? "bg-th-highlight " : "") +
                            " flex  w-full  "
                          }
                        >
                          <Checkbox
                            toggled={showUI}
                            labelText={"Show UI"}
                            clickEvent={() => setShowUI && setShowUI((u) => !u)}
                            reverse={false}
                            styles={" py-1 px-2 w-full justify-between"}
                          />
                        </div>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <div
                          className={
                            (active ? "bg-th-highlight " : "") +
                            " flex  w-full  "
                          }
                        >
                          <Checkbox
                            toggled={context.audioOnHover}
                            labelText={"Audio"}
                            clickEvent={() => context.toggleAudioOnHover()}
                            reverse={false}
                            styles={" py-1 px-2 w-full justify-between"}
                          />
                        </div>
                      )}
                    </Menu.Item>
                    <div className="py-0.5 border-b border-th-border hover:cursor-default"></div>
                  </>
                )}
                {post?.subreddit?.substring(0, 2) !== "u_" && (
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
                        <div className="flex-none w-8 h-8 ml-auto md:w-6 md:h-6">
                          <SubButton sub={post?.subreddit} miniMode={true} />
                        </div>
                      </MyLink>
                    )}
                  </Menu.Item>
                )}
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
                      <div className="flex-none w-8 h-8 ml-auto md:w-6 md:h-6">
                        <SubButton
                          sub={`u_${post?.author}`}
                          userMode={true}
                          miniMode={true}
                        />
                      </div>
                    </MyLink>
                  )}
                </Menu.Item>
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
                {mode !== "row" && (
                  <Menu.Item>
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
                {mode !== "post" && mode !== "fullmedia" && (
                  <Menu.Item>
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
                          menu={true}
                        ></SaveButton>
                      </div>
                    )}
                  </Menu.Item>
                )}
                {true && (
                  <Menu.Item>
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
                <Menu.Item disabled={mode !== "post"}>
                  {({ active, disabled }) => (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (router.asPath.includes("duplicates=1")) {
                          return;
                        }
                        router.push(
                          "",
                          router.asPath.includes("?")
                            ? `${router.asPath}&duplicates=1`
                            : `${router.asPath}?duplicates=1`,
                          { shallow: true }
                        );
                      }}
                      className={
                        (disabled ? "hidden " : "") +
                        (active ? "bg-th-highlight " : "") +
                        " px-2 py-2.5  md:py-1 text-sm flex flex-row items-center w-full"
                      }
                    >
                      <HiOutlineDocumentDuplicate className="flex-none w-4 h-4 mr-2 mt-0.5 " />
                      <span>{"Show Other Discussions"}</span>
                    </button>
                  )}
                </Menu.Item>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
      <Menu as={"div"} className={"relative font-normal"}>
        <Menu.Button
          aria-label="filter options"
          ref={filterMenuRef}
          className="hidden"
        ></Menu.Button>
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
              "absolute  z-50   bg-th-background2 rounded-md shadow-lg ring-1 ring-th-base ring-opacity-5 focus:outline-none border border-th-border select-none cursor-pointer  py-1 " +
              (mode === "card2" && context.columns > 1
                ? " w-32 sm:w-52 "
                : " w-52 ") +
              (mode == "post"
                ? " top-[-2.31rem] origin-top-right translate-x-[-13.4rem]  "
                : mode == "row"
                ? "  -top-0 origin-top-right right-5"
                : mode == "media"
                ? " origin-bottom-right bottom-0 right-[1.35rem] "
                : mode === "fullmedia"
                ? " origin-top-right top-[-2.88rem] right-[2rem]"
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
                    " px-2 py-1 text-sm flex flex-row items-center w-full"
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
                    "  px-2 py-1 text-sm flex flex-row items-center w-full"
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
