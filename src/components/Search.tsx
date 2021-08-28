import Link from "next/link";
import Autosuggest from "react-autosuggest";
import { useState } from "react";
import axios from "axios";
import router from "next/router";
import { useMainContext } from "../MainContext";


const Search = () => {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<any>([]);

  const context:any = useMainContext();


  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions({ value });
    setSuggestions(suggestions);
  };

  const getSuggestions = async (value) => {
    if (context?.token?.accessToken ?? false) {
      try {
        
        let res = await axios.get(
          "https://oauth.reddit.com/api/subreddit_autocomplete",
          {
            headers: {
              authorization: `bearer ${context.token.accessToken}`,
            },
            params: {
              include_over_18: true,
              include_profiles: false,
              query: value.value,
              typeahead_active: true,
            },
          }
        );
        return res.data.subreddits;
      } catch (err) {
        console.log(err);
      }
    }
    return [{ name: "Login for search complete" }];
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
        className="flex"
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
