import SubInfoModal from "./SubInfoModal";

import React,{ useState, useEffect } from "react";
import { useSubsContext } from "../MySubs";
import router, { useRouter } from "next/router";
import SubPills from "./SubPills";
import SubCard from "./cards/SubCard";
import Link from "next/link";
import Collection from "./collections/Collection";
import { useSession } from "next-auth/react";
import Toggles from "./settings/Toggles";

const SubredditBanner = ({
  subreddits,
  userMode,
  userPostMode = "",
  name = "",
  isSelf = false,
}) => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const subsContext: any = useSubsContext();
  const { currSubInfo, multi, myMultis, myLocalMultis, loadedSubs } = subsContext;
  const [currSubData, setCurrSubData] = useState<any>({});
  const [subreddit, setSubreddit] = useState("");
  const [multiSub, setMultiSub] = useState("");
  const [currMulti, setCurrMulti] = useState("");
  const [subArray, setSubArray] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [keepInMultiArray, setKeepInMultiArray] = useState(false);

  const [openDescription, setOpenDescription] = useState(0);
  useEffect(() => {
    setMounted(true);
  }, []);

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
      setMultiSub("")
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

  const [myMultiInfo, setMyMultiInfo] = useState<any>();

  useEffect(() => {
    const matchMulti = (myMulti, currSubs, currMulti) => {
      if (myMulti?.data?.name?.toUpperCase() !== currMulti?.toUpperCase())
        return false;
      if (myMulti?.data?.subreddits?.length !== currSubs?.length) return false;

      const multiSubs: string[] = myMulti?.data?.subreddits?.map((sub) =>
        sub?.name?.toUpperCase()
      );

      let allFound = true;
      for (let multiSub of multiSubs) {
        if (!currSubs.includes(multiSub)) {
          allFound = false;
          break;
        }
      }
      if (allFound) {
        setMyMultiInfo(myMulti);
        return myMulti;
      }
      return false;
    };

    const checkIsMyMulti = (currSubs, currMulti) => {
      let matched = [false, {}] as [boolean, any];
      if (myMultis && session) {
        for (let myMulti of myMultis) {
          matched = matchMulti(myMulti, currSubs, currMulti);
          if (matched) return [true, matched];
        }
      } else if (myLocalMultis) {
        for (let myMulti of myLocalMultis) {
          matched = matchMulti(myMulti, currSubs, currMulti);
          if (matched) return [true, matched];
        }
      }
      return matched;
    };

    if (!loading && subreddits && multi && loadedSubs) {
      const currSubs: string[] = multiSub
        ? subArray?.map((s) => s?.toUpperCase())
        : subreddits?.map((s) => s?.toUpperCase());
      let matched = checkIsMyMulti(currSubs, multi);
      if ((!matched || matched?.[0] === false) && !multi || multi==="Feed") {setMyMultiInfo(undefined)}
      // if (
      //   router?.query?.m &&
      //   router?.query?.m?.toString()?.toUpperCase() !==
      //     matched?.[1]?.data?.name?.toUpperCase()
      // ) {
      //   console.log("MISMATCH!");
      //   //router.push(`${subreddits.join("+")}`);
      // }
    }
    // return () => {
    //   setMyMultiInfo(undefined);
    // };
  }, [subreddits, multi, myMultis, myLocalMultis, loading, loadedSubs]);

  //kick out of multi if the multi is changed..
  useEffect(() => {if (mounted && myMultiInfo && router.query?.m){
        router.push(`${subreddits.join("+")}`);
  }}, [myMultis, myLocalMultis]);


  return (
    <div
      className={
        "w-full h-full  relative  " +
        (subArray.length === 1 && multi === "" && !name
          ? " mb-2  md:mb-4 lg:mb-6 "
          : " space-y-2 mb-2 md:space-y-3 md:mb-3  ")
      }
    >
      <SubInfoModal
        toOpen={openDescription}
        descriptionHTML={currSubData?.description_html}
        displayName={currSubData?.display_name_prefixed}
      />
      {subreddits.length >1 && router.pathname === "/r/[...slug]" ? (
        <Collection
          subreddits={subArray}
          collapsed={true}
          name={myMultiInfo?.data?.display_name ?? currMulti}
          icon={myMultiInfo?.data?.icon_url}
          over_18={myMultiInfo?.data?.over_18}
          key_color={myMultiInfo?.data?.key_color}
          isOwner={router?.query?.m && (myMultiInfo?.data?.name?.toUpperCase() == router?.query?.m?.toString()?.toUpperCase())}
          bannerMode={true}
          goToMultiSub={goToMultiSub}
        />
      ) : (
        <SubCard
          data={currSubInfo}
          link={false}
          tall={true}
          subInfo={currSubData}
          currMulti={currMulti}
          subArray={subArray}
          openDescription={toggleOpenDescription}
          isSelf={isSelf}
        />
      )}

      {name && (
        <div className="flex flex-row w-full mt-2 mb-2 md:justify-center ">
          <div className="flex flex-row flex-wrap gap-4 mx-2 text-xl md:w-11/12">
            <Link href={`/u/${name}/overview`}>

              <div
                className={
                  " cursor-pointer font-bold" +
                  (userPostMode === "" || userPostMode === "OVERVIEW"
                    ? " font-bold  "
                    : " opacity-50 hover:opacity-70")
                }
              >
                Overview
              </div>

            </Link>
            <Link href={`/u/${name}/submitted`}>

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

            </Link>
            <Link href={`/u/${name}/comments`}>

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

            </Link>
            {isSelf && (
              <>
                <Link href={`/u/${name}/upvoted`}>

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

                </Link>
                <Link href={`/u/${name}/downvoted`}>

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

                </Link>
                <Link href={`/u/${name}/hidden`}>

                  <div
                    className={
                      " cursor-pointer font-bold" +
                      (userPostMode === "HIDDEN"
                        ? " font-bold  "
                        : " opacity-50 hover:opacity-70")
                    }
                  >
                    Hidden
                  </div>

                </Link>
                <Link href={`/u/${name}/saved`}>

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

                </Link>
              </>
            )}
            {userPostMode === "SAVED" && (
              <div className="ml-auto text-sm">
                <Toggles externalStyles="gap-2" setting="userPostType" />
              </div>
            )}
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
