import Link from "next/link";
import Autosuggest from "react-autosuggest";
import { useState } from "react";
import axios from "axios";
import Snoowrap from "snoowrap";
import router from "next/router";

const languages = [
  {
    name: "C",
    year: 1972,
  },
  {
    name: "Elm",
    year: 2012,
  },
];

const Search = ({ accessToken }) => {
  const [query, setQuery] = useState("");
  const [value, setValue] = useState("");
  const [suggestions, setSuggestions] = useState<any>([]);

  // const [r, setR] = useState(
  //   new Snoowrap({
  //     userAgent: "search wrapper",
  //     clientId: process.env.CLIENT_ID,
  //     clientSecret: process.env.CLIENT_SECRET,
  //     accessToken: accessToken,
  //   })
  // );

  const onSuggestionsFetchRequested = async ({ value }) => {
    const suggestions = await getSuggestions({ value });
    setSuggestions(suggestions);
  };

  const getSuggestions = async (value) => {
    if (accessToken) {
      // const subs = await r.searchSubredditNames({
      //   query: value,
      //   exact: false,
      //   includeNsfw: true,
      // });
      // console.log(subs);
      try {
        console.log(value);
        let res = await axios.get(
          "https://oauth.reddit.com/api/subreddit_autocomplete",
          {
            headers: {
              authorization: `bearer ${accessToken}`,
            },
            params: {
              include_over_18: true,
              include_profiles: false,
              query: value.value,
              typeahead_active: true,
            },
          }
        );
        console.log(res.data.subreddits);
        return(res.data.subreddits)
        
      } catch (err) {
        console.log(err);
      }
    }
    return [{name: "Login for search complete"}];
  };

  const onSuggestionsClearRequested = () => {
    setSuggestions([]);
  };

  const getSuggestionValue = (suggestion) => {
    return suggestion.name;
  };

  const renderSuggestion = (suggestion) => {
    console.log(suggestion);
    return (<div onClick={e => goToSub(e, suggestion.name)}>{suggestion.name}</div>);
  };

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    router.push({
      pathname: "/r/[subs]",
      query: {subs: suggestion}
    })

  }

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
