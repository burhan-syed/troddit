import { useEffect, useState } from "react";
import { localRead, useMainContext } from "../MainContext";

export const useRead = (postID) => {
  const context: any = useMainContext(); 
  const [read, setRead] = useState(false); 
  const [readCount, setReadCount] = useState<number>(); 

  useEffect(() => {
    const checkRead = async () => {
      let read = await localRead.getItem(postID) as any;
      if (read) {
        context.addReadPost({postId: postID, numComments: read?.numComments});
        setRead(true);
        read?.numComments && setReadCount(read?.numComments)
      }
    };
    checkRead();
  }, []);
  useEffect(() => {
    const readData = context?.readPosts?.[postID];
    setRead(!!readData);
    (context?.readPosts?.[postID]?.numComments || context?.readPosts?.[postID]?.numComments === 0) ? setReadCount(context?.readPosts?.[postID]?.numComments) : setReadCount(undefined); 
  }, [context.readPostsChange])

  return {read, readCount}
}