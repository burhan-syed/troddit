import Head from "next/head";
import { useEffect } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import SearchPage from "../../components/SearchPage";
import React from "react";

const Search = ({ query }) => {
  return (
    <div>
      <Head>
        <title>{`troddit  ${query?.q ? `· ${query.q} ` : ``}`}</title>
      </Head>

      <main>
          <SearchPage query={query} />
      </main>
    </div>
  );
};
Search.getInitialProps = ({ query }) => {
  return { query };
};

export default Search;
