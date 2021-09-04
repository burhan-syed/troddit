import axios from "axios";

// let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
// let limitUrl     = "limit=" + limit;
// let afterUrl     = (after == null) ? "" : "&after="+after;
// let countUrl     = (count == 0) ? "" : "&count="+count;
// let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;

let ratelimit_remaining = 0;

const REDDIT = "https://www.reddit.com";

const getToken = async () => {
  try {
    let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
    console.log("tokendata:", tokendata);
    return {
      accessToken: tokendata.data.accessToken,
      refreshToken: tokendata.data.refreshToken,
    };
  } catch (err) {
    console.log(err);
    return undefined;
  }
};

export const loadFront = async (
  sort: string = "best",
  range?: string,
  after?: string,
  count?: number
) => {
  const token = await (await getToken())?.accessToken;

  if (token) {
    try {
      console.log("WITH LOGIN", token);
      const res = await (
        await axios.get(`https://oauth.reddit.com/${sort}`, {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            raw_json: 1,
            t: range,
            after: after,
            count: count,
          },
        })
      ).data;

      return {
        after: res.data.after,
        before: res.data.before,
        children: res.data.children,
      };
    } catch (err) {
      console.log(err);
    }
  } else {
    try {
      console.log("NO LOGIN");
      const res = await (
        await axios.get(`${REDDIT}/${sort}/.json?`, {
          params: {
            raw_json: 1,
            t: range,
            after: after,
            count: count,
          },
        })
      ).data;

      return {
        after: res.data.after,
        before: res.data.before,
        children: res.data.children,
      };
    } catch (err) {
      console.log(err);
    }
  }
};

export const loadSubreddits = async (
  subreddits: string,
  sort: string,
  range: string,
  after: string,
  count: number
) => {
  const res = await (
    await axios.get(`${REDDIT}/r/${subreddits}/${sort}/.json?`, {
      params: {
        raw_json: 1,
        t: range,
        after: after,
        count: count,
      },
    })
  ).data;
  return {
    after: res.data.after,
    before: res.data.before,
    children: res.data.children,
  };
};
