import axios from "axios";
import Head from "next/head";

import FrontPage from "../components/FrontPage";
import Sort from "../components/Sort";
import Main from "../components/Main";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <Main />
      <Sort />
      <FrontPage sort="best" range="" />
    </div>
  );
};

export default index;
