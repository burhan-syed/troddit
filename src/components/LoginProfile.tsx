import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";
import { useMainContext } from "../MainContext";
import { useTAuth } from "../PremiumAuthContext";

export default function LoginProfile() {
  const { premium } = useTAuth();
  const context: any = useMainContext();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  if (!session && !loading)
    return (
      <button
        aria-label="login"
        className="w-full h-full"
        onClick={() =>
          premium?.isPremium ? signIn("reddit") : context.setPremiumModal(true)
        }
      >
        Login
      </button>
    );

  if (session && !loading)
    return (
      <Link legacyBehavior href={`/u/${session?.user?.name}/saved`}>
        <button
          aria-label="profile"
          className="w-full h-full text-center capitalize"
        >
          Profile
        </button>
      </Link>
    );
  return <div className="w-full h-full"></div>;
}
