import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import { useEffect, useState } from "react";
import SubredditBanner from "../../components/SubredditBanner";
import { getWikiContent } from "../../RedditAPI";
import ParseBodyHTML from "../../components/ParseBodyHTML";
import Collection from "../../components/collections/Collection";
import PostModal from "../../components/PostModal";
import LoginModal from "../../components/LoginModal";
const SubredditPage = ({ query }) => {
  const [subsArray, setSubsArray] = useState([]);
  const [wikiContent, setWikiContent] = useState("");
  const [wikiMode, setWikiMode] = useState(false);
  const [commentThread, setCommentThread] = useState(false);
  const [postThread, setPostThread] = useState(false);
  const [withCommentContext, setWithCommentContext] = useState(false);
  useEffect(() => {
    const getWiki = async (wikiquery) => {
      const data = await getWikiContent(wikiquery);
      setWikiContent(data?.data?.content_html ?? "nothing found");
    };

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
    if (query?.slug?.[1]?.toUpperCase() === "COMMENTS" ) {
      setPostThread(true); 
      query?.context && setWithCommentContext(true);
      query?.slug?.[4] && setCommentThread(true);
    } else if (query?.slug?.[1]?.toUpperCase() === "WIKI") {
      setWikiMode(true);
      let wikiquery = query.slug;
      if (!wikiquery?.[2]) wikiquery[2] = "index";
      getWiki(wikiquery);
    }
    return () => {
      setPostThread(false);
      setWithCommentContext(false);
      setCommentThread(false);
      setWikiMode(false);
      setSubsArray([]);
    };
  }, [query]);
  return (
    <div
      className={
        (subsArray?.[0]?.toUpperCase() !== "ALL" &&
        subsArray?.[0]?.toUpperCase() !== "POPULAR"
          ? " -mt-2 "
          : "") + " overflow-x-hidden overflow-y-auto "
      }
    >
      <Head>
        <title>
          {query?.slug?.[0] ? `troddit · ${query?.slug?.[0]}` : "troddit"}
        </title>
      </Head>
      <main>
        {subsArray?.[0]?.toUpperCase() !== "ALL" &&
        subsArray?.[0]?.toUpperCase() !== "POPULAR" &&
        subsArray?.length > 0 ? (
          <div className="w-screen ">
            <SubredditBanner subreddits={subsArray} userMode={false} />
          </div>
        ) : (
          <div className=""></div>
        )}
        {wikiMode ? (
          <div className="flex flex-col flex-wrap mb-10 md:mx-10 lg:mx-20">
            <Link href={`/r/${subsArray[0]}/wiki`}>
              <a>
                <h1 className="text-lg font-bold">Wiki</h1>
              </a>
            </Link>
            <ParseBodyHTML html={wikiContent} newTabLinks={false} />
          </div>
        ) : postThread ? (
          <div className="mt-10">
            <LoginModal />
            <PostModal
              permalink={"/r/" + query?.slug.join("/")}
              returnRoute={query?.slug?.[0] ? `/r/${query?.slug[0]}` : "/"}
              setSelect={setCommentThread}
              direct={true}
              commentMode={commentThread}
              withcontext={withCommentContext}
            />
          </div>
        ) : (
          <Feed/>
        )}
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
SubredditPage.getInitialProps = ({ query }) => {
  return { query };
};

export default SubredditPage;
