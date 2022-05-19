/* eslint-disable react-hooks/rules-of-hooks */
import axios from "axios";
import Head from "next/head";

import Feed from "../components/Feed";
import NavBar from "../components/NavBar";
import { useEffect, useState } from "react";
import { getSession } from "next-auth/react";

export const index = ({ session, query }) => {
  return (
    <div className="overflow-x-hidden ">
      <Head>
        <title>troddit · a web app for Reddit </title>
        <meta
          name="description"
          content="Browse Reddit better with Troddit. Grid views, single column mode, galleries, and a number of post styles. Login with Reddit to see your own subs, vote, and comment. Open source."
        ></meta>
      </Head>
      <main>
          <Feed query={query} />
      </main>
    </div>
  );
};
index.getInitialProps = ({ query }) => {
  return { query };
};
export default index;
