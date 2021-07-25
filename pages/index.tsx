import Head from "next/head";
import Feed from "../components/Feed";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <Feed/>
    </div>
  );
};

export default index;
