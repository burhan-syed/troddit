import NextAuth from "next-auth";
import Providers from "next-auth/providers";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    // Providers.Reddit({
    //   clientId: process.env.REDDIT_CLIENT_ID,
    //   clientSecret: process.env.REDDIT_CLIENT_SECRET,
    // }),
    // ...add more providers here
    {
        id: "reddit",
        name: "Reddit",
        clientId: process.env.REDDIT_CLIENT_ID,
        clientSecret: process.env.REDDIT_CLIENT_SECRET,
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
          }
        },
      },
  ],

  // A database is optional, but required to persist accounts in a database
  database: process.env.DATABASE_URL,
});
