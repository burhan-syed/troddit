import { AiOutlineFire, AiOutlineRocket } from "react-icons/ai";
import { GrNew } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { RiBarChart2Line } from "react-icons/ri";
import { BsCircle, BsChevronDown } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
const SortMenu = () => {
  const [show, setShow] = useState(false);
  const [sort, setSort] = useState<any>("hot");
  const [range, setRange] = useState("day");

  const router = useRouter();
  useEffect(() => {
    //console.log(router.query);
    if (router.query?.slug?.[1] ?? false) setSort(router.query.slug[1]);
    if (router.query?.frontsort ?? false) setSort(router.query.frontsort);
    if (router?.query?.t ?? false) {
      console.log(router.query.t);
      setRange(router.query.t.toString());
    }
  }, [router.query]);

  const updateSort = (e, s) => {
    e.preventDefault();
    setSort(s);
    if (s !== "top") {
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
    }
  };

  const updateRange = (e, r) => {
    e.preventDefault();
    console.log(router.query);
    setRange(r);
    // if (
    //   (router.query?.slug?.[0] ?? false) &&
    //   (router.query?.slug?.[1] ?? false)
    // ) {
    //   router.push({
    //     pathname: "/r/[subs]/[sort]",
    //     query: {
    //       subs: router.query?.slug?.[0] ?? "",
    //       sort: router.query?.slug?.[1] ?? "",
    //       t: encodeURI(r),
    //     },
    //   });
    //}
    if (router.query?.slug?.[0] ?? false) {
      router.push({
        pathname: "/r/[subs]/top",
        query: {
          subs: router.query?.slug?.[0] ?? "",
          //sort: router.query?.slug?.[1] ?? "top",
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
    <div className="flex flex-row w-full h-full border border-blue-400">
      <div className="flex flex-col flex-grow">
        <div
          className="flex flex-row items-center justify-between flex-none h-full border border-red-300 rounded-sm"
          onClick={() => setShow((show) => !show)}
        >
          {sort === "best" ? (
            <div className="flex flex-row justify-between">
              <AiOutlineRocket className="flex-none w-6 h-6 mr-2" />
            </div>
          ) : (
            ""
          )}
          {sort === "hot" ? (
            <div>
              {" "}
              <AiOutlineFire /> <span> Hot </span>
            </div>
          ) : (
            ""
          )}
          {sort === "top" ? (
            <div>
              <RiBarChart2Line /> <span> Top </span>
            </div>
          ) : (
            ""
          )}
          {sort === "new" ? (
            <div>
              <BsCircle /> <span> New </span>
            </div>
          ) : (
            ""
          )}
          {sort === "rising" ? (
            <div>
              <IoMdTrendingUp /> <span> Rising </span>
            </div>
          ) : (
            ""
          )}
          <BsChevronDown />
        </div>

        <div
          className={
            "transform  hover:scale-100  transition duration-150 ease-in-out origin-top bg-white " +
            `${show ? "" : "hidden"}`
          }
        >
          <ul className="flex-col p-0 m-0 list-none">
            <li
              className="relative px-3 py-1 rounded-sm hover:bg-gray-100"
              onClick={(e) => updateSort(e, "best")}
            >
              <AiOutlineRocket /> <span> Best </span>
            </li>

            <li
              className="relative px-3 py-1 rounded-sm hover:bg-gray-100"
              onClick={(e) => updateSort(e, "hot")}
            >
              <AiOutlineFire /> <span> Hot </span>
            </li>
            <li
              className="relative px-3 py-1 rounded-sm hover:bg-gray-100 group"
              onClick={(e) => updateSort(e, "top")}
            >
              <span className="">
                <RiBarChart2Line /> Top
              </span>

              <ul className="absolute top-0 hidden w-20 bg-white -left-20 group-hover:block">
                <li
                  className={range === "hour" ? `font-bold` : "" + ""}
                  onClick={(e) => updateRange(e, "hour")}
                >
                  Now
                </li>
                <li
                  className={range === "day" ? `font-bold` : "" + ""}
                  onClick={(e) => updateRange(e, "day")}
                >
                  Today
                </li>
                <li
                  className={range === "week" ? `font-bold` : ""}
                  onClick={(e) => updateRange(e, "week")}
                >
                  Week
                </li>
                <li
                  className={range === "month" ? `font-bold` : ""}
                  onClick={(e) => updateRange(e, "month")}
                >
                  Month
                </li>
                <li
                  className={range === "year" ? `font-bold` : ""}
                  onClick={(e) => updateRange(e, "year")}
                >
                  Year
                </li>
                <li
                  className={range === "all" ? `font-bold` : ""}
                  onClick={(e) => updateRange(e, "all")}
                >
                  All
                </li>
              </ul>
            </li>

            <li onClick={(e) => updateSort(e, "new")}>
              <BsCircle /> <span> New </span>
            </li>
            <li onClick={(e) => updateSort(e, "rising")}>
              <IoMdTrendingUp /> <span> Rising </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SortMenu;
