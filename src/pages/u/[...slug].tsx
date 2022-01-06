import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import SubredditBanner from "../../components/SubredditBanner";
import { getUserMultiSubs } from "../../RedditAPI";
const Sort = ({ query }) => {
  const [loaded, setLoaded] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [subsArray, setSubsArray] = useState([]);
  const [isMulti, setIsMulti] = useState(false);
  const [feedQuery, setFeedQuery] = useState("");
  useEffect(() => {
    const getSubsArray = async () => {
      let subs = await getUserMultiSubs(query?.slug?.[0], query?.slug?.[2]);
      // subs?.length > 0 ? setSubsArray(subs) : setSubsArray([]);
      subs?.length > 0 && router.push(`/r/${subs.join('+')}${query?.slug?.[3] && `/${query?.slug?.[3]}`}${query?.t && `?t=${query?.t}`}`);
      //?m=${query.slug[2]}
      setLoaded(true);
    };

    //console.log(query);
    if (query?.slug?.[1] === "p") {
      router.replace(`/${query.slug?.[2]}`);
      setLoaded(true);
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
    return () => {
      setLoaded(false);
      setIsUser(false);
      setFeedQuery("");
    };
  }, [query]);

  return (
    <div className="overflow-x-hidden overflow-y-auto ">
      <Head>
        <title>
          {query?.slug?.[0] ? `troddit · ${query?.slug?.[0]}` : "troddit"}
        </title>
      </Head>
      <main>
        <NavBar />
        {loaded && (
          <div >
            {subsArray?.length > 0 ? (
              <div className="w-screen pt-16 ">
                <SubredditBanner subreddits={subsArray} />
              </div>
            ) : (
              <div className="pt-16"></div>
            )}
            <Feed query={feedQuery} isUser={isUser} isMulti={isMulti} />
          </div>
        )}
      </main>
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
