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
          <button onClick={() => signIn()}>Login</button>
        </>
      )}
      {session && (
        <>
          <button onClick={() => signOut()}>Logout</button>
        </>
      )}
    </>
  );
}
