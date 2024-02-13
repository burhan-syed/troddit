import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { RiArrowGoBackLine } from "react-icons/ri";
import { useMainContext } from "../MainContext";
import { getRedditSearch } from "../RedditAPI";
import Feed from "./Feed";
import SubCard from "./cards/SubCard";
import SubCardPlaceHolder from "./cards/SubCardPlaceHolder";
import Checkbox from "./ui/Checkbox";
import React from "react";
import { useTAuth } from "../PremiumAuthContext";
const SearchPage = ({ query }) => {
  const { isLoaded, premium } = useTAuth();
  const router = useRouter();
  const context: any = useMainContext();
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState<any[]>([]);
  const [after, setAfter] = useState("");
  const [expand, setExpand] = useState(false);
  const [searchUsers, setSearchUsers] = useState(false);
  const { safeSearch, setSafeSearch } = context;
  const loadMore = async () => {
    try {
      let subs = await getRedditSearch({
        params: { q: query?.q },
        after,
        include_over_18: safeSearch ? undefined : true,
        searchtype: router.query?.type === "user" ? "user" : "sr",
        isPremium: premium?.isPremium ?? false,
      });
      if (subs?.children) {
        let filtered = subs?.children?.filter(
          (c) => c?.data?.accept_followers === true
        );
        setSubs((p) => [...p, ...filtered]);
      }

      setAfter(subs?.after);
    } catch (err) {
      if (err?.message === "PREMIUM REQUIRED") {
        context.setPremiumModal(true);
      } else {
        throw err;
      }
    }
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
      let subs = await getRedditSearch({
        params: { q: query?.q },
        after: "",
        include_over_18: safeSearch ? undefined : true,
        searchtype: router.query?.type === "user" ? "user" : "sr",
        isPremium: premium?.isPremium ?? false,
      });
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
    if (isLoaded) {
      getSearch();
    }
    return () => {
      setSubs([]);
      setAfter("");
      setLoading(true);
    };
  }, [
    query?.q,
    safeSearch,
    router.query?.type,
    searchUsers,
    isLoaded,
    premium?.isPremium,
  ]);
  return (
    <div>
      <div className="flex flex-col items-center flex-none w-screen ">
        <div
          className={
            "w-full " +
            (!expand &&
              (context.columnOverride === 1 &&
              context.cardStyle !== "row1" &&
              !context.wideUI
                ? " max-w-2xl "
                : " md:w-11/12 "))
          }
        >
          <div
            className={
              expand
                ? "flex flex-col  justify-center gap-3 mx-4 md:gap-0 md:mx-auto md:flex-row"
                : "flex flex-col gap-1"
            }
          >
            <div>
              <div
                className={
                  (expand
                    ? "md:sticky top-[4rem] flex flex-row md:flex-col gap-2 w-full md:w-52 md:flex-none  p-2 md:px-0 md:mr-4  border  bg-th-post border-th-border2   shadow-md  " +
                      " rounded-lg "
                    : "flex flex-row justify-between select-none  ") + " "
                }
              >
                <div
                  className={
                    "flex flex-row items-baseline gap-2  w-full " +
                    (expand ? " md:flex-col md:items-start    " : " font-bold ")
                  }
                >
                  {["Subreddits", "Users"].map((sel) => (
                    <div
                      key={sel}
                      className={
                        "cursor-pointer " +
                        ((searchUsers && sel == "Users") ||
                        (!searchUsers && sel == "Subreddits")
                          ? ` font-bold  ${expand ? " bg-th-highlight " : ""} `
                          : " opacity-50 hover:opacity-70") +
                        (expand
                          ? " md:w-full flex flex-col-reverse   -mb-2 md:mb-0 items-center md:flex-row flex-grow"
                          : "")
                      }
                      onClick={(e) => {
                        e.preventDefault();
                        setSearchUsers((p) => !p);
                      }}
                    >
                      {expand && (
                        <div className="w-full h-1 mt-1 md:w-1 md:h-8 md:mr-2 md:mt-0 bg-th-scrollbar"></div>
                      )}

                      {sel}
                    </div>
                  ))}
                  <div
                    className={
                      "flex flex-row items-center my-auto gap-2 hover:cursor-pointer" +
                      (expand
                        ? " md:flex-row-reverse ml-auto md:mr-auto md:ml-0 md:my-1 pl-2 "
                        : " mr-2 ml-auto ")
                    }
                  >
                    <Checkbox
                      clickEvent={() => setSafeSearch((r) => !r)}
                      toggled={safeSearch}
                      labelText={"Safe Search"}
                      reverse={expand}
                    />
                  </div>
                </div>
              </div>
              <div
                className={
                  (expand ? " hidden md:block " : " hidden ") +
                  " cursor-pointer opacity-50 hover:opacity-70 w-full sticky top-[13rem] "
                }
                onClick={(e) => {
                  e.preventDefault();
                  router.back();
                }}
              >
                <RiArrowGoBackLine className="w-10 h-10 ml-auto mr-4 " />
              </div>
            </div>
            <div
              className={
                expand
                  ? " mb-10 mt-2 flex flex-col gap-3  md:w-[32rem] lg:w-[48rem] xl:w-[54rem] 2xl:w-[60rem] "
                  : ""
              }
            >
              {loading && (
                <div
                  className={
                    " flex flex-col  " +
                    (context.cardStyle === "row1" || expand ? " " : " mx-1") +
                    (expand ? " gap-3 " : " gap-1")
                  }
                >
                  {[...Array(expand ? 3 : 3)].map((u, i) => (
                    <div key={i}>
                      <SubCardPlaceHolder user={searchUsers} />
                    </div>
                  ))}
                  <button
                    aria-label="...loading"
                    className="flex items-center justify-center w-24 mt-2 ml-auto text-center border rounded-md cursor-pointer h-9 bg-th-background2 border-th-border hover:border-th-borderHighlight hover:bg-th-highlight ring-1 ring-th-base"
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
                      (context.cardStyle === "row1" || expand ? " " : " mx-1") +
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
                          (expand ? " mb-10 " : " ")
                        }
                      >
                        {expand && (
                          <div
                            onClick={(e) => {
                              e.preventDefault();
                              router.back();
                            }}
                            className="flex items-center justify-center w-24 text-center border rounded-md cursor-pointer h-9 bg-th-background2 border-th-border hover:border-th-borderHighlight hover:bg-th-highlight ring-1 ring-th-base "
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
                            className="flex items-center justify-center w-24 ml-2 text-center border rounded-md cursor-pointer h-9 bg-th-background2 border-th-border hover:border-th-borderHighlight hover:bg-th-highlight ring-1 ring-th-base "
                          >
                            Find {searchUsers ? "Subs" : "Users"}
                          </div>
                        )}
                        {(!expand || after) && (
                          <button
                            aria-label="see more"
                            className="flex items-center justify-center w-24 ml-auto text-center border rounded-md cursor-pointer h-9 bg-th-background2 border-th-border hover:border-th-borderHighlight hover:bg-th-highlight ring-1 ring-th-base "
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
                          "absolute top-0 flex flex-col items-center justify-center w-full h-full text-center border bg-th-post border-th-border " +
                          " rounded-lg "
                        }
                      >
                        <h1>{`Didn't find any ${
                          searchUsers ? "users" : "subreddits"
                        } for "${query.q}"`}</h1>
                        <h1>{`Safe Search is ${
                          safeSearch ? " on " : "off"
                        }`}</h1>
                      </div>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
          {!expand && <div className="mt-4 mb-1 font-bold">Posts</div>}
        </div>
      </div>
      {!expand && (
        <div className="">
          <Feed />
        </div>
      )}
    </div>
  );
};

export default SearchPage;
