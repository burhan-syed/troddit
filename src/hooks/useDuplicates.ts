import React, { useState } from "react";
import {useTAuth} from "../PremiumAuthContext"; 
import { useMainContext } from "../MainContext";
import { useSession } from "next-auth/react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { findDuplicates } from "../RedditAPI";
import { findMediaInfo } from "../../lib/utils";

const useDuplicates = ({ enabled, permalink }) => {
  const {premium} = useTAuth(); 
  const { data: session, status } = useSession();
  const context: any = useMainContext();
  const loading = status === "loading";
  // const [totalDuplicates, setTotalDuplicates] = useState(0);
  const fetchDuplicates = async (fetchParams) => {
    const feedParams = {
      loggedIn: status === "authenticated" ? true : false,
      after: fetchParams.pageParam?.after ?? "",
      count: fetchParams.pageParam?.count ?? 0,
    };
    const res = await findDuplicates({
      permalink: permalink, 
      after: feedParams.after, 
      count: feedParams.count, 
      loggedIn: feedParams.loggedIn, 
      token: context.token, 
      isPremium: premium?.isPremium
    }); 
    const data = res?.res?.[1]?.data;
    const totalDuplicates =
      res?.res?.[0]?.data?.children?.[0]?.data?.num_duplicates;
    // console.log("DATA?", data);
    const postsWithMedia = new Array(data?.children?.length);
    await Promise.all(
      data?.children?.map(async (c, i) => {
        //const mInfo = await findMediaInfo(c.data);
        postsWithMedia[i] = {
          ...c,
          data: {
            ...c.data,
            //mediaInfo: mInfo,
            num_duplicates: totalDuplicates,
          },
        };
      })
    );
    return {
      posts: postsWithMedia,
      after: data?.after,
      count: data?.children?.length,
    };
  };
  const duplicateQuery = useInfiniteQuery(
    ["duplicates", permalink],
    fetchDuplicates,
    {
      enabled: !!enabled && !!permalink,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: Infinity,
      // cacheTime: Infinity,
      getNextPageParam: (lastPage) => {
        //console.log('lastPage?ß', lastPage)
        if (lastPage.after || lastPage.after === "") {
          return {
            after: lastPage?.after ?? "",
            count: lastPage?.count ?? 0,
          };
        }
        return undefined;
      },
      // setting initial data directly in fetchFeed() instead
      // initialData: () => {
      //   return formatInitialData();
      // },
    }
  );
  const flatPosts = duplicateQuery.data?.pages?.map((p) => p?.posts)?.flat();
  return {
    flatPosts,
    duplicateQuery,
    totalDuplicates: flatPosts?.[0]?.data?.num_duplicates,
  };
};

export default useDuplicates;
