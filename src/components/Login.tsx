import { signIn, signOut, useSession } from "next-auth/react";

export default function Login() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  return (
    <>
      <div className="flex flex-row items-center w-full h-full">
        {!session && !loading && (
          <>
            <button className="w-full h-full" onClick={() => signIn("reddit")}>
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
