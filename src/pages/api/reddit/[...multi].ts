import type { NextApiRequest, NextApiResponse } from "next";

//odd searchParams issues, not using edge
// export const config = {
//   runtime: "experimental-edge",
// };

const BASE_ROUTE = "https://oauth.reddit.com/api";

const handler = async (request: NextApiRequest, response: NextApiResponse) => {
  const uri = request.url?.split("/api/reddit")?.[1]; //request.nextUrl?.pathname?.split("/api/reddit")?.[1];
  //const search = request.nextUrl.searchParams.toString();
  const method = request.method;
  const auth = request.headers?.["authorization"]; //request.headers?.get("authorization");
  //console.log("R1?", { uri, method, auth });
  if (!uri || !method || !auth) {
    response.status(400).json({ Error: "Missing data" });
  } else {
    try {
      const r = await fetch(`${BASE_ROUTE}${uri}`, {
        method: method,
        headers: {
          Authorization: `${auth}`,
        },
      });

      try {
        const json = await r.json();
        response.status(r.status).json(json); //.json(await r.json());
      } catch (error) {
        //console.log("JSON ERR?", error);
        response.status(r.status).json({ Status: r.statusText });
      }
    } catch (err) {
      //console.log("MULTI ERR?", err);
      response.status(500).json({ Error: "Server error" });
    }
  }
  return;
};
export default handler;
