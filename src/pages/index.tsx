import axios from "axios";
import Head from "next/head";

import FrontPage from "../components/FrontPage";
import NavBar from "../components/NavBar";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <NavBar/>
      <FrontPage sort="best" range="" />
    </div>
  );
};

export default index;
