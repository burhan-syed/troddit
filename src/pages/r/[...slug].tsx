import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import { useEffect, useState } from "react";
import SubredditBanner from "../../components/SubredditBanner";
const Sort = ({ query }) => {
  const [subsArray, setSubsArray] = useState([]);
  useEffect(() => {
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
    return () => {};
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
            <SubredditBanner subreddits={subsArray} />
          </div>
        ) : (
          <div className="pt-16"></div>
        )}
        <Feed
          query={query}
          isSubFlair={query?.slug?.[1] === "search" && query?.q}
        />
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
