import axios from "axios";
import Head from "next/head";
import Login from "../components/Login";

import { b2a, getAccessToken, setAccessToken } from "../accessToken";
import FrontPage from "../components/FrontPage";
import Sort from "../components/Sort";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <Login />
      <Sort/>
      <FrontPage sort="best"/>
    </div>
  );
};

export default index;
