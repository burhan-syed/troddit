import { useRouter } from "next/router";
import { useEffect } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import Sort from "../../components/Sort";
import Head from "next/head";

const Subs = ({ query }) => {
  const router = useRouter();
  //console.log(query);
  const { frontsort } = router.query;

  return (
    <div>
      <Head>
        <title>
          {query?.frontsort ? `troddit/${query?.frontsort}` : "troddit"}
        </title>
      </Head>

      <main>
        <NavBar />
        <Feed query={query} />
      </main>
    </div>
  );
};

Subs.getInitialProps = ({ query }) => {
  return { query };
};

export default Subs;
