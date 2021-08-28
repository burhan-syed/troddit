import { useSession, getSession } from "next-auth/client";
import cookies from "next-cookies";
import { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import axios from "axios";

import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Feed from "./Feed";

const Main = () => {
  const [accessToken, setAccessToken] = useState("");
  const [refreshtoken, setRefreshToken] = useState("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    getToken();

    return () => {
      setAccessToken("");
      setRefreshToken("");
      setLoaded(false);
    };
  }, []);

  const getToken = async () => {
    try {
      let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
      console.log(tokendata);
      setAccessToken(tokendata.data.accessToken);
      setRefreshToken(tokendata.data.refreshtoken);
      setLoaded(true);
    } catch (err) {
      setLoaded(true);
    }
  };

  return (
    <div>
      <NavBar accessToken={accessToken} />
    </div>
  );
};

// export async function getServerSideProps({req}) {

//   // const token: any = await getToken({
//   //   req,
//   //   secret: process.env.NEXTAUTH_SECRET,
//   //   encryption: true
//   // });

//   // if (!token) {
//   //   return {
//   //     notFound: true,
//   //   };
//   // }

//   // return {
//   //   props: {
//   //     accessToken: "lkjl",
//   //     refreshToken: "lkjlkjlj",
//   //   }, // will be passed to the page component as props
//   //};
// }

export default Main;
