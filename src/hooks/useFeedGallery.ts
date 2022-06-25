import React, { useMemo } from 'react'
import { useQueryClient } from 'react-query';

const useFeedGallery = (curKey) => {
  const queryClient = useQueryClient();

 
  const curFeed:any = queryClient.getQueryData(curKey);
  const flattenedPosts = useMemo(() => {
    console.log("FLATTENING");
    const flattened = curFeed?.pages?.map(page => page?.filtered)?.flat();
    return flattened; 
  }, [curFeed])

  return {
    flattenedPosts, 
  }
}

export default useFeedGallery