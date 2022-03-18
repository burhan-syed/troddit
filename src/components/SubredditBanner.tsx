import SubInfoModal from "./SubInfoModal";

import { useState, useEffect } from "react";
import { useSubsContext } from "../MySubs";
import router, { useRouter } from "next/router";
import SubPills from "./SubPills";
import SubCard from "./views/SubCard";
import Link from "next/link";
import ToggleUserPostType from "./ToggleUserPostType";

const SubredditBanner = ({
  subreddits,
  userMode,
  userPostMode = "",
  name = "",
  isSelf = false,
}) => {
  const router = useRouter();
  const subsContext: any = useSubsContext();
  const { currSubInfo, loadCurrSubInfo, multi } = subsContext;
  const [currSubData, setCurrSubData] = useState<any>({});
  const [subreddit, setSubreddit] = useState("");
  const [multiSub, setMultiSub] = useState("");
  const [currMulti, setCurrMulti] = useState("");
  const [subArray, setSubArray] = useState([]);
  const [keepInMultiArray, setKeepInMultiArray] = useState(false);

  const [openDescription, setOpenDescription] = useState(0);

  useEffect(() => {
    setCurrSubData(currSubInfo?.data?.subreddit ?? currSubInfo?.data);
  }, [currSubInfo]);

  //entry point
  useEffect(() => {
    let s = subreddits.sort((a, b) => {
      let aUpper = a.toUpperCase();
      let bUpper = b.toUpperCase();
      if (aUpper < bUpper) return -1;
      if (aUpper > bUpper) return 1;
      return 0;
    });
    setSubreddit(s?.[0]);
    if (
      !keepInMultiArray ||
      subreddits?.length > 1 ||
      subreddits?.[0].toUpperCase() !== multiSub.toUpperCase()
    ) {
      setSubArray(s);
      setCurrMulti(multi);
      setKeepInMultiArray(false);
    }
  }, [subreddits]);

  useEffect(() => {
    if (multi) {
      setCurrMulti(multi);
    } else {
      setCurrMulti("");
    }
  }, [multi]);

  const goToMulti = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setMultiSub("");
    router.push(`${subArray.join("+")}${currMulti ? `?m=${currMulti}` : ""}`);
  };

  const goToMultiSub = (e, s) => {
    e.preventDefault();
    e.stopPropagation();
    setMultiSub(s);
    setKeepInMultiArray(true);
    //console.log(router);
    let query = [];
    for (let q in router.query) {
      if (q !== "slug") {
        query.push(`${q}=${router.query[q]}`);
      }
    }
    if (router.route === "/r/[...slug]") {
      router.push(s + (query?.length > 0 ? `?${query.join("&")}` : ""));
    } else {
      router.push(`/r/${s}`, `/r/${s}`);
    }
  };

  const removeSub = (s) => {
    if (router.route === "/r/[...slug]") {
      let curr: string = router.query.slug[0];
      let currsubs = curr.split("+");
      let filtered = currsubs.filter(
        (c) => c.toUpperCase() !== s.toUpperCase()
      );
      let filteredSubAry = subArray.filter(
        (c) => c.toUpperCase() !== s.toUpperCase()
      );
      setSubArray((c) =>
        c.filter((sub) => sub.toUpperCase() !== s.toUpperCase())
      );
      //console.log(currsubs);
      if (filtered.length > 1) {
        router.push(`/r/${filtered.join("+")}`);
      } else if (filteredSubAry.length > 0) {
        router.push(`/r/${filteredSubAry.join("+")}`);
      } else {
        router.push("/");
      }
    }
  };

  const toggleOpenDescription = () => {
    setOpenDescription((p) => p + 1);
  };

  return (
    <div
      className={
        "w-full h-full -mt-2 relative  " +
        (subArray.length === 1 && multi === ""
          ? " mb-2  md:mb-4 lg:mb-6"
          : " space-y-2 mb-2 md:space-y-3 md:mb-3  ")
      }
    >
      <SubInfoModal
        toOpen={openDescription}
        descriptionHTML={currSubData?.description_html}
        displayName={currSubData?.display_name_prefixed}
      />
      <SubCard
        data={currSubInfo}
        link={false}
        tall={true}
        subInfo={currSubData}
        currMulti={currMulti}
        subArray={subArray}
        openDescription={toggleOpenDescription}
        selfProfile={name}
      />

      {name && (
        <div className="flex flex-row w-full mt-2 md:-mb-5 md:justify-center">
          <div className="flex flex-row flex-wrap gap-4 mx-2 text-xl md:w-11/12">
            <Link href={`/u/${name}/overview`}>
              <a>
                <div
                  className={
                    " cursor-pointer font-bold" +
                    ((userPostMode === "" ||  userPostMode === "OVERVIEW")
                      ? " font-bold  "
                      : " opacity-50 hover:opacity-70")
                  }
                >
                  Overview
                </div>
              </a>
            </Link>
            <Link href={`/u/${name}/submitted`}>
              <a>
                <div
                  className={
                    " cursor-pointer font-bold" +
                    (userPostMode === "SUBMITTED"
                      ? " font-bold  "
                      : " opacity-50 hover:opacity-70")
                  }
                >
                  Posts
                </div>
              </a>
            </Link>
            <Link href={`/u/${name}/comments`}>
              <a>
                <div
                  className={
                    " cursor-pointer font-bold" +
                    (userPostMode === "COMMENTS"
                      ? " font-bold  "
                      : " opacity-50 hover:opacity-70")
                  }
                >
                  Comments
                </div>
              </a>
            </Link>
            {isSelf && (
              <>
                <Link href={`/u/${name}/upvoted`}>
                  <a>
                    <div
                      className={
                        " cursor-pointer font-bold" +
                        (userPostMode === "UPVOTED"
                          ? " font-bold  "
                          : " opacity-50 hover:opacity-70")
                      }
                    >
                      Upvoted
                    </div>
                  </a>
                </Link>
                <Link href={`/u/${name}/downvoted`}>
                  <a>
                    <div
                      className={
                        " cursor-pointer font-bold" +
                        (userPostMode === "DOWNVOTED"
                          ? " font-bold  "
                          : " opacity-50 hover:opacity-70")
                      }
                    >
                      Downvoted
                    </div>
                  </a>
                </Link>
                <Link href={`/u/${name}/saved`}>
                  <a>
                    <div
                      className={
                        " cursor-pointer font-bold" +
                        (userPostMode === "SAVED"
                          ? " font-bold  "
                          : " opacity-50 hover:opacity-70")
                      }
                    >
                      Saved
                    </div>
                  </a>
                </Link>{" "}
              </>
            )}
                      {userPostMode === "SAVED" && <div className="ml-auto text-sm"><ToggleUserPostType /></div>}

          </div>
        </div>
      )}

      {(multi || subArray.length > 1 || currMulti) &&
        !currSubInfo?.data?.subreddit && (
          <div className={"mx-auto  md:w-11/12"}>
            <SubPills
              subArray={subArray}
              currMulti={currMulti}
              multiSub={multiSub}
              goToMulti={goToMulti}
              goToMultiSub={goToMultiSub}
              removeSub={removeSub}
            />
          </div>
        )}
    </div>
  );
};

export default SubredditBanner;
