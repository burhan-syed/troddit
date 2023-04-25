// import React from "react";
import { useQueryClient } from "@tanstack/react-query";

interface UseHeightMap {
  columnWidth: number;
  cardStyle: string;
  mediaOnly: boolean;
  compactLinkPics: boolean;
  uniformMediaMode: boolean;
  windowHeight: number;
}

const useHeightMap = (args: UseHeightMap) => {
  const {
    columnWidth,
    cardStyle,
    mediaOnly,
    compactLinkPics,
    uniformMediaMode,
    windowHeight,
  } = args;
  const card = cardStyle === "default" ? "card1" : cardStyle;
  const queryKeyHeights = [
    "heightMap",
    columnWidth,
    card,
    mediaOnly,
    compactLinkPics,
    uniformMediaMode,
    windowHeight,
  ];

  const queryClient = useQueryClient();

  //todo: persist heightmaps outside of memory
  /* const checkAndClearLargeStorage = () => {
    const MAXSTORE = 250_000_000; //~256mb
    const savedMaps = localStorage.getItem("heightMaps");
    if (savedMaps?.length && savedMaps.length >= MAXSTORE) {
      localStorage.setItem("heightMaps", "");
    }
  };
  const getAllSavedHeightMaps = (stringify = false) => {
    const savedMaps = localStorage.getItem("heightMaps") ?? "";
    const prevMap = savedMaps
      ? new Map<string, string>(JSON.parse(savedMaps))
      : new Map();
    if (stringify) {
      return prevMap;
    }
    const parsedMap = new Map<string, Map<any, any>>();
    if (prevMap) {
      prevMap.forEach((v, k) => {
        const parsedValues = new Map(JSON.parse(v as string));
        parsedMap.set(k, parsedValues);
      });
    }
    return parsedMap;
  };

  const restoreSavedHeightMap = () => {
    const parsedMap = getAllSavedHeightMaps();
    return parsedMap.get(queryKeyHeights.join("|")) ?? new Map();
  };

  const saveMapToLocalStorage = (heightMap: Map<any, any>) => {
    const key = queryKeyHeights.join("|");
    const map = getAllSavedHeightMaps(true);
    map.set(key, JSON.stringify(Array.from(heightMap.entries())));
    localStorage.setItem(
      "heightMaps",
      JSON.stringify(Array.from(map.entries()))
    );
    checkAndClearLargeStorage();
  }; */

  const getHeights = () => {
    const heights = queryClient.getQueryData(queryKeyHeights) as any;
    return heights;
  };

  const createMaps = () => {
    queryClient.fetchQuery(queryKeyHeights, () => new Map<string, number>(), {
      staleTime: Infinity,
      cacheTime: Infinity,
    });
  };

  const setHeight = (key, value) => {
    const p = getHeights();
    if (!p) {
      createMaps(); 
    }
    queryClient.setQueryData(
      queryKeyHeights,
      (pData: Map<string, number> | undefined) => {
        if (!pData) {
          let heightMap = new Map(); //restoreSavedHeightMap();
          heightMap.set(key, value);
          return heightMap; //{ heightMap: heightMap };
        } else {
          pData?.set(key, value);
          // if (pData.size % 25 === 0) {
          //   saveMapToLocalStorage(pData);
          // }
          return pData;
        }
      }
    );
  };

  return {
    setHeight,
    getHeights,
  };
};

export default useHeightMap;
