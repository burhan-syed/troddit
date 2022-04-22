import Head from "next/head";
import NavBar from "../../components/NavBar";
import SubredditsPage from "../../components/SubredditsPage";

const Subs = ({ query }) => {
  return (
    <div>
      <Head>
        <title>{`troddit · subreddits`}</title>
      </Head>

      <main>
        <NavBar />
        <div className="mt-16">
          <SubredditsPage query={query} />
        </div>
      </main>
    </div>
  );
};

Subs.getInitialProps = ({ query }) => {
  return { query };
};

export default Subs;
