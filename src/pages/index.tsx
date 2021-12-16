import axios from "axios";
import Head from "next/head";

import Feed from "../components/Feed";
import NavBar from "../components/NavBar";

export const index = ({ query }) => {
  return (
    <div className="overflow-x-hidden ">
      <Head>
        <title>troddit · a web client for Reddit </title>
        <meta
          name="description"
          content="Browse Reddit better with Troddit. Grid views, single column mode, galleries, and a number of post styles. Login with Reddit to see your own subs, vote, and comment. Open source."
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
