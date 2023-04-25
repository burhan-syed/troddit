import React from "react";
import { useQueryClient, useIsFetching } from "@tanstack/react-query";
import { useMainContext } from "../MainContext";
import useLocation from "./useLocation";

const useRefresh = () => {
  const queryClient = useQueryClient();
  const context: any = useMainContext();
  const {key,
    ready} = useLocation();
  const invalidateAll = () => {
    queryClient.invalidateQueries();
    context.setProgressKey((p) => p + 1);
  };
  const invalidateKey = (key: string[], updateFeedKey=false) => {
    queryClient.invalidateQueries(key);
    updateFeedKey && context.setProgressKey((p) => p + 1);
  };
  const refreshCurrent = () => {
    queryClient.refetchQueries(key)
  }
  const fetchingCount = useIsFetching(key);
  
  return {
    invalidateAll,
    invalidateKey,
    refreshCurrent,
    fetchingCount
  };
};

export default useRefresh;
