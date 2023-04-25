import { useQueryClient } from "@tanstack/react-query";

const useGlobalState = (globalKey: string[], cacheTime=Infinity) => {
  const queryClient = useQueryClient();

  const getGlobalData = () =>
    queryClient.getQueryData(globalKey) as Map<any, any>;
  const setGlobalData = (key, value) => {
    createGlobalState();
    queryClient.setQueryData(globalKey, (prev: undefined | Map<any, any>) => {
      if (prev === undefined) {
        let m = new Map();
        m.set(key, value);
        return m;
      }
      return prev.set(key, value);
    });
  };
  const createGlobalState = () => {
    const prev = getGlobalData();
    if (prev === undefined) {
      queryClient.fetchQuery(globalKey, () => new Map(), {
        staleTime: 0,
        cacheTime: cacheTime,
      });
    }
  };
  const clearGlobalState = () => {
    queryClient.fetchQuery(globalKey, () => new Map(), {
      staleTime: 0,
      cacheTime: cacheTime,
    });
  };
  const getGlobalKey = () => {
    return globalKey;
  };

  createGlobalState();

  return {
    createGlobalState,
    clearGlobalState,
    getGlobalData,
    setGlobalData,
    getGlobalKey,
  };
};

export default useGlobalState;