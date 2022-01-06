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

import { AiOutlinePlus } from "react-icons/ai";

const Search = ({ id }) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [error, seterror] = useState(false);
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<any>([]);
  const [session] = useSession();
  const [loading, setLoading] = useState(false);
  const [lastsuggestion, setlastsuggestion] = useState("");
  const [morethanonesuggestion, setmorethanonesuggestion] = useState(false);
  const context: any = useMainContext();
  const lastRequest = useRef(null);
  const [updated, setUpdated] = useState(false);
  const plausible = usePlausible();

  useEffect(() => {
    //console.log("f", updated);
    setUpdated(false);
  }, [lastRequest?.current]);

  const onSuggestionsFetchRequested = async ({ value }) => {
    lastRequest.current = value;
    setSuggestions([value]);
    const suggestions = await getSuggestions({ value });
    if (suggestions?.length > 0) {
      setSuggestions(suggestions);
      setLoading(false);
      setUpdated(true);
      // console.log("u", updated);
    }
  };

  const getSuggestions = async (value) => {
    //console.log(value);
    let suggestions = [
      {
        data: {
          display_name_prefixed: `r/${value.value}`,
          display_name: value.value,
          over18: false,
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
              sub?.data?.display_name.toLowerCase() ===
              value.value.toLowerCase()
            ) {
              match = true;
            }
            return sub;
          }
        });
        if (match) {
          suggestions = filtered;
        } else {
          suggestions = [...suggestions, ...filtered];
        }
        setlastsuggestion(
          suggestions[suggestions.length - 1]?.data?.display_name_prefixed
        );
        setmorethanonesuggestion(suggestions.length > 1);
        //console.log("kept", lastRequest.current);
        return suggestions;
      } else {
        //console.log("discard", lastRequest.current, value.value);
        // return {};
      }
    } else {
      //fallback to local search
      session && seterror(true);
      let search = localSearch(value.value);
      if (search?.length > 0) {
        suggestions = [...suggestions, ...search];
      }
      setlastsuggestion(
        suggestions[suggestions.length - 1]?.data?.display_name_prefixed
      );
      setmorethanonesuggestion(suggestions.length > 1);
      return suggestions;
    }

    // if (suggestions.length < 1 || error) {
    //   //suggestions.push({ name: value });
    //   suggestions = [
    //     {
    //       data: {
    //         display_name_prefixed: value.value,
    //         display_name: value.value,
    //         over18: false,
    //       },
    //     },
    //   ];

    // }
    //return suggestions;
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
    return suggestion?.data?.display_name;
  };

  const renderSuggestion = (suggestion) => {
    //console.log(suggestion);
    if (loading) {
      return (
        <div>
          {/* <Link href={`r/${suggestion?.data?.display_name?.replace('r/','')}`?? `${value.replace('r/','')}`}>
            <a> */}
          <div
            // onClick={(e) =>}
            className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer select-none hover:bg-lightHighlight dark:hover:bg-darkHighlight "
          >
            <div className="ml-2">
              {suggestion?.data?.icon_image ?? suggestion?.data?.icon_img ? (
                <div className="relative w-6 h-6 rounded-full">
                  <Image
                    src={
                      suggestion?.data?.icon_image ?? suggestion?.data?.icon_img
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
              <div>{suggestion?.data?.display_name_prefixed ?? value}</div>
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
          </div>
          {/* </a>
          </Link> */}
          {!suggestion?.data?.subscribers && (
            <>
              <div
                // onClick={(e) =>}
                className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer select-none hover:bg-lightHighlight dark:hover:bg-darkHighlight "
              >
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
              </div>
            </>
          )}
        </div>
      );
    }
    return (
      <div className="select-none ">
        {/* <Link href={`r/${suggestion?.data?.display_name.replace('/r','')}`}>
          <a> */}
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
                      ? suggestion?.data?.community_icon.replaceAll("amp;", "")
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
          <div
            className="p-2 ml-auto border rounded-md dark:text-lightText dark:hover:ring-2 hover:bg-white dark:hover:bg-darkBorderHighlight hover:ring-1"
            onClick={(e) => addSub(e, suggestion?.data?.display_name)}
          >
            <AiOutlinePlus className="" />
          </div>
        </div>
        {/* </a>
        </Link> */}

        {session &&
          error &&
          lastsuggestion === suggestion?.data?.display_name_prefixed && (
            <>
              <div className="flex flex-col items-center justify-center w-full h-full py-3 bg-white border rounded-lg select-none dark:bg-darkBG border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight">
                <h1>{"Can't connect to Reddit for search"}</h1>
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
      router.push(`${sub}+${curr}`);
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
    //console.log(updated);
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
    plausible("search");
  };

  const onChange = (event, { newValue, method }) => {
    setValue(method === "click" || method === "enter" ? "" : newValue);
  };

  const inputProps = {
    placeholder: "find subreddit",
    value,
    onChange: onChange,
  };

  return (
    <div className="flex flex-row w-full h-full ">
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
