import Link from "next/link";
import Autosuggest from "react-autosuggest";
import { useState } from "react";
import axios from "axios";
import router from "next/router";
import { useMainContext } from "../MainContext";
import { searchSubreddits } from "../RedditAPI";

const Search = () => {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<any>([]);

  const context: any = useMainContext();

  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions({ value });
    setSuggestions(suggestions);
  };

  const getSuggestions = async (value) => {
    let suggestions = await searchSubreddits(value.value);
    //console.log(suggestions);
    return suggestions;
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => {
    return suggestion.name;
  };

  const renderSuggestion = (suggestion) => {
    //console.log(suggestion);
    return (
      <ul
        className="text-black"
        onClick={(e) => goToSub(e, suggestion.name)}
        onSubmit={(e) => goToSub(e, suggestion.name)}
      >
        {/* suggestion.icon */}
        {suggestion.name}
      </ul>
    );
  };

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    router.push(`/r/${suggestion}`);
     
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
    <div className="flex flex-row w-full h-full border border-red-500">
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
        highlightFirstSuggestion={true}
      />
    </div>
  );
};

export default Search;
