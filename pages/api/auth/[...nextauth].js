import NextAuth from "next-auth";
import Providers from "next-auth/providers";

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
    /**
     * @param  {object}  token     Decrypted JSON Web Token
     * @param  {object}  user      User object      (only available on sign in)
     * @param  {object}  account   Provider account (only available on sign in)
     * @param  {object}  profile   Provider profile (only available on sign in)
     * @param  {boolean} isNewUser True if new user (only available on sign in)
     * @return {object}            JSON Web Token that will be saved
     */
    async jwt(token, user, account, profile, isNewUser) {
      // Add access_token to the token right after signin
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
  },
  callbacks: {
    async jwt(token, user, account = {}, profile, isNewUser) {
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
