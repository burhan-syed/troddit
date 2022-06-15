import { useEffect, useState } from "react";
import { localRead, useMainContext } from "../MainContext";

export const useRead = (postID) => {
  const context: any = useMainContext(); 
  const [read, setRead] = useState(false); 

  useEffect(() => {
    const checkRead = async () => {
      let read = await localRead.getItem(postID);
      if (read) {
        context.addReadPost(postID);
        setRead(true);
      }
    };
    checkRead();
  }, []);
  useEffect(() => {
    setRead(!!context?.readPosts?.[postID])
  }, [context.readPostsChange])

  return {read}
}