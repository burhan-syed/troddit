import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { useMutation, useQueryClient } from "react-query";
import {
  hideLink,
  loadMoreComments,
  postComment,
  postVote,
  saveLink,
} from "../RedditAPI";

const useMutate = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session, status } = useSession();

  interface Change {
    property: string;
    value: any;
  }
  const optimisticUpdate = async (
    key: string[],
    id: string,
    change: Change
  ) => {
    // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
    await queryClient.cancelQueries();
    // Snapshot the previous value
    const previousData = queryClient.getQueriesData(key);

    // Optimistically update to the new value
    queryClient.setQueriesData(["feed"], (oldData: any) => {
      console.log(change);
      let newData = oldData;
      if (newData) {
        let newPages = oldData?.pages?.map((page) => {
          return {
            ...page,
            filtered: page?.filtered?.map((post) => {
              if (id === post?.data?.name) {
                console.log(
                  "FOUND!",
                  post?.data?.title,
                  post.data[change.property],
                  change.value
                );
                post.data[change.property] = change.value;
              }
              return post;
            }),
          };
        });
        newData = { ...newData, pages: newPages };
        console.log("newData", newData);
      }
      return newData;
    });

    return { previousData };
  };

  const voteMutation = useMutation(({ vote, id }: any) => postVote(vote, id), {
    onMutate: async (update) => {
      if (update.id.substring(0, 3) === "t3_") {
        return optimisticUpdate(["feed"], update.id, {
          property: "likes",
          value: update.vote,
        });
      }
    },
    onSuccess: (data: any) => {
      if (data.id.substring(0, 3) === "t3_") {
        console.log("SUCCESS VOTE", session?.user?.name, data);
        if (session?.user?.name) {
          data.vote == 1 &&
            queryClient.invalidateQueries([
              "feed",
              "SELF",
              session.user.name,
              "upvoted",
            ]);
          data.vote == -1 &&
            queryClient.invalidateQueries([
              "feed",
              "SELF",
              session.user.name,
              "downvoted",
            ]);
        } else {
          console.log("ERR NO USER");
          queryClient.invalidateQueries(["feed"]);
        }
      } else if (data.id.substring(0, 3) === "t1_") {
        console.log("COMMENT VOTE");
        console.log(router);
        const path = router?.asPath?.split("/");
        const cIndex = path?.indexOf("comments");
        let postId;
        if (cIndex) {
          postId = path?.[cIndex + 1] as string;
        }
        //this check could be better
        postId?.match(/[A-z0-9]/g)?.length === 6
          ? queryClient.invalidateQueries(["thread", postId])
          : queryClient.invalidateQueries(["thread"]);
      }
    },
    onError: (err, update, context: any) => {
      console.log("err", err);
      if (update.id.substring(0, 3) === "t3_") {
        queryClient.setQueriesData(["feed"], context.previousData);
      }
    },
  });

  const saveMutation = useMutation(
    ({ id, isSaved }: any) => saveLink("", id, isSaved),
    {
      onMutate: async (update) => {
        if (update.id.substring(0, 3) === "t3_") {
          return optimisticUpdate(["feed"], update.id, {
            property: "saved",
            value: update.isSaved ? false : true,
          });
        }
      },
      onSuccess: (data: any) => {
        console.log(router, router.asPath);
        if (
          data?.id?.substring(0, 3) === "t3_" &&
          session?.user?.name &&
          router.asPath !== `/u/${session.user.name}/saved`
        ) {
          console.log("INVALIDATE");
          queryClient.invalidateQueries([
            "feed",
            "SELF",
            session.user.name,
            "saved",
          ]);
        }
      },
      onError: (err, update, context: any) => {
        if (update.id.substring(0, 3) === "t3_") {
          queryClient.setQueriesData(["feed"], context.previousData);
        }
      },
    }
  );

  const hideMutation = useMutation(
    ({ id, isHidden }: any) => hideLink(id, isHidden),
    {
      onMutate: async (update) => {
        return optimisticUpdate(["feed"], update.id, {
          property: "hidden",
          value: update.isHidden ? false : true,
        });
      },
      onSuccess: (data: any) => {
        if (
          session?.user?.name &&
          router.asPath !== `/u/${session.user.name}/hidden`
        ) {
          queryClient.invalidateQueries([
            "feed",
            "SELF",
            session.user.name,
            "hidden",
          ]);
        }
      },
      onError: (err, update, context: any) => {
        queryClient.setQueriesData(["feed"], context.previousData);
      },
    }
  );

  

  const postCommentMutation = useMutation(
    ({ parent, textValue, postName }: any) => postComment(parent, textValue),
    {
      onSuccess: (data: any) => {
        console.log("COMMENT SUCCESS!", data);
        if (session?.user?.name) {
          queryClient.invalidateQueries([
            "feed",
            "SELF",
            session.user.name,
            "comments",
          ]);
        }

        if (data?.parent_id?.substring?.(0, 3) === "t3_") {
          // const pCommentsData = queryClient.getQueriesData(["thread",data?.parent_id?.substring?.(3)]);
          // let newCommentsData = pCommentsData.map(pComments => )
          queryClient.setQueriesData(
            ["thread", data?.parent_id?.substring?.(3)],
            (pCommentsData: any) => {
              console.log(pCommentsData);
              let newCommentsData = pCommentsData?.pages?.map((page: any) => {
                return {
                  ...page,
                  comments: [{ kind: "t1", data: data }, ...page.comments],
                };
              });
              return { ...pCommentsData, pages: newCommentsData };
            }
          );
        } else if (data?.parent_id?.substring?.(0, 3) === "t1_") {
      

          queryClient.setQueriesData(
            ["thread", data?.link_id?.substring?.(3)],
            (pCommentsData: any) => 
            {
              const editNestedComment = (comment, data, parent_id) => {
                if (comment.data.name === parent_id) {
                  comment["data"]["replies"]["data"]["children"] = [
                    { kind: "t1", data: data },
                    ...comment?.data?.replies?.data?.children,
                  ];
                  console.log("FOUND!", comment);
                }
                if (
                  comment.kind === "t1" &&
                  comment?.data?.replies?.data?.children?.length > 0
                ) {
                  for (
                    let i = 0;
                    i < comment.data.replies.data.children.length;
                    i++
                  ) {
                    comment.data.replies.data.children[i] = editNestedComment(
                      comment.data.replies.data.children[i],
                      data,
                      parent_id
                    );
                  }
                }
                console.log(comment);
                return comment;
              };

              let found = false;
              let newCommentsData = pCommentsData?.pages?.map((page: any) => {
                return {
                  ...page,
                  comments: page.comments.map((comment: any) => {
                    if (found) return comment;
                    if (comment?.data?.name === data.parent_id) {
                      comment["data"]["replies"]["data"]["children"] = [
                        { kind: "t1", data: data },
                        ...comment?.data?.replies?.data?.children,
                      ];
                      found = true;
                      console.log("FOUND2!", comment);

                      return comment;
                    }
                    if (comment?.data?.replies?.data?.children) {
                      return {
                        ...comment,

                        data: {
                          ...comment.data,
                          replies: {
                            ...comment.data.replies,
                            data: {
                              ...comment.data.replies.data,
                              children:
                                comment?.data?.replies?.data?.children?.map(
                                  (cComment) =>
                                    editNestedComment(
                                      cComment,
                                      data,
                                      data.parent_id
                                    )
                                ),
                            },
                          },
                        },
                      };
                    } else {
                      return comment;
                    }
                  }),
                };
              });
              console.log("NEWCOMENTS?", newCommentsData);
              return { ...pCommentsData, pages: newCommentsData };
            }
          );
          //queryClient.invalidateQueries(["thread",data?.link_id?.substring(3)]);
        }
      },
    }
  );

  const dummy = async () => "";
  const editNestedCommentProperty = (
    name,
    comment,
    property,
    value,
    found: boolean,
    updateChildren = false
  ) => {
    if (found) {
      return [comment, found];
    }
    if (comment?.data?.name && comment?.data?.name == name) {
      if (updateChildren){
        comment["data"]["replies"]["data"]["children"] =  [
          ...comment?.data?.replies?.data?.children?.filter(child => child.kind === "t1"),
          ...value,
        ]; 
      } else {
        comment["data"][property] = value;

      }
      console.log("FOUND!", comment);
      found = true;
    }
    if (
      comment.kind === "t1" &&
      comment?.data?.replies?.data?.children?.length > 0
    ) {
      for (let i = 0; i < comment.data.replies.data.children.length; i++) {
        let [c, f] = editNestedCommentProperty(
          name,
          comment.data.replies.data.children[i],
          property,
          value,
          found,
          updateChildren
        );
        found = f;
        comment.data.replies.data.children[i] = c;
      }
    }
    return [comment, found];
  };
  const updateCommentProperty = (pCommentsData, name, property, value, updateChildren = false) => {
    let found = false;
    let newCommentsData = pCommentsData?.pages?.map((page: any) => {
      return {
        ...page,
        comments: page.comments.map((comment: any) => {
          if (found) return comment;
          let [c, f] = editNestedCommentProperty(
            name,
            comment,
            property,
            value,
            found, 
            updateChildren
          );
          found = f;
          return c;
        }),
      };
    });
    console.log("NEWCOMENTS?", newCommentsData);
    return { ...pCommentsData, pages: newCommentsData };
  };
  const commentCollapse = useMutation(
    ({ name, thread, collapse }: any) => dummy(),
    {
      onMutate: async (update) => {
        queryClient.setQueriesData(
          ["thread", update.thread],
          (pCommentsData: any) =>
            updateCommentProperty(
              pCommentsData,
              update.name,
              "collapsed",
              update.collapse
            )
        );
      },
    }
  );

  const loadChildComments = async (
    parentName,
    children: any[],
    link_id,
    permalink,
    childcomments,
    token?
  ) => {
    console.log(
      "LOADING..",
      parentName,
      children,
      link_id,
      permalink,
      childcomments,
      token
    );

    const fixformat = async (comments) => {
      if (comments?.length > 0) {
        let basedepth = comments[0].data.depth;

        let idIndex = new Map();
        comments.forEach((comment) => {
          idIndex.set(`t1_${comment.data.id}`, comment);
        });
        await comments.forEach((comment, i) => {
          let c = idIndex.get(comment.data.parent_id);
          if (c && c.data.replies?.data?.children) {
            c.data.replies.data.children.push(comment);
          } else if (c) {
            c.data.replies = {
              kind: "Listing",
              data: {
                children: [comment],
              },
            };
          }
          c && idIndex.set(comment.data.parent_id, c);
        });

        let fixedcomments = [] as any[];
        idIndex.forEach((comment, i) => {
          if (comment?.data?.depth === basedepth) {
            fixedcomments.push(comment);
          } else {
          }
        });
        return fixedcomments;
      }
      return comments;
    };

    const filterExisting = (comments, childcomments) => {
      return comments.filter((comment: any) => {
        return !childcomments.find((cComment: any) => {
          return cComment?.kind === "more"
            ? false
            : cComment?.data?.name === comment?.data?.name;
        });
      });
    };

    let childrenstring = children.join();
    const data = await loadMoreComments(
      childrenstring,
      link_id,
      permalink,
      session ? true : false,
      token
    );
    console.log("LOADMOREDATA?", data);
    let morecomments = data?.data;
    let formatted;
    if (morecomments?.[0]?.data?.replies?.data?.children) {
      const filtered = filterExisting(
        morecomments?.[0]?.data?.replies?.data?.children,
        childcomments
      );
      formatted = filtered;
    } else {
      formatted = await fixformat(morecomments);
    }
    console.log("FORMATTED?", formatted, data?.token);
    return {
      link_id: link_id,
      parentName: parentName,
      newComments: formatted,
      newToken: data?.token,
    };
  };
  const loadCommentsMutation = useMutation(
    ({ parentName, children, link_id, permalink, childcomments, token }: any) =>
      loadChildComments(
        parentName,
        children,
        link_id,
        permalink,
        childcomments,
        token
      ),
    {
      onSuccess: (data) => {
        console.log("NEW COMMENTS", data);
        queryClient.setQueriesData(
          ["thread", data?.link_id?.substring(3)],
          (pCommentsData: any) =>
            updateCommentProperty(
              pCommentsData,
              data.parentName,
              "",
              data.newComments,
              true
            )
        );
      },
    }
  );

  return {
    voteMutation,
    saveMutation,
    hideMutation,
    postCommentMutation,
    commentCollapse,
    loadCommentsMutation,
  };
};

export default useMutate;
