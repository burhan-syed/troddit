import { AiOutlineFire, AiOutlineRocket } from "react-icons/ai";
import { GrNew } from "react-icons/gr";
import { IoMdTrendingUp } from "react-icons/io";
import { RiBarChart2Line } from "react-icons/ri";
import { BsCircle, BsChevronDown } from "react-icons/bs";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
const SortMenu = ({ hide }) => {
  const [show, setShow] = useState(false);
  const [sort, setSort] = useState<any>("hot");
  const [range, setRange] = useState("");

  const router = useRouter();
  useEffect(() => {
    //console.log(router.query);
    if (router.query?.slug?.[1] ?? false) setSort(router.query.slug[1]);
    if (router.query?.frontsort ?? false) setSort(router.query.frontsort);
    if (router?.query?.t ?? false) {
      //console.log(router.query.t);
      setRange(router.query.t.toString());
    }
    return () => {
      setSort("hot");
    }
  }, [router.query]);

  const updateSort = (e, s) => {
    e.preventDefault();
    setSort(s);
    if (s !== "top") {
      //console.log(`r/${router?.query ?? "popular"}/${s}`);

      if (router.query?.slug?.[0] ?? false) {
        router.push(`/r/${router.query?.slug?.[0] ?? "popular"}/${s}`);
      } else {
        router.push(`/${s}`);
      }
    }
  };

  const updateRange = (e, r) => {
    e.preventDefault();
    //console.log(router.query);
    setRange(r);
    if (router.query?.slug?.[0] ?? false) {
      router.push(
        `/r/${router.query?.slug?.[0] ?? "popular"}/top/?t=${encodeURI(r)}`
      );
    } else if (router.query.frontsort) {
      router.push({
        pathname: "/top",
        query: {
          //frontsort: router.query.frontsort,
          t: encodeURI(r),
        },
      });
    } else {
      router.push({
        pathname: "/top",
        query: {
          //sort: router.query?.slug?.[1] ?? "",
          t: encodeURI(r),
        },
      });
    }
  };

  return (
    <div className="flex flex-row w-full h-full select-none hover:cursor-pointer">
      {/* Close when clicking outisde element */}
      {/* <div
        className={
          (show && !hide ? "" : "w-0 h-0") +
          "absolute  top-0 left-0 w-screen h-screen bg-transparent "
        }
        onClick={() => setShow((show) => !show)}
      ></div> */}

      <div className="flex flex-col flex-grow">
        {/* Button Label */}
        <div
          className="flex flex-row items-center justify-between flex-none h-full px-2 border border-lightBorder dark:border-darkBorder hover:border-lightBorderHighlight dark:hover:border-darkBorderHighlight"
          onClick={() => setShow((show) => !show)}
        >
          <BsChevronDown
            className={
              show
                ? "rotate-180"
                : "rotate-0" + "transform transition duration-200 "
            }
          />
          {sort === "best" ? (
            <div className="flex flex-row items-center justify-between">
              <AiOutlineRocket className="flex-none w-6 h-6 mr-1" />
            </div>
          ) : (
            ""
          )}
          {sort === "hot" ? (
            <div className="flex flex-row items-baseline justify-between">
              <AiOutlineFire className="flex-none w-6 h-6 mr-1" />
            </div>
          ) : (
            ""
          )}
          {sort === "" ? (
            <div className="flex flex-row items-baseline justify-between">
              <AiOutlineFire className="flex-none w-6 h-6 mr-1" />
            </div>
          ) : (
            ""
          )}
          {sort === "top" ? (
            <div className="flex flex-row items-baseline justify-between">
              <RiBarChart2Line className="flex-none w-6 h-6 mr-1" />
            </div>
          ) : (
            ""
          )}
          {sort === "new" ? (
            <div className="flex flex-row items-baseline justify-between">
              <BsCircle className="flex-none w-6 h-6 mr-1" />
            </div>
          ) : (
            ""
          )}
          {sort === "rising" ? (
            <div className="flex flex-row items-baseline justify-between">
              <IoMdTrendingUp className="flex-none w-6 h-6 mr-1" />
            </div>
          ) : (
            ""
          )}
        </div>

        {/* Dropdown */}
        <div
          className={
            "transform transition duration-150 ease-in-out origin-top bg-white dark:bg-darkBG " +
            `${show && !hide ? "scale-100 block" : " scale-0"}`
          }
        >
          {/* Dropdown Items */}
          <ul className="flex-col p-0 m-0 list-none">
            <li
              className={
                (sort === "best" ? "bg-gray-300" : "") +
                " relative flex flex-row items-center justify-between px-2 py-3 text-sm rounded-sm"
              }
              onClick={(e) => updateSort(e, "best")}
            >
              <AiOutlineRocket className="flex-none w-5 h-5" />{" "}
              <span> Best </span>
            </li>
            <li
              className="relative flex flex-row items-center justify-between px-2 py-3 text-sm rounded-sm hover:bg-gray-100"
              onClick={(e) => updateSort(e, "hot")}
            >
              <AiOutlineFire className="flex-none w-5 h-5" /> <span> Hot </span>
            </li>
            <li className="relative flex flex-row items-center justify-between px-2 py-3 text-sm rounded-sm group hover:bg-gray-100">
              <RiBarChart2Line className="flex-none w-5 h-5" />{" "}
              <span> Top </span>
              <ul className="absolute top-0 hidden w-20 -left-20 group-hover:block">
                <li
                  className={
                    (range === "hour" ? `font-bold` : "") +
                    " px-2 py-3 text-sm hover:bg-gray-100"
                  }
                  onClick={(e) => updateRange(e, "hour")}
                >
                  Now
                </li>
                <li
                  className={
                    (range === "day" ? `font-bold` : "") +
                    " px-2 py-3 text-sm hover:bg-gray-100"
                  }
                  onClick={(e) => updateRange(e, "day")}
                >
                  Today
                </li>
                <li
                  className={
                    (range === "week" ? `font-bold` : "") +
                    " px-2 py-3 text-sm hover:bg-gray-100"
                  }
                  onClick={(e) => updateRange(e, "week")}
                >
                  Week
                </li>
                <li
                  className={
                    (range === "month" ? `font-bold` : "") +
                    " px-2 py-3 text-sm hover:bg-gray-100"
                  }
                  onClick={(e) => updateRange(e, "month")}
                >
                  Month
                </li>
                <li
                  className={
                    (range === "year" ? `font-bold` : "") +
                    " px-2 py-3 text-sm hover:bg-gray-100"
                  }
                  onClick={(e) => updateRange(e, "year")}
                >
                  Year
                </li>
                <li
                  className={
                    (range === "all" ? `font-bold` : "") +
                    " px-2 py-3 text-sm hover:bg-gray-100"
                  }
                  onClick={(e) => updateRange(e, "all")}
                >
                  All
                </li>
              </ul>
            </li>

            <li
              className="relative flex flex-row items-center justify-between px-2 py-3 text-sm rounded-sm hover:bg-gray-100"
              onClick={(e) => updateSort(e, "rising")}
            >
              <IoMdTrendingUp className="flex-none w-5 h-5" />{" "}
              <span> Rising </span>
            </li>
            <li
              className="relative flex flex-row items-center justify-between px-2 py-3 text-sm rounded-sm hover:bg-gray-100"
              onClick={(e) => updateSort(e, "new")}
            >
              <BsCircle className="flex-none w-5 h-5" /> <span> New </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SortMenu;
