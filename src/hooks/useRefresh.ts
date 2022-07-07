import React from "react";
import { useQueryClient } from "react-query";
import { useMainContext } from "../MainContext";

const useRefresh = () => {
  const queryClient = useQueryClient();
  const context: any = useMainContext();

  const invalidateAll = () => {
    queryClient.invalidateQueries();
    context.setProgressKey((p) => p + 1);
  };
  const invalidateKey = (key: string[], updateFeedKey=false) => {
    queryClient.invalidateQueries(key);
    updateFeedKey && context.setProgressKey((p) => p + 1);
  };
  return {
    invalidateAll,
    invalidateKey,
  };
};

export default useRefresh;
