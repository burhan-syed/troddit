import { useSession, getSession } from "next-auth/client";
import cookies from "next-cookies";
import { JWT } from "next-auth/jwt";
import { getToken } from "next-auth/jwt";
import axios from "axios";

import { useEffect, useState } from "react";
import NavBar from "./NavBar";
import Feed from "./Feed";

import { MainContext, MainProvider } from "../MainContext";

const Main = () => {

  return (
    <MainProvider>
      <NavBar/>
    </MainProvider>
  );
};

// export async function getServerSideProps({req}) {

//   // const token: any = await getToken({
//   //   req,
//   //   secret: process.env.NEXTAUTH_SECRET,
//   //   encryption: true
//   // });

//   // if (!token) {
//   //   return {
//   //     notFound: true,
//   //   };
//   // }

//   // return {
//   //   props: {
//   //     accessToken: "lkjl",
//   //     refreshToken: "lkjlkjlj",
//   //   }, // will be passed to the page component as props
//   //};
// }

export default Main;
