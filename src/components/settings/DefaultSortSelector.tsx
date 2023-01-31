import { COMMENT_SORTS } from "../CommentSort";
import { useMainContext } from "../../MainContext";
import React, { useEffect, useState } from "react";
import SimpleDropDownSelector from "../ui/SimpleDropDownSelector";


const DefaultSortSelector = ({ mode }: { mode: "comments" | "posts" }) => {
  const context: any = useMainContext();

  let SORTS, sort, setSort;

  if (mode === "posts") {
    throw Error("Not implemented");
    /* TODO: Implement default post sort order
    SORTS = POST_SORTS;
    sort = context.defaultSortPosts;
    setSort = context.setDefaultSortPosts.bind(context);
    */
  } else {
    SORTS = COMMENT_SORTS;
    sort = context.defaultSortComments;
    setSort = context.setDefaultSortComments.bind(context);
  }

  let sortFriendlyName = SORTS[sort];

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return (
    <>
      <SimpleDropDownSelector
        buttonName={
          mode === "comments"
            ? "Default Comment Sorting"
            : "Default Post Sorting"
        }
        items={SORTS}
        selected={mounted ? sortFriendlyName : ""}
        onSelect={setSort}
      />
    </>
  );
};

export default DefaultSortSelector;
