import axios from "axios";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/client";
import { useState, useEffect } from "react";
import Snoowrap from "snoowrap";

export default function Login() {
  const [session, loading] = useSession();
  const [accessToken, setAccessToken] = useState("");
  const [refreshtoken, setRefreshToken] = useState("");
  useEffect(() => {
    if (session) {
      getToken();
    }
  }, [session]);

  const getToken = async () => {
    let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
    //console.log(tokendata);
    setAccessToken(tokendata.data.accessToken);
    setRefreshToken(tokendata.data.refreshtoken);
  };

  return (
    <>
      {!session && (
        <>
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
      {session && (
        <>
          Signed in as {session?.user.name} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  );
}
