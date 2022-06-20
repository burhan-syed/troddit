import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function LoginProfile() {
  const { data: session, status } = useSession();
  const loading = status === "loading";
  if (!session && !loading)
    return (
      <button className="w-full h-full" onClick={() => signIn("reddit")}>
        Login
      </button>
    );

  if (session && !loading)
    return (
      <Link href={`/u/${session?.user?.name}/saved`}>
        <a>
          <button className="w-full h-full text-center capitalize">
            Profile
          </button>
        </a>
      </Link>
    );
  return <div className="w-full h-full"></div>;
}
