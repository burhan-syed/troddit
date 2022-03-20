import Head from "next/head";
import React from "react";
import NavBar from "../../components/NavBar";
import SubredditsPage from "../../components/SubredditsPage";

const Subreddits = () => {
  return (
    <div>
      <Head>
        <title>{`troddit · subreddits`}</title>
      </Head>

      <main>
        <NavBar />
        <div className="mt-16">
          <SubredditsPage />
        </div>
      </main>
    </div>
  );
};

export default Subreddits;
