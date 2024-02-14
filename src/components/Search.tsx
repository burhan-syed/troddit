import Link from "next/link";
import Autosuggest from "react-autosuggest";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { useMainContext } from "../MainContext";
import { searchSubreddits } from "../RedditAPI";
import { useSession, signIn } from "next-auth/react";
import debounce from "lodash/debounce";
import Image from "next/legacy/image";
// import { usePlausible } from "next-plausible";
import { useTAuth } from "../PremiumAuthContext";
import {
  AiOutlinePlus,
  AiOutlineSearch,
  AiOutlineCheck,
  AiOutlineMinus,
} from "react-icons/ai";
import { useCollectionContext } from "./collections/CollectionContext";
import Checkbox from "./ui/Checkbox";
import ItemsList from "./search/ItemsList";

const Search = ({ id, setShowSearch = (a) => {} }) => {
  const { isLoaded, premium } = useTAuth();
  const router = useRouter();
  const [error, seterror] = useState(false);
  const [value, setValue] = useState("");
  const [placeHolder, setPlaceHolder] = useState("search");
  const [suggestions, setSuggestions] = useState<any>([]);
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [lastsuggestion, setlastsuggestion] = useState("");
  const [morethanonesuggestion, setmorethanonesuggestion] = useState(false);
  const context: any = useMainContext();
  const lastRequest = useRef<string>();
  const [updated, setUpdated] = useState(false);
  const [srRestrict, setSrRestrict] = useState(false);
  const [currSub, setCurrSub] = useState<string | undefined>("");
  const [addMode, setAddMode] = useState("");
  // const plausible = usePlausible();

  const myCollections: any = useCollectionContext();
  const { toggleSelected, selected } = myCollections;

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
      setAddMode("subs");
      setSrRestrict(true);
    } else {
      setCurrSub("");
      setSrRestrict(false);
      if (router.asPath === "/subreddits/feeds") {
        setAddMode("feeds");
      } else {
        setAddMode("");
      }
    }

    return () => {
      setCurrSub("");
      setAddMode("");
      setSrRestrict(false);
    };
  }, [router]);

  const debounceSuggestionFetch = useCallback(
    debounce(async (value) => {
      const suggestions = await getSuggestions({ value });
      if (suggestions?.length > 0) {
        setSuggestions(suggestions);
        setLoading(false);
        setUpdated(true);
      }
    }, 600),
    [premium?.isPremium, context?.token, context?.nsfw]
  );

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
    debounceSuggestionFetch(value);
  };
  const searchFields = [
    "author, flair, nsfw, self, selftext, site, subreddit, title, url",
  ];
  const extractFields = (query) => {};
  const getSuggestions = async (value) => {
    //premium?.isPremium
    if (true) {
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

      setLoading(true);
      let res: any = await searchSubreddits({
        query: value.value,
        over18: context.nsfw,
        loggedIn: !!session,
        token: context?.token,
        isPremium: premium?.isPremium,
      });
      let data = res?.data;
      data?.token && context.setToken(data?.token);
      //console.log(data);
      if (data?.length > 0) {
        let match = false;
        if (lastRequest.current === value.value) {
          seterror(false);
          let filtered = data.filter((sub) => {
            if (context.nsfw === true || sub?.data?.over18 !== true) {
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
    }

    // }
    return [];
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
          <div aria-label={lastRequest?.current ?? "suggestions loading"}>
            <div className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer select-none hover:bg-th-highlight ">
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
                  <div className="w-6 h-6 text-center text-white rounded-full bg-th-accent">
                    r/
                  </div>
                )}
              </div>
              <div className="flex flex-col ml-4">
                <div>{lastRequest.current}</div>
                <div className="text-xs text-th-textLight">
                  {"?? followers "}
                </div>
              </div>
            </div>
            {/* Loading placeholder */}
            <>
              <div className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer select-none hover:bg-th-highlight ">
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
                    <div className="w-6 h-6 text-center text-white rounded-full bg-th-accent animate-pulse">
                      r/
                    </div>
                  )}
                </div>
                <div className="flex flex-col ml-4">
                  <div className="h-4 rounded-md bg-th-highlight w-52 animate-pulse"></div>
                  <div className="text-xs text-th-text opacity-70 animate-pulse">
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
          aria-label={`Search for "${suggestion?.data?.q}"`}
        >
          <div className="flex flex-row flex-wrap items-center px-2 py-2 pl-4 overflow-hidden cursor-pointer select-none hover:bg-th-highlight">
            <AiOutlineSearch className="w-6 h-6" />
            <h1 className="ml-4">{`Search for "${suggestion?.data?.q}"`}</h1>
            {currSub !== "" && (
              <Checkbox
                toggled={srRestrict}
                clickEvent={() => setSrRestrict((r) => !r)}
                labelText={`Limit to r/${currSub}`}
              />
            )}
          </div>
        </Link>
      );
    }
    return (
      <div
        className="select-none "
        aria-label={`go to ${suggestion?.data?.display_name_prefixed}`}
      >
        {/* <Link href={`r/${suggestion?.data?.display_name.replace('/r','')}`}>
          <a> */}
        <Link
          href={`/r/${suggestion?.data?.display_name}`}
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <div
            // onClick={(e) =>}
            className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer hover:bg-th-highlight "
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
                <div className="w-6 h-6 text-center text-white rounded-full bg-th-accent">
                  r/
                </div>
              )}
              {/* <p>1:{suggestion?.data?.icon_image?.length}</p>
              <p>2:{suggestion?.data?.icon_img?.length}</p>
              <p>3:{suggestion?.data?.community_icon?.length}</p> */}
            </div>
            <div className="flex flex-col ml-4">
              <div>{suggestion?.data?.display_name_prefixed}</div>
              <div className="text-xs text-th-textLight opacity-70">
                {suggestion?.data?.subscribers
                  ? suggestion.data.subscribers.toLocaleString("en-US") +
                    " followers "
                  : "?? followers "}
                {suggestion?.data?.over18 && (
                  <span className="pl-2 text-xs font-semibold text-th-red ">
                    nsfw
                  </span>
                )}
              </div>
            </div>
            {addMode && (
              <div
                title={`add r/${suggestion?.data?.display_name} to current feed`}
                className="flex flex-row items-center ml-auto space-x-2 group"
                onClick={(e) => addSub(e, suggestion?.data?.display_name)}
              >
                <span className="hidden text-xs lg:block">
                  {addMode == "subs"
                    ? "Multi Browse"
                    : selected.find(
                        (s) =>
                          s?.toUpperCase() ===
                          suggestion?.data?.display_name?.toUpperCase()
                      )
                    ? "Remove Selected"
                    : "Add to Selected"}
                </span>
                <div className="flex items-center justify-center flex-none border rounded-md w-7 h-7 group-hover:border-0 hover:ring-2 ring-th-accent hover:bg-th-highlight border-th-border ">
                  {addMode == "feeds" &&
                  selected.find(
                    (s) =>
                      s?.toUpperCase() ===
                      suggestion?.data?.display_name?.toUpperCase()
                  ) ? (
                    <AiOutlineMinus />
                  ) : (
                    <AiOutlinePlus className="" />
                  )}
                </div>
              </div>
            )}
          </div>
        </Link>
        {/* </a>
        </Link> */}

        {session &&
          error &&
          lastsuggestion === suggestion?.data?.display_name_prefixed && (
            <>
              <div className="flex flex-col items-center justify-center w-full h-full py-3 border rounded-lg select-none bg-th-background2 border-th-border hover:border-th-borderHighlight ">
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
    if (addMode == "subs") {
      if (router.route === "/r/[...slug]") {
        let curr = router?.query?.slug?.[0];
        let alreadyadded = false;
        curr
          ?.split(" ")
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
    } else {
      toggleSelected(sub);
    }
  };

  const goToSub = (e, suggestion) => {
    //e.preventDefault();
    router.push(`/r/${suggestion}`);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    setValue("");
    setShowSearch(false);
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
          .includes(lastRequest?.current?.toLowerCase()) ||
        updated
      ) {
        goToSub(event, suggestion?.data?.display_name ?? "popular");
      } else {
        //console.log(lastRequest, suggestion?.data?.display_name);
        goToSub(event, lastRequest.current);
      }
    }

    // plausible("search");
  };

  const onChange = (event, { newValue, method }) => {
    setValue(method === "click" || method === "enter" ? "" : newValue);
  };

  const inputProps = {
    placeholder: placeHolder,
    value: value,
    onChange: onChange,
    onFocus: () => {
      context.setReplyFocus(true);
      if (router?.query?.q) {
        setValue(router?.query?.q?.toString());
      }
    },
    onBlur: () => {
      context.setReplyFocus(false);
      setShowSearch(false);
    },
    type: "search",
    autoFocus: true,
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
        renderSuggestionsContainer={({
          containerProps: { role, ...otherContainerProps },
          children,
        }) => (
          <div {...otherContainerProps}>
            {React.Children.map(children, (child) => (
              <ItemsList {...child.props} />
            ))}
          </div>
        )}
        inputProps={inputProps}
        highlightFirstSuggestion={true}
        onSuggestionSelected={onSuggestionSelected}
      />
    </div>
  );
};

export default Search;
