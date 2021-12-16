import axios from "axios";
import { signIn, signOut, useSession } from "next-auth/client";
import { useState, useEffect } from "react";


export default function Login() {
  const [session, loading] = useSession();
  

  return (
    <>
      <div className="flex flex-row items-center w-full h-full">
        {!session && (
          <>
            <button className="w-full h-full" onClick={() => signIn('reddit')}>
              Login
            </button>
          </>
        )}
        {session && (
          <>
            <button className="w-full h-full" onClick={() => signOut()}>
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
