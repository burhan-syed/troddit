/* eslint-disable import/no-anonymous-default-export */
import { getSession } from "next-auth/client";
import { getToken } from "next-auth/jwt";
import axios from "axios";
import Snoowrap from "snoowrap";

export default async (req, res) => {
  //const body = JSON.parse(req.body);
  const session = await getSession({ req });
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  //console.log(session);
  //console.log(token.reddit.accessToken);
  //console.log(token.reddit.refreshToken);

  const r = new Snoowrap({
    userAgent: "randomstring",
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: token.reddit.refreshToken,
  });
  try {
    // const data = await axios.get(
    //   "https://oauth.reddit.com/subreddits/mine/subscriber",
    //   {
    //     headers: {
    //       authorization: `bearer ${token.reddit.accessToken}`,
    //     },
    //     params: {
    //       limit: 100,
    //     },
    //   }
    // );
    const subs = await r.getSubscriptions().fetchAll();
    console.log(subs);
    //console.log(data.data.data.children);
    return res.status(200).json({
      status: "Ok",
      data: subs, //data.data.data.children,
    });
  } catch (e) {
    return res.status(400).json({
      status: e.message,
    });
  }
};
