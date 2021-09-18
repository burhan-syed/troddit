import Link from "next/link";
import Autosuggest from "react-autosuggest";
import { useState } from "react";
import axios from "axios";
import router from "next/router";
import { useMainContext } from "../MainContext";
import { searchSubreddits } from "../RedditAPI";
import { useSession, signIn } from "next-auth/client";
import Image from "next/dist/client/image";

const Search = () => {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<any>([]);
  const [session, loading] = useSession();
  const context: any = useMainContext();

  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions({ value });
    setSuggestions(suggestions);
  };

  const getSuggestions = async (value) => {
    let suggestions = [
      {
        data: {
          display_name_prefixed: value.value,
          display_name: value.value,
          over18: false,
        },
      },
    ];
    if (!session) {
      //suggestions.push({ name: value });
      return suggestions;
    } else if (session) {
      //console.log(context);
      suggestions = await searchSubreddits(value.value, context.nsfw);
      suggestions = suggestions.filter((sub) => {
        if (context.nsfw === "true") return sub;
        else if (sub?.data?.over18 !== true) return sub;
      });
      //console.log(suggestions);
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
    return (
      <div>
        <div
          // onClick={(e) =>}
          className="flex flex-row items-center px-2 py-2 overflow-hidden cursor-pointer hover:bg-lightHighlight dark:hover:bg-darkHighlight "
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
              <div className="w-6 h-6 text-center text-white bg-blue-700 rounded-full">
                r/
              </div>
            )}
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
        </div>
        {!session && (
          <div className="flex flex-row items-center flex-grow w-full">
            <button
              className="w-full h-full py-3 bg-white border rounded-lg dark:bg-darkBG border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
              onClick={(e) => handleSignIn(e)}
            >
              <span className="text-blue-300 dark:text-blue-600">Login</span>{" "}
              with Reddit to Autocomplete Search
            </button>
          </div>
        )}
      </div>
    );
  };

  const handleSignIn = (e) => {
    e.stopPropagation();
    signIn();
  };

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    router.push(`/r/${suggestion}`);
  };

  const onSuggestionSelected = (event, { suggestion }) => {
    goToSub(event, suggestion?.data?.display_name ?? "popular");
  };

  const onChange = (event, { newValue }) => {
    setValue(newValue);
  };

  const inputProps = {
    placeholder: "find subreddit",
    value,
    onChange: onChange,
  };

  return (
    <div className="flex flex-row w-full h-full ">
      <Autosuggest
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
