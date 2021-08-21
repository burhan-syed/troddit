import { getCsrfToken, signIn, signOut, useSession } from "next-auth/client";
import { useState } from "react";

export default function Login() {
  const [session, loading] = useSession();
  const [token, setToken] = useState("");

  return (
    <>
      <p>login</p>
      {!session && (
        <>
          Not signed in <br />
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
      {session && (
        <>
          Signed in as {session?.user.name} <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
      <p>{token}</p>
    </>
  );
}
