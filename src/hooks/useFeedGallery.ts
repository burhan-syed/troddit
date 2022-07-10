import React, { useMemo, useState } from 'react'
import { useQueryClient } from 'react-query';

const useFeedGallery = () => {
  const queryClient = useQueryClient();

  const setFeedData = (items) => {
    queryClient.setQueryData(["feedGallery"], () => (items) ); 
  }
  const getFeedData = () => queryClient.getQueriesData(["feedGallery"])?.[0]?.[1]
 

  return {
    setFeedData, 
    getFeedData,
  }
}

export default useFeedGallery