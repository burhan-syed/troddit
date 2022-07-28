import React from "react";
import { useQueryClient } from "react-query";

interface UseHeightMap {
  windowWidth: number;
  cardStyle: string;
  columns: number;
  mediaOnly: boolean;
  wideUI: boolean;
  compactLinkPics: boolean;
}

const useHeightMap = (args: UseHeightMap) => {
  const { windowWidth, cardStyle, columns, mediaOnly, wideUI, compactLinkPics } = args;
  const card = cardStyle === "default" ? "card1" : cardStyle
  const queryKeyHeights = ["heightMap", columns, card, mediaOnly, wideUI, windowWidth, compactLinkPics];
  const queryKeySeen = ["seenMap", columns, card, mediaOnly, wideUI, windowWidth, compactLinkPics];

  const queryClient = useQueryClient();

  const createMaps = () => {
    queryClient.fetchQuery(
      queryKeyHeights,
      () => ({ heightMap: new Map()}),
      { staleTime: Infinity, cacheTime: Infinity }
    );
    queryClient.fetchQuery(
      queryKeySeen,
      () => ({ seenMap: new Map()}),
      { staleTime: Infinity, cacheTime: Infinity }
    );
  };

  const setHeight = (key, value) => {
    queryClient.setQueryData(queryKeyHeights, (pData: any) => {
      if (!pData) {
        let heightMap = new Map();
        heightMap.set(key, value);
        return {heightMap: heightMap};
      } else {
        pData?.heightMap?.set(key,value); 
        return pData; 
      }
    });
  };
  const setSeen = (key, value) => {
    queryClient.setQueryData(queryKeySeen, (pData: any) => {
      if (!pData) {
        let seenMap = new Map();
        seenMap.set(key, value);
        return {seenMap: seenMap};
      } else {
        pData?.seenMap?.set(key,value); 
        return pData; 
      }
    });
  }
  const getHeights = () => {
    const heights = queryClient.getQueryData(queryKeyHeights) as any; 
    return heights?.heightMap; 
  }
  const getSeen = () => {
    const seen = queryClient.getQueryData(queryKeySeen) as any; 
    return seen?.seenMap; 
  }

  return {
    createMaps,
    setHeight,
    setSeen, 
    getHeights, 
    getSeen, 
  };
};

export default useHeightMap;
