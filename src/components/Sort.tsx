import { useState, useEffect } from "react";

import SortRange from "./SortRange";
import link from "next/link";
import { useRouter } from "next/router";

const Sort = () => {
  const [sort, setSort] = useState<any>("");
  const router = useRouter();
  useEffect(() => {
    //console.log(router.query);
    if (router.query?.slug?.[1] ?? false) setSort(router.query.slug[1]);
    if (router.query?.frontsort ?? false) setSort(router.query.frontsort);
  }, [router.query]);

  const updateSort = (e, s) => {
    e.preventDefault();
    setSort(s);
    console.log(`r/${router.query}/${s}`);

    if (router.query?.slug?.[0] ?? false) {
      router.push({
        pathname: "/r/[subs]/[sort]",
        query: {
          subs: router.query?.slug?.[0] ?? "",
          sort: s,
        },
      });
    } else {
      router.push({
        pathname: "/[sort]",
        query: { sort: s },
      });
    }

    //router.push('/r/[subs]/[sort]', `${router.query?.slug?.[0] ?? ""}/${s}`)
  };
  return (
    <div>
      <button onClick={(e) => updateSort(e, "best")}>Best</button>
      <button onClick={(e) => updateSort(e, "hot")}>Hot</button>
      <button onClick={(e) => updateSort(e, "new")}>New</button>
      <button onClick={(e) => updateSort(e, "top")}>Top</button>
      <button onClick={(e) => updateSort(e, "rising")}>Rising</button>
      {sort == "top" ? <SortRange /> : ""}
    </div>
  );
};

export default Sort;
