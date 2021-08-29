import NextAuth from "next-auth";
import Providers from "next-auth/providers";


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


async function refreshAccessToken(token) {
  try {

    const authvalue = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`

    const url =
      "https://www.reddit.com/api/v1/access_token?"
       +
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.reddit.refreshToken,
      });

    const response = await fetch(url, {

      headers: {
        "Authorization" : `Basic ${b2a(authvalue)}`
      },
      method: "POST",
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      reddit: {
        accessToken: refreshedTokens.accessToken ?? token.reddit.accessToken, //fallback to old access token
        refreshToken: refreshedTokens.refreshToken ?? token.reddit.refreshToken //fall back to old refresh token
      },
      iat: Math.floor(Date.now()/1000),
      exp: Math.floor(Date.now()/1000)+refreshedTokens.expires_in
    };
  } catch (error) {
    console.log(error);
    console.log("errored");
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    //Providers.Reddit({
    //   clientId: process.env.CLIENT_ID,
    //   clientSecret: process.env.CLIENT_SECRET,
    // }),
    //...add more providers here
    {
      id: "reddit",
      name: "Reddit",
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scope: "identity mysubreddits read", //Check Reddit API Documentation for more. The identity scope is required.
      type: "oauth",
      version: "2.0",
      params: { grant_type: "authorization_code" },
      accessTokenUrl: " https://www.reddit.com/api/v1/access_token",
      authorizationUrl:
        "https://www.reddit.com/api/v1/authorize?response_type=code&duration=permanent",
      profileUrl: "https://oauth.reddit.com/api/v1/me",
      profile: (profile) => {
        return {
          id: profile.id,
          name: profile.name,
          email: null,
        };
      },
    },
  ],

  callbacks: {
    async jwt(token, user, account = {}, profile, isNewUser) {
      if (Math.floor(Date.now() / 1000) > token.exp) {
        token = refreshAccessToken(token);
      }

      if (account.provider && !token[account.provider]) {
        token[account.provider] = {};
      }

      if (account.accessToken) {
        token[account.provider].accessToken = account.accessToken;
      }

      if (account.refreshToken) {
        token[account.provider].refreshToken = account.refreshToken;
      }

      

      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // A database is optional, but required to persist accounts in a database
  //database: process.env.DATABASE_URL,
});
