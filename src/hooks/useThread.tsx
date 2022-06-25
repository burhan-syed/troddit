import { useSession } from "next-auth/react";
import React from "react";
import { QueryFunctionContext, useInfiniteQuery } from "react-query";
import { useMainContext } from "../MainContext";
import { loadPost } from "../RedditAPI";

const useThread = (permalink, sort, initialData?, withContext=false) => {
  const { data: session, status } = useSession();
  const context: any = useMainContext();
  const loading = status === "loading";
  const splitPermalink = permalink?.split("/");
  const threadId = (splitPermalink?.[3] === "comments" && splitPermalink?.[4]) ? splitPermalink?.[4] :  permalink;
  const commentId = (splitPermalink?.[3] === "comments" && splitPermalink?.[4] && splitPermalink?.[6]) ? splitPermalink?.[6] : ""; //for direct comments

  const fetchThread = async (feedParams: QueryFunctionContext) => {
    console.log("FETCH POST"); 
    const { post, comments, token } = await loadPost(
      permalink,
      sort,
      status === "authenticated",
      context?.token,
      withContext
    );
    token && context.setToken(token);
    if (!post){throw new Error("Error fetching post")}
    return { post, comments };
  };

  const thread = useInfiniteQuery(
    ["thread", threadId, sort, commentId, withContext],
    fetchThread, {
      enabled: threadId && !loading,
      staleTime: 5 * 60 * 1000, //5 min
     //initialData: () => {console.log('initialData?',initialData); return initialData;},
    }
  );

  return {
    thread
  }
};

export default useThread;
