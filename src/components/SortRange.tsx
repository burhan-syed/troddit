import { useRouter } from "next/router";
import { useState } from "react";

const SortRange = () => {
  const [range, setRange] = useState("day");
  const router = useRouter();
  const updateRange = (e, r) => {
    e.preventDefault();
    console.log(router.query);
    setRange(r);
    if (router.query?.slug?.[0] ?? false) {
      router.push({
        pathname: "/r/[subs]/[sort]",
        query: {
          subs: router.query?.slug?.[0] ?? "",
          sort: router.query?.slug?.[1] ?? "",
          t: encodeURI(r),
        },
      });
    } else if (router.query.frontsort) {
      router.push({
        pathname: "/[frontsort]",
        query: {
          frontsort: router.query.frontsort,
          t: encodeURI(r),
        },
      });
    } else {
      router.push({
        pathname: "/[sort]",
        query: { sort: router.query?.slug?.[1] ?? "", t: encodeURI(r) },
      });
    }
  };
  return (
    <div>
      <ul>
        <li onClick={(e) => updateRange(e, "hour")}>Now</li>
        <li onClick={(e) => updateRange(e, "day")}>Today</li>
        <li onClick={(e) => updateRange(e, "week")}>Week</li>
        <li onClick={(e) => updateRange(e, "month")}>Month</li>
        <li onClick={(e) => updateRange(e, "year")}>Year</li>
        <li onClick={(e) => updateRange(e, "all")}>All</li>
      </ul>
    </div>
  );
};

export default SortRange;
