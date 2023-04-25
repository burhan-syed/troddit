import { useEffect, useState } from "react";
import { localRead, useMainContext } from "../MainContext";

interface Read {
  numComments: number | undefined;
  time: number | undefined;
}

export const useRead = (postID) => {
  const context: any = useMainContext();
  const [read, setRead] = useState<Read | false>();

  useEffect(() => {
    const checkRead = async () => {
      let read = (await localRead.getItem(postID)) as any;
      if (read) {
        context.addReadPost({ postId: postID, numComments: read?.numComments });
        setRead({ numComments: read?.numComments, time: read?.time });
      } else {
        setRead(false);
      }
    };
    checkRead();
  }, [postID]);
  useEffect(() => {
    const readData = context?.readPosts?.[postID];
    if (readData) {
      setRead({ numComments: readData?.numComments, time: readData?.time });
    } else {
      setRead(false);
    }
  }, [context.readPostsChange]);

  return { read };
};
