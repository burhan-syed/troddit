import localforage from "localforage";
import { signIn, signOut, useSession } from "next-auth/react";
import React from "react";
import useRefresh from "../hooks/useRefresh";

export default function Login() {
  const { data: session, status } = useSession();
  const { invalidateAll } = useRefresh();
  const loading = status === "loading";
  return (
    <>
      <div className="flex flex-row items-center w-full h-full">
        {!session && !loading && (
          <>
            <button
              aria-label="sign in"
              className="w-full h-full"
              onClick={() => {
                invalidateAll();
                signIn("reddit");
              }}
            >
              Login
            </button>
          </>
        )}
        {session && (
          <>
            <button
              aria-label="sign out"
              className="w-full h-full"
              onClick={() => {
                localforage.removeItem('subSync')
                invalidateAll();
                signOut();
              }}
            >
              Logout
            </button>
          </>
        )}
      </div>
    </>
  );
}
