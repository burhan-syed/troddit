import React, { useEffect } from "react";
import { SignUp } from "@clerk/nextjs";
import { GetServerSideProps } from "next";
import EmailForm from "../../components/EmailForm";
import Link from "next/link";
import { useRouter } from "next/router";

const OPEN = JSON.parse(process?.env?.NEXT_PUBLIC_FREE_ACCESS ?? "true");

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    if (OPEN) {
      router.replace("/");
    }
  }, []);

  if (OPEN) {
    return <></>;
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] h-full w-full flex items-center justify-center">
      <div className="w-full max-w-3xl mx-4 md:mx-10 lg:mx-0">
        <div className="flex flex-col w-full p-4 text-sm border rounded-lg shadow-md md:px-10 md:py-10 md:pb-8 bg-th-post border-th-border2 gap-y-4">
          <div className="flex flex-col gap-1">
            <h1 className="text-xl font-semibold">Sign Up</h1>
            <h2 className="text-base opacity-80">
              {" "}
              Thank you for considering troddit+
            </h2>
          </div>
          <p className="">
            At this time troddit+ is in a private beta and sign ups are limited.
            <br />
            <br />
            <strong>{" Troddit+ is priced at $6 a month."}</strong> This is to
            cover Reddit API service fees.
            <br />
            <br />
            If you are interested and would like to be notified when sign ups
            are available please submit your contact information below.
          </p>
         
          <div className="pt-2 sm:py-6 sm:pb-2 md:py-10 md:pb-8">
            <EmailForm />
          </div>
          <Link
            className="w-full text-xs text-center md:text-sm text-th-textLight group "
            href="/sign-in"
          >
            Already have an account?{" "}
            <span className=" text-th-linkHover group-hover:text-th-link group-hover:underline">
              Sign in here
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
