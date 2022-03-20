import Head from "next/head";
import { useEffect } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import SearchPage from "../../components/SearchPage";

const Search = ({ query }) => {
  return (
    <div>
      <Head>
        <title>{`troddit  ${query?.q ? `· ${query.q} ` : ``}`}</title>
      </Head>

      <main>
        <NavBar />
        {/* <div className="mt-16">
          <Feed query={query} />
        </div> */}
        <div className="mt-16">
          <SearchPage query={query} />
        </div>
      </main>
    </div>
  );
};
Search.getInitialProps = ({ query }) => {
  return { query };
};

export default Search;
