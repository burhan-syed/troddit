import axios from "axios";
import snoowrap from "snoowrap";
import { b2a } from "../accessToken";

export const fetchAnonymousToken = async (anonymousClientID) => {
  const form = new FormData();
  form.set("grant_type", "https://oauth.reddit.com/grants/installed_client");
  form.set("device_id", "DO_NOT_TRACK_THIS_DEVICE");
  return fetch("https://www.reddit.com/api/v1/access_token", {
    method: "post",
    body: form,
    headers: { authorization: `Basic ${b2a(anonymousClientID + ":")}` },
    credentials: "omit",
  })
    .then((response) => response.text())
    .then(JSON.parse)
    .then((tokenInfo) => tokenInfo.access_token)
    .then((anonymousToken) => {
      const anonymousSnoowrap = new snoowrap({
        accessToken: anonymousToken,
        userAgent: "myreddit viewer",
      });
      anonymousSnoowrap.config({ proxies: false, requestDelay: 1000 });
      return anonymousSnoowrap;
    });
};

export const fetchFrontPage = async (token?: string, sort?: string) => {
  if (token) {
  } else {
    //default front page
    try {
      const res = await axios.get(`https://wwww.reddit.com/.json`, {
        params: {
          raw_json: 1,
        },
      });

      const posts = [];
      res.data.data.children.forEach((post) => {
        const apost = {
          ...[post.data],
        };
        posts.push(apost);
      });
      console.log(posts);
      return posts;
    } catch (err) {
      console.log(err);
    }
  }
};
