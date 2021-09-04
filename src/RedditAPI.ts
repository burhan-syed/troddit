import axios from "axios";
import { getSession } from "next-auth/client";

// let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
// let limitUrl     = "limit=" + limit;
// let afterUrl     = (after == null) ? "" : "&after="+after;
// let countUrl     = (count == 0) ? "" : "&count="+count;
// let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;

let ratelimit_remaining = 0;

const REDDIT = "https://www.reddit.com";

const getToken = async () => {
  const session = await getSession();
  if (session) {
    try {
      let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
      //console.log("tokendata:", tokendata);
      return {
        accessToken: tokendata.data.accessToken,
        refreshToken: tokendata.data.refreshToken,
      };
    } catch (err) {
      console.log(err);
      return undefined;
    }
    return undefined;
  }
};

export const loadFront = async (
  sort: string = "best",
  range?: string,
  after?: string,
  count?: number
) => {
  let token = await (await getToken())?.accessToken;

  if (token) {
    try {
      //console.log("WITH LOGIN", token);
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
  after: string = "",
  count: number = 0
) => {
  console.log(subreddits, sort, range);

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

export const getSubs = async (after?, count?) => {
  const token = await (await getToken())?.accessToken;

  try {
    let data = await (
      await axios.get("https://oauth.reddit.com/subreddits/mine/subscriber", {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {
          after: after,
          before: "",
          count: count,
        },
      })
    ).data;
    if (data?.data?.children ?? false) {
      return { after: data.data.after, children: data.data.children };
    }
  } catch (err) {
    console.log(err);
  }
};

export const searchSubreddits = async (query, over18 = true) => {
  const token = await (await getToken()).accessToken;
  if (token) {
    try {
      let res = await (
        await axios.get("https://oauth.reddit.com/api/subreddit_autocomplete", {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            include_over_18: over18,
            include_profiles: false,
            query: query,
            typeahead_active: true,
          },
        })
      ).data;
      return res.subreddits;
    } catch (err) {
      console.log(err);
    }
  } else {
    return [{ name: query }, { name: "Login for autocomplete" }];
  }
  return [];
};
