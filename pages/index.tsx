import axios from "axios";
import Head from "next/head";
import Feed from "../components/Feed";
import Login from "../components/Login";

import { b2a, setAccessToken } from "../accessToken";

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

/* export async function getServerSideProps({ query }) {
  console.log(query);
  if (query?.code) {
    const approvalCode = query.code;
    if (approvalCode !== false) {
      const encode = b2a(
        `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`
      );
      axios
        .post(
          "https://www.reddit.com/api/v1/access_token",
          `grant_type=authorization_code&code=${approvalCode}&redirect_uri=${process.env.REDDIT_REDIRECT}`,
          {
            headers: {
              Authorization: `Basic ${encode}`,
            },
          }
        )
        .then((res) => {
          //console.log(res.data);
          if (res.data && res.data.access_token) {
            console.log(res.data.access_token);
            setAccessToken(res.data.access_token);
          }
          return res.data;
        })
        .catch((err) => console.log(err));
    }
    return {
      props: {}, // will be passed to the page component as props
    };
  }
} */
export default index;
