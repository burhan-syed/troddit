import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import SubredditBanner from "../../components/SubredditBanner";
import { getUserMultiSubs } from "../../RedditAPI";
import { useSession } from "next-auth/client";
const Sort = ({ query }) => {
  const [session, loading] = useSession();
  const [loaded, setLoaded] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [mode, setMode] = useState("");
  const [subsArray, setSubsArray] = useState([]);
  const [username, setUserName] = useState("");
  const [isMulti, setIsMulti] = useState(false);
  const [feedQuery, setFeedQuery] = useState("");
  useEffect(() => {
    const getSubsArray = async () => {
      let subs = await getUserMultiSubs(query?.slug?.[0], query?.slug?.[2]);
      // subs?.length > 0 ? setSubsArray(subs) : setSubsArray([]);
      subs?.length > 0 &&
        router.push(
          `/r/${subs.join("+")}${query?.slug?.[3] && `/${query?.slug?.[3]}`}${
            query?.t && `?t=${query?.t}`
          }`
        );
      //?m=${query.slug[2]}
      setLoaded(true);
    };

    const sessionLoad = async (user, mode) => {
      if (
        !session ||
        session?.user?.name?.toUpperCase() !== user.toUpperCase()
      ) {
        setForbidden(true);
        return false;
      } else {
        setForbidden(false);
        setUserName(session?.user?.name);
        setFeedQuery(query);
        setIsUser(true);
        setLoaded(true);
        setMode(mode.toUpperCase());
      }
    };

    //console.log(query);
    if (!loading) {
      if (
        session?.user?.name?.toUpperCase() === query?.slug?.[0]?.toUpperCase()
      ) {
        setUserName(query?.slug?.[0]);
      }
      if (query?.slug?.[1] === "p") {
        router.replace(`/${query.slug?.[2]}`);
        setLoaded(true);
      } else if (
        query?.slug?.[1]?.toUpperCase() === "UPVOTED" ||
        query?.slug?.[1]?.toUpperCase() === "SAVED" ||
        query?.slug?.[1]?.toUpperCase() === "DOWNVOTED" ||
        query?.slug?.[1]?.toUpperCase() === "OVERVIEW" ||
        query?.slug?.[1]?.toUpperCase() === "SUBMITTED"
      ) {
        sessionLoad(query?.slug?.[0], query?.slug?.[1]);
      } else {
        setIsUser(true);
        setFeedQuery(query);
        if (query?.slug?.[1] === "m" && query?.slug?.[2]?.length > 0) {
          getSubsArray();
          setIsMulti(true);
        } else {
          setLoaded(true);
        }
      }
    }

    return () => {
      setLoaded(false);
      setIsUser(false);
      setForbidden(false);
      setUserName("");
      setMode("");
      setFeedQuery("");
    };
  }, [query, session, loading]);

  return (
    <div className="overflow-x-hidden overflow-y-auto ">
      <Head>
        <title>
          {query?.slug?.[0] ? `troddit · ${query?.slug?.[0]}` : "troddit"}
        </title>
      </Head>
      <main>
        <NavBar />
        {forbidden ? (
          <div className="flex items-center justify-center w-screen h-screen">
            Access Forbidden
          </div>
        ) : (
          loaded && (
            <div>
              {true ? (
                <div className="w-screen pt-16 ">
                  <SubredditBanner
                    subreddits={[`u_${query?.slug?.[0]}`]}
                    userMode={true}
                    ownProfile={mode}
                    name={username}
                  />
                </div>
              ) : (
                <div className="pt-16"></div>
              )}
              <Feed
                query={feedQuery}
                isUser={isUser}
                ownProfile={mode}
                isMulti={isMulti}
              />
            </div>
          )
        )}
      </main>
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
