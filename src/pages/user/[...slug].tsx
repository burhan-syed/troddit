import router, { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Link from "next/link";
import Head from "next/head";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
const Sort = ({ query }) => {
  const [loaded, setLoaded] = useState(false);
  const [isUser, setIsUser] = useState(false);
  const [feedQuery, setFeedQuery] = useState("");
  useEffect(() => {
    console.log(query);
    if (query?.slug?.[0] === "p") {
      router.replace(`/${query.slug?.[1]}`);
    } else {
      setIsUser(true);
      setFeedQuery(query);
    }
    setLoaded(true);
    return () => {
      setLoaded(false);
      setIsUser(false);
      setFeedQuery("");
    }
  }, [query])
  return (
    <div className="overflow-x-hidden overflow-y-auto ">
      <Head>
        <title>{query?.slug?.[0] ? `troddit · ${query?.slug?.[0]}` : "troddit"}</title>
      </Head>
      <main>
        <NavBar />
        {loaded && 
                <Feed query={feedQuery} isUser={isUser}/>
        }
      </main>
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
