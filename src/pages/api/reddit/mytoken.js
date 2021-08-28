/* eslint-disable import/no-anonymous-default-export */
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import Snoowrap from "snoowrap";

export default async (req, res) => {
  //const body = JSON.parse(req.body);
  const session = await getSession({ req });
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  try {
    return res.status(200).json({
      status: "Ok",
      data: {
        accessToken: token.reddit.accessToken,
        refreshToken: token.reddit.refreshToken,
      },
    });
  } catch (e) {
    return res.status(400).json({
      status: e.message,
    });
  }
};
