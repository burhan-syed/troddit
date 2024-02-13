import React from "react";
import { useQuery } from "@tanstack/react-query";
import { loadSubredditInfo } from "../RedditAPI";
import { useTAuth } from "../PremiumAuthContext";

const useSubreddit = (subreddit, isUser = false) => {
  const {isLoaded, premium} = useTAuth(); 
  const subInfo = async () => {
    let data = await loadSubredditInfo({query: subreddit, loadUser: isUser, isPremium: premium?.isPremium});
    return data; 
  };

  const sub = useQuery(["subreddit",subreddit, isUser], subInfo, {
    enabled: isLoaded && subreddit?.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { sub };
};

export default useSubreddit;
