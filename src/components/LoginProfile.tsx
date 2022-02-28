import { signIn, signOut, useSession } from "next-auth/client";
import Link from "next/link";

export default function LoginProfile() {
  const [session, loading] = useSession();

  if (loading) return <div className="w-full h-full"></div>;
  if (!session && !loading)
    return (
      <button className="w-full h-full" onClick={() => signIn("reddit")}>
        Login
      </button>
    );

  if (session)
    return (
      <Link href={`/u/${session?.user?.name}/saved`}>
        <a>
          <button className="w-full h-full text-center capitalize">
            Profile
          </button>
        </a>
      </Link>
    );
}
