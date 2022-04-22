import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import Head from "next/head";

const Subs = ({ query }) => {
  return (
    <div>
      <Head>
        <title>
          {query?.frontsort ? `troddit · ${query?.frontsort}` : "troddit"}
        </title>
      </Head>

      <main>
        <NavBar />
        <div className="mt-16">
          <Feed query={query} />
        </div>
      </main>
    </div>
  );
};

Subs.getInitialProps = ({ query }) => {
  return { query };
};

export default Subs;
