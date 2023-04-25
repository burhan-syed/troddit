import React, { useMemo, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query';

const useFeedGallery = () => {
  const queryClient = useQueryClient();

  const setFeedData = (items) => {
    queryClient.setQueriesData(["feedGallery"], () => (items))
    queryClient.fetchQuery(["feedGallery"], () => (items), {staleTime: 0, cacheTime: Infinity} ); 
  }
  const getFeedData = () => queryClient.getQueriesData(["feedGallery"])?.[0]?.[1]
 

  return {
    setFeedData, 
    getFeedData,
  }
}

export default useFeedGallery