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
  let refresh = true;

  let refreshtoken = "";
  if (token?.reddit?.refreshToken) {
    refreshtoken = token?.reddit?.refreshToken;
  } else if (token?.refreshToken) {
    refreshtoken = token.refreshToken;
  } else if (token?.refresh_token) {
    refreshtoken = token.refresh_token;
  } else {
    refresh = false;
    //console.log("FAILED TO FIND REFRESH TOKEN");
  }
  if (refresh) {
    const authvalue = `${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`;

    try {
      const url =
        "https://www.reddit.com/api/v1/access_token?" +
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshtoken,
        });

      const response = await fetch(url, {
        headers: {
          Authorization: `Basic ${b2a(authvalue)}`,
        },
        method: "POST",
      });

      const refreshedTokens = await response.json();
      //console.log("refreshed token", refreshedTokens);
      if (!response.ok) {
        throw refreshedTokens;
      }

      return {
        ...token,
        reddit: {
          accessToken: refreshedTokens.access_token ?? token.reddit.accessToken, //fallback to old access token
          refreshToken:
            refreshedTokens.refresh_token ?? token.reddit.refreshToken, //fall back to old refresh token
        },
        //iat: Math.floor(Date.now() / 1000),
        expires: Math.floor(Date.now() / 1000) + refreshedTokens.expires_in,
      };
    } catch (error) {
      //console.log(error);
      //console.log("errored");
      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }
  }
  return token;
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
      scope:
        "identity mysubreddits read vote submit report save subscribe history", //Check Reddit API Documentation for more. The identity scope is required.
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

  jwt: {
    signingKey: process.env.JWT_SIGNING_PRIVATE_KEY,
    // You can also specify a public key for verification if using public/private key (but private only is fine)  // verificationKey: process.env.JWT_SIGNING_PUBLIC_KEY,
    // If you want to use some key format other than HS512 you can specify custom options to use  // when verifying (note: verificationOptions should include a value for maxTokenAge as well).  // verificationOptions = {  //   maxTokenAge: `${maxAge}s`, // e.g. `${30 * 24 * 60 * 60}s` = 30 days  //   algorithms: ['HS512']  // }
  },

  callbacks: {
    async jwt(token, user, account = {}, profile, isNewUser) {
      // console.log("JWT CALLBACK", token, user, account, profile, isNewUser);
      // console.log(Math.floor(Date.now() / 1000));
      // console.log(token.expires);
      // console.log(Math.floor(Date.now() / 1000) - token?.expires);
      if (!token.expires || Math.floor(Date.now() / 1000) > token.expires) {
        token = await refreshAccessToken(token);
        //console.log(token);
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
