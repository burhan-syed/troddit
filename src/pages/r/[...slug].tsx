import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import { useEffect, useState } from "react";
import SubredditBanner from "../../components/SubredditBanner";
import { getWikiContent } from "../../RedditAPI";
import ParseBodyHTML from "../../components/ParseBodyHTML";
const Sort = ({ query }) => {
  const [subsArray, setSubsArray] = useState([]);
  const [wikiContent, setWikiContent] = useState("");
  const [wikiMode, setWikiMode] = useState(false);
  useEffect(() => {

    const getWiki = async(wikiquery) => {
      const data = await getWikiContent(wikiquery);
      setWikiContent(data?.data?.content_html ?? "nothing found")
    }

    setSubsArray(
      query?.slug?.[0]
        .split(" ")
        .join("+")
        .split(",")
        .join("+")
        .split("%20")
        .join("+")
        .split("+")
    );
    if (query?.slug?.[1]?.toUpperCase() === "WIKI") {
      
      setWikiMode(true);
      let wikiquery = query.slug;
      if (!wikiquery?.[2]) wikiquery[2] = "index";
      getWiki(wikiquery);
    }
    return () => {
      setWikiMode(false);
      setSubsArray([]);
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
        {subsArray?.[0]?.toUpperCase() !== "ALL" &&
        subsArray?.[0]?.toUpperCase() !== "POPULAR" &&
        subsArray?.length > 0 ? (
          <div className="w-screen pt-16 ">
            <SubredditBanner subreddits={subsArray} userMode={false} />
          </div>
        ) : (
          <div className="pt-16"></div>
        )}
        {wikiMode ? 
        
      <div className="flex flex-col w-full mb-10 md:mx-10 lg:mx-20">
        <Link href={`/r/${subsArray[0]}/wiki`}><a><h1 className="text-lg font-bold">Wiki</h1></a></Link>
      <ParseBodyHTML html={wikiContent}/>
      </div>
        
        : 
        <Feed
          query={query}
          isSubFlair={query?.slug?.[1] === "search" && query?.q}
        />}
      </main>
    </div>
  );
};

// export async function getServerSideProps(context) {
//   return {
//     props: {
//       query: context?.query,
//     },
//   };
// }
Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
