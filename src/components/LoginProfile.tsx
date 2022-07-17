import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

export default function LoginProfile() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  if (!session && !loading)
    return (
      <button
        aria-label="login"
        className="w-full h-full"
        onClick={() => signIn("reddit")}
      >
        Login
      </button>
    );

  if (session && !loading)
    return (
      <Link href={`/u/${session?.user?.name}/saved`}>
        <a>
          <button
            aria-label="profile"
            className="w-full h-full text-center capitalize"
          >
            Profile
          </button>
        </a>
      </Link>
    );
  return <div className="w-full h-full"></div>;
}
