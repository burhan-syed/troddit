import axios from "axios";
import { getCsrfToken, signIn, signOut, useSession } from "next-auth/client";
import { useState, useEffect } from "react";
import Snoowrap from "snoowrap";

export default function Login() {
  const [session, loading] = useSession();

  return (
    <>
      {!session && (
        <>
          <button onClick={() => signIn()}>Sign in</button>
        </>
      )}
      {session && (
        <>
          {session?.user.name} |  <br />
          <button onClick={() => signOut()}>Sign out</button>
        </>
      )}
    </>
  );
}
