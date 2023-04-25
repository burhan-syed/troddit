import React from "react";
import { useQuery } from "@tanstack/react-query";
import { loadSubredditInfo } from "../RedditAPI";

const useSubreddit = (subreddit, isUser = false) => {
  const subInfo = async () => {
    let data = await loadSubredditInfo(subreddit, isUser);
    return data; 
  };

  const sub = useQuery(["subreddit",subreddit, isUser], subInfo, {
    enabled: subreddit?.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  return { sub };
};

export default useSubreddit;
