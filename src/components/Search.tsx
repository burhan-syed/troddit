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
    console.log(suggestion);
    return (
      <ul
        className=""
        onClick={(e) => goToSub(e, suggestion.name)}
        onSubmit={(e) => goToSub(e, suggestion.name)}
      >
        {suggestion.name}
      </ul>
    );
  };

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    console.log(suggestions);
    router.push({
      pathname: "/r/[subs]",
      query: { subs: suggestion },
    });
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
    <>
      <Autosuggest
        className=""
        suggestions={suggestions}
        onSuggestionsFetchRequested={onSuggestionsFetchRequested}
        onSuggestionsClearRequested={onSuggestionsClearRequested}
        getSuggestionValue={getSuggestionValue}
        renderSuggestion={renderSuggestion}
        inputProps={inputProps}
      />
    </>
  );
};

export default Search;
