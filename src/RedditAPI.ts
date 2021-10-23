import axios from "axios";
import { getSession } from "next-auth/client";
import { json } from "stream/consumers";

// let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
// let limitUrl     = "limit=" + limit;
// let afterUrl     = (after == null) ? "" : "&after="+after;
// let countUrl     = (count == 0) ? "" : "&count="+count;
// let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;

let ratelimit_remaining = 600;

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
      //console.log(err);
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
  if (token && ratelimit_remaining > 1) {
    try {
      //console.log("WITH LOGIN", token);
      const res1 = await axios.get(`https://oauth.reddit.com/${sort}`, {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {
          raw_json: 1,
          t: range,
          after: after,
          count: count,
        },
      });
      let res = await res1.data;
      ratelimit_remaining = res1.headers["x-ratelimit-remaining"];

      return {
        after: res.data.after,
        before: res.data.before,
        children: res.data.children,
      };
    } catch (err) {
      //console.log(err);
    }
  } else {
    try {
      //console.log("NO LOGIN");
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
      //console.log(err);
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
  //console.log(subreddits, sort, range);
  try {
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
  } catch (err) {
    return null;
  }
};

export const loadUserPosts = async (
  username: string,
  sort: string = "hot",
  range: string,
  after: string = "",
  count: number = 0
) => {
  //console.log(subreddits, sort, range);
  try {
    const res = await (
      await axios.get(`${REDDIT}/user/${username}/.json?sort=${sort}`, {
        params: {
          raw_json: 1,
          t: range,
          after: after,
          count: count,
        },
      })
    ).data;
    //console.log(res);
    const filtered_children = res.data.children.filter(child => (child?.kind === "t3"))
    return {
      after: res.data.after,
      before: res.data.before,
      children: filtered_children,
    };
  } catch (err) {
    //console.log(err);
    return null;
  }
};

export const getMySubs = async (after?, count?) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      let res = await axios.get(
        "https://oauth.reddit.com/subreddits/mine/subscriber",
        {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            after: after,
            before: "",
            count: count,
            limit: 100,
          },
        }
      );
      let data = await res.data;
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      if (data?.data?.children ?? false) {
        return { after: data.data.after, children: data.data.children };
      }
    } catch (err) {
      //console.log(err);
    }
  }
  return null;
};

export const getAllMySubs = async () => {
  let alldata = [];
  let after = "";
  let count = 0;
  const token = await (await getToken())?.accessToken;
  let done = false;
  while (!done) {
    if (token && ratelimit_remaining > 1) {
      try {
        let res = await axios.get(
          "https://oauth.reddit.com/subreddits/mine/subscriber",
          {
            headers: {
              authorization: `bearer ${token}`,
            },
            params: {
              after: after,
              before: "",
              count: count,
              limit: 100,
            },
          }
        );
        let data = await res.data;
        ratelimit_remaining = res.headers["x-ratelimit-remaining"];
        if (data?.data?.children ?? false) {
          alldata = [...alldata, ...data.data.children];
          if (data?.data?.after ?? false) {
            after = data.data.after;
          } else {
            done = true;
          }
        } else {
          done = true;
        }
      } catch (err) {
        done = true;
        //console.log(err);
      }
    } else {
      done = true;
    }
  }
  alldata = alldata.sort((a, b) =>
    a.data.display_name.localeCompare(b.data.display_name)
  );
  return alldata;
};

export const getMyMultis = async () => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      let res = await axios.get("https://oauth.reddit.com//api/multi/mine", {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {},
      });
      //console.log(data);
      let data = await res.data;
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      return data;
    } catch (err) {
      //console.log(err);
    }
  }
};

export const searchSubreddits = async (query, over18 = false) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      let res = await axios.get(
        "https://oauth.reddit.com/api/subreddit_autocomplete_v2",
        {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            include_over_18: over18,
            include_profiles: false,
            query: query,
            typeahead_active: true,
          },
        }
      );
      let data = await res.data;
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      //console.log(res);
      return data?.data?.children ?? [];
    } catch (err) {
      //console.log(err);
    }
  } else {
    return [];
  }
  return [];
};

const loadAll = async (func) => {
  let after = "";
  let done = false;
  let data = [];
  const token = await (await getToken())?.accessToken;
};

export const loadComments = async (permalink, sort = "top") => {
  try {
    console.log(permalink);
    const res = await (
      await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
        params: {
          raw_json: 1,
        },
      })
    ).data;
    //console.log(res?.[1]);
    return res?.[1]?.data?.children ?? null;
  } catch (err) {
    //console.log(err);
  }
};

export const loadMoreComments = async (
  children,
  link_id,
  sort = "top",
  depth?,
  id?
) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await axios.get("https://oauth.reddit.com/api/morechildren", {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {
          api_type: "json",
          children: children,
          link_id: link_id,
          sort: sort,
          limit_children: false,
          raw_json: 1,
        },
      });
      let data = await res.data;
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      //console.log(res?.json?.data?.things);
      return data?.json?.data?.things;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
};

export const loadPost = async (permalink) => {
  try {
    const res = await (
      await axios.get(`${REDDIT}${permalink}.json?sort=top`, {
        params: { raw_json: 1 },
      })
    ).data;
    const data = {
      post: res?.[0]?.data?.children?.[0].data,
      comments: res?.[1]?.data?.children,
    };
    //console.log(data);
    return data;
  } catch (err) {
    console.log(err);
  }
};

export const getMyID = async () => {
  const token = await (await getToken())?.accessToken;
  try {
    const res = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: {
        authorization: `bearer ${token}`,
      },
    });
    console.log(res);
  } catch (err) {
    console.log(err);
  }
};

export const postVote = async (dir: number, id) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      //console.log(dir, id, token);
      const res = await fetch("https://oauth.reddit.com/api/vote", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${id}&dir=${dir}&rank=3`,
      });

      if (res.ok) {
        //console.log(res);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      return false;
    }
  }
};

export const postComment = async(parent, text) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      //console.log(parent, text, token);
      const res = await fetch("https://oauth.reddit.com/api/comment", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `api_type=${"json"}&return_rtjson=${true}&text=${text}&thing_id=${parent}`,
      });

      if (res.ok) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      return false;
    }
  }
  return false;
}
