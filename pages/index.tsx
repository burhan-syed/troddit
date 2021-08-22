import axios from "axios";
import Head from "next/head";
import Feed from "../components/Feed";
import FrontPage from "../components/FrontPage";
import Login from "../components/Login";

export const index = () => {
  return (
    <div>
      <Head>
        <title>Next-Reddit</title>
      </Head>
      <Login />
      <FrontPage />
    </div>
  );
};

export default index;
