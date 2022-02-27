import { signIn, signOut, useSession } from "next-auth/client";
import Link from "next/link";

export default function LoginProfile() {
  const [session, loading] = useSession();

  return (
    <>
      <div className="flex flex-row items-center justify-center w-full h-full">
        {!session && !loading && (
          <>
            <button className="w-full h-full" onClick={() => signIn("reddit")}>
              Login
            </button>
          </>
        )}
        {session && (
          <>
            <Link href={`/u/${session?.user?.name}/saved`}>
              <a>
                <button className="w-full h-full text-center capitalize">
                  Profile
                </button>
              </a>
            </Link>
          </>
        )}
      </div>
    </>
  );
}
