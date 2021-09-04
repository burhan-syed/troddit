import axios from "axios";
import Head from "next/head";

import Feed from "../components/Feed";
import NavBar from "../components/NavBar";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <NavBar />
      <Feed query={{ frontsort: "hot" }} />
    </div>
  );
};

export default index;
