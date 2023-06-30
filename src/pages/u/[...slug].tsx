import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import SubredditBanner from "../../components/SubredditBanner";
import { getUserMultiSubs } from "../../RedditAPI";
import { getSession } from "next-auth/react";
import { useSession } from "next-auth/react";
import React from "react";
import { useTAuth } from "../../PremiumAuthContext";
const Sort = ({ query }) => {
  const {isLoaded, premium} = useTAuth(); 
  const router = useRouter();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const [loaded, setLoaded] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [mode, setMode] = useState("");
  const [subsArray, setSubsArray] = useState([]);
  const [username, setUserName] = useState("");
  const [isMulti, setIsMulti] = useState(false);
  const [feedQuery, setFeedQuery] = useState("");

  const getSubsArray = async () => {
    let subs = await getUserMultiSubs({user:query?.slug?.[0], multi:query?.slug?.[2], isPremium: premium?.isPremium});
    // subs?.length > 0 ? setSubsArray(subs) : setSubsArray([]);

    subs && subs?.length > 0 && router.push(`/r/${subs.join("+")}`);
    //?m=${query.slug[2]}
    setLoaded(true);
  };

  //to handle direct routes (ie from going back)
  useEffect(() => {
    if (query.slug?.[1] === "r" && query.slug?.[3] === "comments") {
      router.replace(`/${query.slug?.slice(1)?.join("/")}`);
    }
    //multi case
    else if (query.slug?.[3] === "r" && query.slug?.[5] === "comments") {
      router.replace(`/${query.slug?.slice(3)?.join("/")}`);
    }
  }, []);

  useEffect(() => {
    const sessionLoad = async (user, mode) => {
      if (
        (!session ||
          session?.user?.name?.toUpperCase() !== user.toUpperCase()) &&
        (mode === "SAVED" ||
          mode === "UPVOTED" ||
          mode === "DOWNVOTED" ||
          mode === "HIDDEN")
      ) {
        router.push(`/u/${user}`);
        setForbidden(true);
        return false;
      } else {
        setForbidden(false);
        setUserName(query?.slug?.[0]);
        setFeedQuery(query);
        setIsUser(true);
        setLoaded(true);
        setMode(mode.toUpperCase());
      }
    };

    if (
      query?.slug?.[1]?.toUpperCase() === "UPVOTED" ||
      query?.slug?.[1]?.toUpperCase() === "SAVED" ||
      query?.slug?.[1]?.toUpperCase() === "DOWNVOTED" ||
      query?.slug?.[1]?.toUpperCase() === "OVERVIEW" ||
      query?.slug?.[1]?.toUpperCase() === "SUBMITTED" ||
      query?.slug?.[1]?.toUpperCase() === "COMMENTS" ||
      query?.slug?.[1]?.toUpperCase() === "HIDDEN"
    ) {
      sessionLoad(query?.slug?.[0], query?.slug?.[1]?.toUpperCase());
    } else {
      setIsUser(true);
      setFeedQuery(query);
      if (query?.slug?.[1] === "m" && query?.slug?.[2]?.length > 0) {
        setIsMulti(true);
        setLoaded(true);
      } else {
        setUserName(query?.slug?.[0]);
        setLoaded(true);
      }
    }

    return () => {
      setLoaded(false);
      setIsUser(false);
      setIsMulti(false);
      setForbidden(false);
      setUserName("");
      setMode("");
      setFeedQuery("");
    };
  }, [query, session, loading]);

  return (
    <div className="-mt-2 overflow-x-hidden overflow-y-auto">
      <Head>
        <title>
          {query?.slug?.[0] ? `troddit · ${query?.slug?.[0]}` : "troddit"}
        </title>
      </Head>
      <main className="">
        {forbidden ? (
          <div className="flex items-center justify-center w-screen h-screen">
            Access Forbidden
          </div>
        ) : (
          loaded && (
            <div className="">
              {true ? (
                <div className="w-screen">
                  <SubredditBanner
                    subreddits={[`u_${query?.slug?.[0]}`]}
                    userMode={true}
                    userPostMode={mode}
                    name={username}
                    isSelf={
                      username?.toUpperCase() ===
                      session?.user?.name?.toUpperCase()
                    }
                  />
                  {isMulti && (
                    <div className="flex justify-center w-full ">{`Viewing multi "${query?.slug?.[2]}" by u/${query?.slug?.[0]}`}</div>
                  )}
                  {isMulti && !session && (
                    <div className="flex justify-center w-full pb-2">{`Login to save this multi`}</div>
                  )}
                  {isMulti && session && (
                    <button
                      disabled={!premium?.isPremium}
                      className="flex justify-center w-full pb-2 hover:cursor-pointer hover:font-semibold disabled:opacity-50 disabled:pointer-events-none"
                      onClick={getSubsArray}
                    >
                      Click to Extract Subreddits
                    </button>
                  )}
                </div>
              ) : (
                <div></div>
              )}
              <Feed />
            </div>
          )
        )}
      </main>
    </div>
  );
};

//can't use getServerSideProps because in app navigation causes page jump
Sort.getInitialProps = ({ query, req }) => {
  return { query };
};

export default Sort;
