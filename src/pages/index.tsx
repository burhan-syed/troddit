import axios from "axios";
import Head from "next/head";

import Feed from "../components/Feed";
import NavBar from "../components/NavBar";

export const index = ({ query }) => {
  return (
    <div className="overflow-x-hidden ">
      <Head>
        <title>Troddit - Browse Reddit Better</title>
        <meta
          name="description"
          content="A seamless experience for browsing through Reddit with a masonry grid layout. Login with Reddit to experience your personalized home page, immediate access to your followed subreddits, and access to vote and comment."
        ></meta>
      </Head>
      <main>
        <NavBar />
        <Feed query={query} />
      </main>
    </div>
  );
};
index.getInitialProps = ({ query }) => {
  if (Object.keys(query).length === 0) {
    query = {
      frontsort: "hot",
    };
  }
  return { query };
};

export default index;
