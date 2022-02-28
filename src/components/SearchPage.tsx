import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { useMainContext } from "../MainContext";
import { getRedditSearch } from "../RedditAPI";
import Feed from "./Feed";
import SubCard from "./views/SubCard";
import SubCardPlaceHolder from "./views/SubCardPlaceHolder";

const SearchPage = ({ query }) => {
  const router = useRouter();
  const context: any = useMainContext();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [after, setAfter] = useState("");
  const [expand, setExpand] = useState(false);
  const [searchUsers, setSearchUsers] = useState(false);
  const [safeSearch, setSafeSearch] = useState(true);
  const loadMore = async () => {
    let subs = await getRedditSearch(
      { q: query?.q },
      after,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      safeSearch ? undefined : true,
      router.query?.type === "user" ? "user" : "sr"
    );
    if (subs?.children) {
      let filtered = subs?.children?.filter(
        (c) => c?.data?.accept_followers === true
      );
      setSubs((p) => [...p, ...filtered]);
    }

    setAfter(subs?.after);
  };

  useEffect(() => {
    if (router.query.type === "sr" || router.query.type === "user") {
      setExpand(true);
    } else {
      setExpand(false);
    }
    // if (router.query.type === "user") {
    //   setSearchUsers(true);
    // } else {
    //   setSearchUsers(false);
    // }
    return () => {
      setExpand(false);
      //setSearchUsers(false);
    };
  }, [router.query]);

  useEffect(() => {
    if (expand) {
      if (router?.query?.type === "sr" && searchUsers) {
        router.replace(
          router.asPath.replace(`&type=${router.query.type}`, "&type=user")
        );
      } else if (router?.query?.type === "user" && !searchUsers) {
        router.replace(
          router.asPath.replace(`&type=${router.query.type}`, "&type=sr")
        );
      }
    }
  }, [searchUsers, expand, router.query.type]);

  useEffect(() => {
    const getSearch = async () => {
      //console.log("findsubs", query?.q);
      let subs = await getRedditSearch(
        { q: query?.q },
        "",
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        safeSearch ? undefined : true,
        router.query?.type === "user" || searchUsers ? "user" : "sr"
      );
      //console.log(subs);
      if (subs?.children) {
        let filtered = subs.children.filter(
          (c) => c?.data?.accept_followers === true
        );
        setSubs(filtered);
      }

      setAfter(subs?.after);

      setLoading(false);
    };
    getSearch();
    return () => {
      setSubs([]);
      setAfter("");
      setLoading(true);
    };
  }, [query?.q, safeSearch, router.query?.type, searchUsers]);
  return (
    <div>
      <div className="">
        <div className="flex flex-col items-center flex-none w-screen">
          <div
            className={
              "w-full " +
              (context.columnOverride === 1 &&
              context.cardStyle !== "row1" &&
              !context.wideUI
                ? " max-w-2xl "
                : expand
                ? "max-w-4xl"
                : " md:w-11/12 ")
            }
          >
            <div className="flex flex-row justify-between select-none">
              <div
                className="flex flex-row items-baseline space-x-4 text-2xl"
                onClick={(e) => {
                  e.preventDefault();
                  setSearchUsers((p) => !p);
                }}
              >
                <div
                  className={
                    "text-2xl cursor-pointer font-bold" +
                    (!searchUsers
                      ? " font-bold "
                      : " opacity-50 hover:opacity-70")
                  }
                >
                  Subreddits
                </div>
                <div
                  className={
                    "cursor-pointer font-bold" +
                    (!searchUsers
                      ? " opacity-50 hover:opacity-70 "
                      : " font-bold ")
                  }
                >
                  Users
                </div>
              </div>
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setSafeSearch((r) => !r);
                }}
                className="flex flex-row items-center my-auto ml-auto mr-2 space-x-2 hover:cursor-pointer"
              >
                <h1 className="text-xs">Safe Search</h1>
                <div
                  className={
                    "w-5 h-5 p-0.5 border rounded-md transition-all  " +
                    (safeSearch
                      ? " dark:bg-blue-600 bg-blue-400 border-blue-400 dark:border-blue-600"
                      : " dark:hover:bg-darkBorder hover:bg-lightBorder border-lightBorder dark:border-darkBorder")
                  }
                >
                  <AiOutlineCheck
                    className={
                      "absolute p-0.5 translate-x-[-1px] transition-all text-white" +
                      (safeSearch ? " scale-100 " : " scale-0")
                    }
                  />
                </div>
              </div>
            </div>
            {loading && (
              <div
                className={
                  " flex flex-col  " +
                  (context.cardStyle === "row1" ? " " : " mx-1") +
                  (expand ? " gap-3 " : " gap-1")
                }
              >
                {[...Array(expand ? 3 : 3)].map((u, i) => (
                  <div key={i}>
                    <SubCardPlaceHolder user={searchUsers} />
                  </div>
                ))}
                <button
                  className="flex items-center justify-center w-24 mt-2 ml-auto text-center border-2 rounded-md cursor-pointer h-9 dark:border border-lightBorder dark:bg-darkBG bg-lightPost dark:border-lightBorder hover:bg-lightHighlight dark:hover:bg-darkBorder"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  {"     "}
                </button>
              </div>
            )}

            {subs.length > 0 ? (
              <>
                <div
                  className={
                    " flex flex-col  " +
                    (context.cardStyle === "row1" ? " " : " mx-1") +
                    (expand ? " gap-3" : " gap-1")
                  }
                >
                  {subs.map((s, i) => {
                    if (i < 3 || expand) {
                      return (
                        <div key={i}>
                          <SubCard data={s} />
                        </div>
                      );
                    }
                  })}
                  {subs.length > 0 && (
                    <div
                      className={
                        "flex flex-row min-w-full mt-2 " +
                        (expand ? " mb-2 " : " ")
                      }
                    >
                      {expand && (
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            router.back();
                          }}
                          className="flex items-center justify-center w-24 text-center border-2 rounded-md cursor-pointer h-9 dark:border border-lightBorder dark:bg-darkBG bg-lightPost dark:border-lightBorder hover:bg-lightHighlight dark:hover:bg-darkBorder"
                        >
                          Go Back
                        </div>
                      )}
                      {expand && (
                        <div
                          onClick={(e) => {
                            e.preventDefault();
                            setSearchUsers((s) => !s);
                          }}
                          className="flex items-center justify-center w-24 ml-2 text-center border-2 rounded-md cursor-pointer h-9 dark:border border-lightBorder dark:bg-darkBG bg-lightPost dark:border-lightBorder hover:bg-lightHighlight dark:hover:bg-darkBorder"
                        >
                          Find {searchUsers ? "Subs" : "Users"}
                        </div>
                      )}
                      {(!expand || after) && (
                        <button
                          className="flex items-center justify-center w-24 ml-auto text-center border-2 rounded-md cursor-pointer h-9 dark:border border-lightBorder dark:bg-darkBG bg-lightPost dark:border-lightBorder hover:bg-lightHighlight dark:hover:bg-darkBorder"
                          onClick={(e) => {
                            e.preventDefault();
                            if (!expand) {
                              router.push(
                                router.query?.type
                                  ? router.asPath.replace(
                                      `type=${router.query.type}`,
                                      `type=${searchUsers ? "user" : "sr"}`
                                    )
                                  : router.asPath.replace(
                                      "search?",
                                      `search?type=${
                                        searchUsers ? "user" : "sr"
                                      }&`
                                    )
                              );
                            } else if (after) {
                              loadMore();
                            }
                          }}
                        >
                          {expand ? "Load" : "See"} More
                        </button>
                      )}
                      {expand && !after && (
                        <div className="mt-auto ml-auto font-bold opacity-50">{`All ${
                          searchUsers ? "users" : "subs"
                        } found`}</div>
                      )}
                    </div>
                  )}
                </div>
              </>
            ) : (
              !loading && (
                <>
                  <div
                    className={
                      "relative mb-2" +
                      (context.cardStyle === "row1" ? " " : " mx-1 ")
                    }
                  >
                    <div className="opacity-0">
                      {[...Array(expand ? 10 : 3)].map((u, i) => (
                        <div key={i}>
                          <SubCardPlaceHolder user={searchUsers} />
                        </div>
                      ))}
                    </div>
                    <div
                      className={
                        "absolute top-0 flex flex-col items-center justify-center w-full h-full text-center border border-gray-300 bg-lightPost group dark:bg-darkBG dark:border-trueGray-700 " +
                        (context?.cardStyle === "row1" ||
                        context?.cardStyle === "card2" ||
                        context?.mediaOnly
                          ? "  "
                          : " rounded-md ")
                      }
                    >
                      <h1>{`Didn't find any ${
                        searchUsers ? "users" : "subreddits"
                      } for "${query.q}"`}</h1>
                      <h1>{`Safe Search is ${safeSearch ? " on " : "off"}`}</h1>
                    </div>
                  </div>
                </>
              )
            )}
            {/* {subs.length > 3 && !expand && (
              <div className="">
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(
                      router.query?.type
                        ? router.asPath.replace(
                            `type=${router.query.type}`,
                            `type=${searchUsers ? "user" : "sr"}`
                          )
                        : router.asPath + `&type=${searchUsers ? "user" : "sr"}`
                    );
                  }}
                  className="bg-red-800"
                >
                  Show More
                </div>
              </div>
            )} */}

            {!expand && <div className="mt-4 text-2xl font-bold">Posts</div>}
          </div>
        </div>
        {!expand && (
          <div className="">
            <Feed query={query} isSearch={true} safeSearch={safeSearch} />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
