import React from "react";
import { SignIn } from "@clerk/nextjs";
import type { GetServerSideProps } from "next";

export default function Page() {
  return (
    <div className="min-h-[calc(100vh-3rem)] w-full flex items-center justify-center">
      <SignIn
        appearance={{
          elements: {
            rootBox: "w-full max-w-3xl mx-4 md:mx-10 lg:mx-0",
            card: "flex flex-col w-full p-4 text-sm border rounded-lg shadow-md bg-th-post border-th-border2 gap-y-4 md:p-10",
            header: "mb-4",
            headerTitle: "text-th-text",
            headerSubtitle: "text-th-text opacity-80",
            formField: "flex flex-col gap-y-0.5",
            formFieldLabel: "text-xs font-medium text-th-textLight",
            formFieldInput:
              "text-th-text focus:ring focus:ring-th-accent  focus:border-transparent shadow-sm rounded-md outline-none px-4 border border-th-border bg-th-highlight h-12",
            formButtonPrimary:
              "text-th-text bg-th-accent hover:bg-th-accent inline-flex items-center justify-center w-full h-12 px-4 text-base font-medium border border-transparent rounded-md shadow-sm  hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:w-auto sm:text-sm lowercase",
            alertText: "text-th-red text-xs opacity-80 ",
            footer: "flex w-full items-center justify-center mt-8",
            footerAction: "flex items-center justify-center",
            footerActionText: "text-th-textLight text-xs",
            footerActionLink:
              "text-th-linkHover text-xs hover:text-th-link hover:underline",
            //
            identityPreview: "bg-th-highlight border border-th-border2",
            identityPreviewText: "text-th-text",
            identityPreviewEditButtonIcon: "text-th-link",
            formFieldAction__password:
              "text-th-linkHover hover:text-th-link hover:underline text-xs",
            formFieldInputShowPasswordIcon: "text-th-textLight",
            formFieldInputShowPasswordButton: " ring-th-accent",
            alternativeMethods:
              "bg-th-highlight border border-th-border2 rounded-md",
            alternativeMethodsBlockButton: "text-th-textLight",
            alternativeMethodsBlockButtonText: "text-th-text",
            alternativeMethodsBlockButtonArrow: "text-th-text",
            headerBackLink: "text-th-link hover:text-th-linkHover",
            headerBackIcon: "text-th-link hover:text-th-linkHover",
            formHeaderTitle: "text-th-text", 
            formHeaderSubtitle: "text-th-textLight", 
            otpCodeFieldInput: "text-th-text border-th-textLight ",
            otpCodeBox: "",
            otpCodeField: "",
            formResendCodeLink: "text-th-link hover:text-th-linkHover"
          },
        }}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const free = JSON.parse(process.env?.NEXT_PUBLIC_FREE_ACCESS ?? "true");
  if (free) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: {},
  };
};
