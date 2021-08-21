import axios from "axios";
import Head from "next/head";
import Feed from "../components/Feed";
import Login from "../components/Login";

import { b2a, getAccessToken, setAccessToken } from "../accessToken";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <Login />
      <Feed />
    </div>
  );
};

export default index;
