import Link from "next/link";
import Autosuggest from "react-autosuggest";
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { searchSubreddits } from "../RedditAPI";
import { useSession, signIn } from "next-auth/client";
import Image from "next/dist/client/image";
import AllSubs from "../../public/subs.json";
import { usePlausible } from "next-plausible";

import { AiOutlinePlus, AiOutlineSearch, AiOutlineCheck } from "react-icons/ai";

const Search = ({ id }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, seterror] = useState(false);
  const [value, setValue] = useState("");
  const [placeHolder, setPlaceHolder] = useState("search");
  const [suggestions, setSuggestions] = useState<any>([]);
  const [session] = useSession();
  const [loading, setLoading] = useState(false);
  const [lastsuggestion, setlastsuggestion] = useState("");
  const [morethanonesuggestion, setmorethanonesuggestion] = useState(false);
  const context: any = useMainContext();
  const lastRequest = useRef(null);
  const [updated, setUpdated] = useState(false);
  const [srRestrict, setSrRestrict] = useState(false);
  const [currSub, setCurrSub] = useState("");
  const plausible = usePlausible();

  useEffect(() => {
    //console.log("f", updated);
    setUpdated(false);
  }, [lastRequest?.current]);

  useEffect(() => {
    let sub = "";
    if (router.route === "/r/[...slug]" && router?.query?.slug?.[0]) {
      sub = router.query.slug[0];
    }
    if (router?.query?.q) {
      setPlaceHolder(
        "searching " +
          `"${router?.query?.q?.toString()}"` +
          (sub !== "" ? ` in r/${sub}` : "")
      );
    }
    return () => {
      setPlaceHolder("search");
    };
  }, [router?.query?.q]);

  useEffect(() => {
    if (router.pathname === "/r/[...slug]") {
      let sub = router?.query?.slug?.[0]
        .split(" ")
        .join("+")
        .split(",")
        .join("+")
        .split("%20")
        .join("+")
        ?.split("+")?.[0];
      setCurrSub(sub);
      //this is annoying
      //setSrRestrict(true);
    } else {
      setCurrSub("");
      setSrRestrict(false);
    }
    return () => {
      setCurrSub("");
      setSrRestrict(false);
    };
  }, [router]);

  const onSuggestionsFetchRequested = async ({ value }) => {
    lastRequest.current = value;
    setSuggestions([
      {
        kind: "search",
        data: {
          restrict_sr: false,
          q: value,
          include_over_18: false,
          display_name_prefixed: `r/${value.value}`,
        },
      },
      {
        kind: "loading",
        data: {
          display_name_prefixed: `r/${value}`,
          display_name: value,
        },
      },
    ]);
    const suggestions = await getSuggestions({ value });
    if (suggestions?.length > 0) {
      setSuggestions(suggestions);
      setLoading(false);
      setUpdated(true);
    }
  };
  const searchFields = [
    "author, flair, nsfw, self, selftext, site, subreddit, title, url",
  ];
  const extractFields = (query) => {};
  const getSuggestions = async (value) => {
    //console.log(value);
    let search = {
      kind: "search",
      data: {
        restrict_sr: false,
        q: value.value,
        include_over_18: false,
        display_name_prefixed: `r/${value.value}`,
      },
    };
    let suggestions = [
      {
        kind: "t5",
        data: {
          display_name_prefixed: `r/${value.value}`,
          display_name: value.value,
          over18: false,
          default: true,
        },
      },
    ];
    let data = [];
    setLoading(true);
    data = await searchSubreddits(value.value, context.nsfw);
    //console.log(data);
    if (data?.length > 0) {
      let match = false;
      if (lastRequest.current === value.value) {
        seterror(false);
        let filtered = data.filter((sub) => {
          if (context.nsfw === "true" || sub?.data?.over18 !== true) {
            if (
              sub?.data?.display_name?.toLowerCase() ===
              value.value.toLowerCase()
            ) {
              match = true;
            }
            return sub;
          }
        });
        if (match) {
          suggestions = [...filtered];
        } else {
          suggestions = [...suggestions, ...filtered];
        }
        setlastsuggestion(
          suggestions[suggestions.length - 1]?.data?.display_name_prefixed
        );
        setmorethanonesuggestion(suggestions.length > 1);
        //console.log("kept", lastRequest.current);
        return [search, ...suggestions];
      } else {
        //console.log("discard", lastRequest.current, value.value);
        // return {};
      }
    }
    // else {
    //   //fallback to local search
    //   session && seterror(true);
    //   let localsearch = localSearch(value.value);
    //   if (localsearch?.length > 0) {
    //     suggestions = [...suggestions, ...localsearch];
    //   }
    //   setlastsuggestion(
    //     suggestions[suggestions.length - 1]?.data?.display_name_prefixed
    //   );
    //   setmorethanonesuggestion(suggestions.length > 1);
    //   return [...suggestions, search];
    // }
    return [];
  };

  //https://frontpagemetrics.com/
  //https://www.molbiotools.com/textextractor.html
  //https://www.htmlstrip.com/string-text-to-json-list-to-json-converter
  const localSearch = (value) => {
    let suggestions = [];
    try {
      let data = AllSubs.SFW;
      if (context.nsfw === "true") data = [...data, ...AllSubs.NSFW];
      const search = data
        .filter((item) => {
          return item.toLowerCase().indexOf(value.toLowerCase()) > -1;
        })
        .slice(0, 4);
      search.forEach((s) => {
        if (s.toLowerCase() != value.toLowerCase()) {
          suggestions.push({
            data: { display_name_prefixed: s, display_name: s },
          });
        }
      });
    } catch (e) {
      console.log(e);
    }
    return suggestions;
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => {
    return suggestion?.data?.display_name ?? suggestion?.data?.q ?? "";
  };

  const renderSuggestion = (suggestion) => {
    if (loading && suggestion?.kind === "loading") {
      return (
        <>
          {/* Default value */}
          <div>
            <div className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer select-none hover:bg-lightHighlight dark:hover:bg-darkHighlight ">
              <div className="ml-2">
                {suggestion?.data?.icon_image ?? suggestion?.data?.icon_img ? (
                  <div className="relative w-6 h-6 rounded-full">
                    <Image
                      src={
                        suggestion?.data?.icon_image ??
                        suggestion?.data?.icon_img
                      }
                      alt="r"
                      layout="fill"
                      className="rounded-full"
                      unoptimized={true}
                    ></Image>
                  </div>
                ) : (
                  <div className="w-6 h-6 text-center bg-blue-700 rounded-full text-lightText">
                    r/
                  </div>
                )}
              </div>
              <div className="flex flex-col ml-4">
                <div>{lastRequest.current}</div>
                <div className="text-xs text-lightBorderHighlight dark:text-darkBorderHighlight">
                  {"?? followers "}
                </div>
              </div>
            </div>
            {/* Loading placeholder */}
            <>
              <div className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer select-none hover:bg-lightHighlight dark:hover:bg-darkHighlight ">
                <div className="ml-2">
                  {suggestion?.data?.icon_image ??
                  suggestion?.data?.icon_img ? (
                    <div className="relative w-6 h-6 rounded-full">
                      <Image
                        src={
                          suggestion?.data?.icon_image ??
                          suggestion?.data?.icon_img
                        }
                        alt="r"
                        layout="fill"
                        className="rounded-full"
                        unoptimized={true}
                      ></Image>
                    </div>
                  ) : (
                    <div className="w-6 h-6 text-center bg-blue-700 rounded-full text-lightText animate-pulse">
                      r/
                    </div>
                  )}
                </div>
                <div className="flex flex-col ml-4">
                  <div className="h-4 bg-gray-200 rounded-md w-52 dark:bg-gray-500 animate-pulse"></div>
                  <div className="text-xs text-lightBorderHighlight dark:text-darkBorderHighlight animate-pulse">
                    {"?? followers "}
                  </div>
                </div>
              </div>
            </>
          </div>
        </>
      );
    }
    if (suggestion?.kind === "search") {
      return (
        <Link
          href={
            srRestrict && currSub
              ? `/r/${currSub}/search?sort=relevance&t=all&q=${suggestion?.data?.q}`
              : `/search?q=${suggestion?.data?.q}&sort=relevance&t=all`
          }
        >
          <a>
            <div className="flex flex-row flex-wrap items-center px-2 py-2 pl-4 overflow-hidden cursor-pointer select-none hover:bg-lightHighlight dark:hover:bg-darkHighlight">
              <AiOutlineSearch className="w-6 h-6" />
              <h1 className="ml-4">{`Search for "${suggestion?.data?.q}"`}</h1>
              {currSub !== "" && (
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setSrRestrict((r) => !r);
                  }}
                  className="flex flex-row items-center mt-auto ml-auto space-x-2 group"
                >
                  <h1 className="text-xs">Limit to r/{currSub}</h1>
                  <div
                    className={
                      "w-7 h-7 p-0.5 border rounded-md transition-all flex items-center justify-center   " +
                      (srRestrict
                        ? " dark:bg-blue-600 bg-blue-400 border-blue-400 dark:border-blue-600"
                        : " dark:hover:bg-darkBorder hover:bg-lightBorder border-lightBorder dark:border-darkBorder group-hover:ring-2 ring-blue-400 dark:group-ring-blue-600 group-hover:border-0")
                    }
                  >
                    <AiOutlineCheck
                      className={
                        " w-4 h-4  pt-[1px] pl-[1px] flex-none transition-all text-white" +
                        (srRestrict ? " scale-100 " : " scale-0")
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </a>
        </Link>
      );
    }
    return (
      <div className="select-none ">
        {/* <Link href={`r/${suggestion?.data?.display_name.replace('/r','')}`}>
          <a> */}
        <Link href={`/r/${suggestion?.data?.display_name}`}>
          <a
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            <div
              // onClick={(e) =>}
              className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight "
            >
              <div className="ml-2">
                {suggestion?.data?.icon_image?.length > 1 ||
                suggestion?.data?.icon_img?.length > 1 ||
                suggestion?.data?.community_icon?.length > 1 ? (
                  <div className="relative w-6 h-6 rounded-full">
                    <Image
                      src={
                        suggestion?.data?.community_icon?.length > 1
                          ? suggestion?.data?.community_icon.replaceAll(
                              "amp;",
                              ""
                            )
                          : suggestion?.data?.icon_img?.length > 1
                          ? suggestion?.data?.icon_img.replaceAll("amp;", "")
                          : suggestion?.data?.icon_image?.length > 1
                          ? suggestion?.data?.icon_image.replaceAll("amp;", "")
                          : "https://styles.redditmedia.com/t5_38jf0/styles/communityIcon_9o27r8mvttb51.png?width=256&s=58e6c9e7f7b36126893dbecb474d234de0ab7f5c"
                      }
                      alt="r"
                      layout="fill"
                      className="rounded-full"
                      unoptimized={true}
                    ></Image>
                  </div>
                ) : (
                  <div className="w-6 h-6 text-center bg-blue-700 rounded-full text-lightText">
                    r/
                  </div>
                )}
                {/* <p>1:{suggestion?.data?.icon_image?.length}</p>
                <p>2:{suggestion?.data?.icon_img?.length}</p>
                <p>3:{suggestion?.data?.community_icon?.length}</p> */}
              </div>
              <div className="flex flex-col ml-4">
                <div>{suggestion?.data?.display_name_prefixed}</div>
                <div className="text-xs text-lightBorderHighlight dark:text-darkBorderHighlight">
                  {suggestion?.data?.subscribers
                    ? suggestion.data.subscribers.toLocaleString("en-US") +
                      " followers "
                    : "?? followers "}
                  {suggestion?.data?.over18 && (
                    <span className="pl-2 text-xs font-semibold text-red-400 dark:text-red-700">
                      nsfw
                    </span>
                  )}
                </div>
              </div>
              {currSub && (
                <div
                  title={`add r/${suggestion?.data?.display_name} to current feed`}
                  className="flex flex-row items-center ml-auto space-x-2 group"
                  onClick={(e) => addSub(e, suggestion?.data?.display_name)}
                >
                  <span className="text-xs">Multi Browse</span>
                  <div className="flex items-center justify-center flex-none border rounded-md w-7 h-7 group-hover:border-0 dark:text-lightText group-hover:ring-2 ring-blue-400 dark:group-ring-blue-600 dark:hover:bg-darkBorder hover:bg-lightBorder border-lightBorder dark:border-darkBorder">
                    <AiOutlinePlus className="" />
                  </div>
                </div>
              )}
            </div>
          </a>
        </Link>
        {/* </a>
        </Link> */}

        {session &&
          error &&
          lastsuggestion === suggestion?.data?.display_name_prefixed && (
            <>
              <div className="flex flex-col items-center justify-center w-full h-full py-3 bg-white border rounded-lg select-none dark:bg-darkBG border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight">
                <h1>{"No subreddit suggestions"}</h1>
              </div>
            </>
          )}
      </div>
    );
  };

  const handleSignIn = (e) => {
    e.stopPropagation();
    signIn("reddit");
  };

  const addSub = (e, sub) => {
    e.preventDefault();
    e.stopPropagation();
    if (router.route === "/r/[...slug]") {
      let curr = router?.query?.slug?.[0];
      let alreadyadded = false;
      curr
        .split(" ")
        .join("+")
        .split(",")
        .join("+")
        .split("%2b")
        .join("+")
        .split("%2B")
        .join("+")
        .split("+")
        .forEach((s) => {
          if (s.toUpperCase() === sub.toUpperCase()) alreadyadded = true;
        });
      !alreadyadded && router.push(`${sub}+${curr}`);
    } else {
      goToSub(e, sub);
    }
    setValue("");
  };

  const goToSub = (e, suggestion) => {
    //e.preventDefault();
    router.push(`/r/${suggestion}`);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setValue("");
    // if (loading) {
    //   if (srRestrict && currSub !== "") {
    //     router.push(
    //       `/r/${currSub}/search?sort=relevance&t=all&q=${lastRequest.current}`
    //     );
    //   } else {
    //     router.push(`/search?q=${lastRequest.current}&sort=relevance&t=all`);
    //   }
    // } else
    if (suggestion?.kind === "search") {
      if (srRestrict && currSub !== "") {
        router.push(
          `/r/${currSub}/search?sort=relevance&t=all&q=${suggestion?.data?.q}`
        );
      } else {
        router.push(`/search?q=${suggestion?.data?.q}&sort=relevance&t=all`);
      }
    } else if (suggestion?.kind === "loading") {
      router.push(`/r/${suggestion?.data?.display_name}`);
    } else if (suggestion?.kind === "t5") {
      if (
        suggestion?.data?.display_name
          ?.toLowerCase()
          .includes(lastRequest.current.toLowerCase()) ||
        updated
      ) {
        goToSub(event, suggestion?.data?.display_name ?? "popular");
      } else {
        //console.log(lastRequest, suggestion?.data?.display_name);
        goToSub(event, lastRequest.current);
      }
    }

    plausible("search");
  };

  const onChange = (event, { newValue, method }) => {
    setValue(method === "click" || method === "enter" ? "" : newValue);
  };

  const inputProps = {
    placeholder: placeHolder,
    value,
    onChange: onChange,
    onFocus: () => context.setReplyFocus(true),
    onBlur: () => context.setReplyFocus(false),
  };

  return (
    <div className="flex flex-row w-full h-full">
      <Autosuggest
        id={id}
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        highlightFirstSuggestion={true}
        onSuggestionSelected={onSuggestionSelected}
      />
    </div>
  );
};

export default Search;
