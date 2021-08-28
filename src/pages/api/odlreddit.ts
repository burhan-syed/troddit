import axios from "axios";
import { getAccessToken, setAccessToken } from "../../accessToken";
function b2a(a) {
  var c,
    d,
    e,
    f,
    g,
    h,
    i,
    j,
    o,
    b = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    k = 0,
    l = 0,
    m = "",
    n = [];
  if (!a) return a;
  do
    (c = a.charCodeAt(k++)),
      (d = a.charCodeAt(k++)),
      (e = a.charCodeAt(k++)),
      (j = (c << 16) | (d << 8) | e),
      (f = 63 & (j >> 18)),
      (g = 63 & (j >> 12)),
      (h = 63 & (j >> 6)),
      (i = 63 & j),
      (n[l++] = b.charAt(f) + b.charAt(g) + b.charAt(h) + b.charAt(i));
  while (k < a.length);
  return (
    (m = n.join("")),
    (o = a.length % 3),
    (o ? m.slice(0, o - 3) : m) + "===".slice(o || 3)
  );
}

export default async function handler(req, res) {
  const params = new URL(req.url, "http://localhost:3000").searchParams;
  const approvalCode = params.get("code") ? params.get("code") : false;
  if (approvalCode !== false) {
    const encode = b2a(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);
    try {
      const response = await axios.post(
        "https://www.reddit.com/api/v1/access_token",
        `grant_type=authorization_code&code=${approvalCode}&redirect_uri=${process.env.REDDIT_REDIRECT}`,
        {
          headers: {
            Authorization: `Basic ${encode}`,
          },
        }
      );
      if (response.data && response.data.access_token) {
        console.log(response.data);
        res.redirect("/");
      }
      res.status(200).end();
    } catch (err) {
      res.json(err);
      res.status(405).end();
    }
    res.status(405).end();
  }
}

const setToken = async (token) => {
  setAccessToken(token);
};

const redirect = async (token, res) => {
  await setToken(token);
  getAccessToken();
  //res.redirect("/");
};
