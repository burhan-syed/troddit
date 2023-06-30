import { useSession } from "next-auth/react";
import React from "react";
import {
  QueryFunctionContext,
  useInfiniteQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { fixCommentFormat } from "../../lib/utils";
import { useMainContext } from "../MainContext";
import { loadMoreComments, loadPost } from "../RedditAPI";
import { useTAuth } from "../PremiumAuthContext";

const useThread = (permalink, sort, initialData?, withContext = false) => {
  const { isLoaded, premium } = useTAuth();
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const context: any = useMainContext();
  const loading = status === "loading";
  const splitPermalink = permalink?.split("/");
  const threadId =
    splitPermalink?.[3] === "comments" && splitPermalink?.[4]
      ? splitPermalink?.[4]
      : permalink;
  const commentId =
    splitPermalink?.[3] === "comments" &&
    splitPermalink?.[4] &&
    splitPermalink?.[6]
      ? splitPermalink?.[6]
      : ""; //for direct comments

  const updateComments = (prevComments, newComments) => {
    // let update = queryClient.setQueryData(["thread", threadId, sort, commentId, withContext], (newData:any) => {
    const getPrevState = (prevComments) => {
      const prevState = new Map();
      const checkCommentChildren = (comment) => {
        if (comment?.kind === "t1") {
          prevState.set(comment?.data?.name, comment);
          for (
            let i = 0;
            i < comment?.data?.replies?.data?.children?.length ?? 0;
            i++
          ) {
            checkCommentChildren(comment.data.replies.data.children[i]);
          }
        }
      };
      prevComments.forEach((comment) => checkCommentChildren(comment));
      return prevState;
    };

    const processChildren = (prevState, newComment) => {
      let prevComment = prevState.get(newComment?.data?.name);
      let repliesData = newComment?.data?.replies;
      if (newComment?.data?.replies) {
        let children = newComment?.data?.replies?.data?.children ?? [];
        if (prevComment?.data?.replies?.data?.children) {
          if (children?.length > 0) {
            let newChildren = prevComment?.data?.replies?.data?.children;
            newChildren = Array.from(
              [...newChildren, ...children?.filter((c) => c?.kind === "t1")]
                .reduce((m, o) => m.set(o?.data?.name, o), new Map())
                .values()
            );
            repliesData["data"]["children"] = newChildren;
          }
        }
      }

      let comment = {
        ...newComment,
        data: {
          ...newComment.data,
          replies: repliesData,
          collapsed: prevComment?.data?.collapsed
            ? true
            : newComment?.data?.collapsed,
        },
      };
      if (comment?.data?.replies?.data?.children?.length > 0 && prevComment) {
        for (
          let i = 0;
          i < comment?.data?.replies?.data?.children?.length;
          i++
        ) {
          comment.data.replies.data.children[i] = processChildren(
            prevState,
            comment?.data?.replies?.data?.children[i]
          );
        }
      }
      return comment;
    };

    const prevState = getPrevState(prevComments);
    const newCommentsEdit = newComments.map((comment) => {
      return processChildren(prevState, comment);
    });

    return newCommentsEdit;
  };

  const loadChildComments = async (children: string[], link_id) => {
    let childrenstring = children.join(",");
    if (session) {
      const data = await loadMoreComments({
        children: childrenstring,
        link_id,
        loggedIn: !!session,
        token: context.token,
        sort,
        isPremium: premium?.isPremium,
      });
      let morecomments = await fixCommentFormat(data?.data);
      return {
        post_comments: morecomments,
        token: data?.token,
      };
    } else {
      throw new Error("Unable to fetch more comments, must be logged in");
    }
  };

  const processComments = (newComments) => {
    let prevQueryData: any = queryClient.getQueryData([
      "thread",
      threadId,
      sort,
      commentId,
      withContext,
      session?.user?.name,
    ]);
    const prevComments = prevQueryData?.pages
      ?.map((page) => page.comments)
      ?.flat();
    let comments = newComments;
    if (newComments?.length > 0 && prevComments?.length > 0) {
      comments = updateComments(prevComments, newComments);
    }
    return comments;
  };

  const fetchThread = async (feedParams: QueryFunctionContext) => {
    try {
      if (feedParams?.pageParam?.children?.length > 0) {
        const { post_comments, token } = await loadChildComments(
          feedParams.pageParam.children,
          feedParams?.pageParam?.link_id
        );
        token && context.setToken(token);
        const comments = processComments(post_comments)?.map((c) => ({
          ...c,
          data: { ...c?.data },
        }));

        return {
          comments,
        };
      }

      const { post, post_comments, token } = await loadPost({
        permalink,
        sort,
        withcontext: withContext,
        loggedIn: !!session,
        token: context.token,
        isPremium: premium?.isPremium,
      });
      token && context.setToken(token);
      if (!post) {
        throw new Error("Error fetching post");
      }

      const comments = processComments(post_comments);

      return { post, comments };
    } catch (err) {
      if (err?.message === "PREMIUM REQUIRED") {
        // context.setPremiumModal(true);
        return { post: undefined, comments: [] };
      } else {
        throw err;
      }
    }
  };

  const thread = useInfiniteQuery(
    ["thread", threadId, sort, commentId, withContext, session?.user?.name],
    fetchThread,
    {
      enabled: isLoaded && threadId && !loading,
      staleTime: context?.autoRefreshComments ? 0 : Infinity, // 5 * 60 * 1000, //5 min
      getNextPageParam: (lastpage: any) => {
        const lastComment =
          lastpage?.comments?.[lastpage?.comments?.length - 1];
        if (lastComment?.kind === "more") {
          return {
            children: lastComment?.data?.children,
            link_id: lastComment?.data?.parent_id,
          };
        } else return undefined;
      },
    }
  );

  return {
    thread,
  };
};

export default useThread;
