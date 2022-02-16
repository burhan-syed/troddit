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
        expires: tokendata.data.expires,
        // username: tokendata.data.username,
      };
    } catch (err) {
      //console.log(err);
      return undefined;
    }
    return undefined;
  }
};

export const loadFront = async (
  loggedIn = false,
  token?,
  sort: string = "best",
  range?: string,
  after?: string,
  count?: number,
  localSubs?: []
) => {
  //console.log('loadfront api', Math.floor(Date.now() / 1000) > token?.expires, Math.floor(Date.now() / 1000) , token?.expires)
  let accessToken = token?.accessToken;
  let returnToken = token;
  if (
    loggedIn &&
    (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
  ) {
    returnToken = await getToken();
    accessToken = await returnToken?.accessToken;
  }
  if (loggedIn && accessToken && ratelimit_remaining > 1) {
    try {
      //console.log("WITH LOGIN", token);
      const res1 = await axios.get(`https://oauth.reddit.com/${sort}`, {
        headers: {
          authorization: `bearer ${accessToken}`,
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
        token: returnToken,
      };
    } catch (err) {
      //console.log(err);
    }
  } else {
    if (localSubs?.length > 0) {
      return loadSubreddits(
        loggedIn,
        token,
        localSubs.join("+"),
        sort,
        range,
        after,
        count
      );
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
          token: token,
        };
      } catch (err) {
        //console.log(err);
      }
    }
  }
};

export const loadSubreddits = async (
  loggedIn = false,
  token,
  subreddits: string,
  sort: string,
  range: string,
  after: string = "",
  count: number = 0
) => {
  let accessToken = token?.accessToken;
  let returnToken = token;
  if (
    loggedIn &&
    (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
  ) {
    returnToken = await getToken();
    accessToken = await returnToken?.accessToken;
  }

  if (loggedIn && accessToken && ratelimit_remaining > 1) {
    try {
      //console.log("WITH LOGIN", token);
      const res1 = await axios.get(
        `https://oauth.reddit.com/r/${subreddits}/${sort}`,
        {
          headers: {
            authorization: `bearer ${accessToken}`,
          },
          params: {
            raw_json: 1,
            t: range,
            after: after,
            count: count,
          },
        }
      );
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
  }
};

export const getUserMultiPosts = async (
  user: string,
  multiname: string,
  sort = "hot",
  range?: string,
  after?: string
) => {
  try {
    const res = await (
      await axios.get(`${REDDIT}/user/${user}/m/${multiname}/${sort}/.json?`, {
        params: {
          raw_json: 1,
          sort: sort,
          t: range,
          after: after,
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

export const loadSubFlairs = async (subreddit) => {
  let token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await axios.get(
        `https://www.reddit.com/r/${subreddit}/api/link_flair_v2.json`,
        {
          params: {
            raw_json: 1,
          },
        }
      );
      return res;
    } catch (err) {
      console.log(err);
      return false;
    }
  }
};
export const loadSubFlairPosts = async (
  subreddit,
  flair: string,
  sort = "new",
  range = "",
  after = ""
) => {
  let f = flair.replaceAll(" ", "%2B").replaceAll("+", "%2B");
  //
  try {
    const res = await axios.get(
      `https://www.reddit.com/r/${subreddit}/search/.json?q=${f}&sort=${sort}&restrict_sr=on&include_over_18=on&t=${range}&after=${after}`,
      {
        params: {
          raw_json: 1,
          // q: f,
          // sort: sort,
          // t: range,
          // restrict_sr: "on",
          // include_over_18: "on",
        },
      }
    );
    let data = await res.data;
    return {
      after: data?.data?.after,
      before: data?.data?.before,
      children: data?.data?.children,
    };
  } catch (err) {
    console.log(err);
  }
};
//oauth request
export const loadSubInfo = async (subreddit) => {
  let token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await (
        await axios.get(`https://oauth.reddit.com/r/${subreddit}/about`, {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {},
        })
      ).data;
      return res;
    } catch (err) {
      return false;
    }
  }
  return false;
};
//search request no auth required
export const loadSubredditInfo = async (query) => {
  if (query) {
    try {
      const res = await (
        await axios.get(`${REDDIT}/r/${query}/about.json`, {
          ///search/.json?q=${query}&type=sr&include_over_18=on`, {
          params: {
            raw_json: 1,
          },
        })
      ).data;
      //console.log(query, res);
      // for (let i = 0; i < res?.data?.children?.length - 1; i++){
      //   if (res?.data?.children?.[i]?.data?.display_name?.toUpperCase() === query.toUpperCase()) return res?.data?.children?.[i]?.data
      // }

      return res?.data;
    } catch (err) {
      console.log(err);
      return [];
    }
  } else return [];
};

export const subToSub = async (action, name) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      //console.log(dir, id, token);
      let skip_initial_defaults = 1;
      let action_source = "o";
      if (action == "unsub") skip_initial_defaults = 0;
      const res = await fetch("https://oauth.reddit.com/api/subscribe", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `action=${action}&action_source=${action_source}&sr=${name}&skip_initial_defaults=${skip_initial_defaults}`,
      });

      if (res.ok) {
        //console.log(res);
        return true;
      } else {
        return false;
      }
    } catch (err) {
      //console.log(err);
      return false;
    }
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
  let c = 0;
  let filtered_children = [];
  let nextafter = after;
  while (c < 2 && filtered_children.length < 20 && (nextafter || c === 0)) {
    c = c + 1;
    try {
      const res = await (
        await axios.get(
          `${REDDIT}/user/${username}/submitted.json?sort=${sort}`,
          {
            params: {
              raw_json: 1,
              t: range,
              after: nextafter,
              count: count,
            },
          }
        )
      ).data;
      //console.log(res, after);
      filtered_children = [
        ...filtered_children,
        ...res.data.children.filter((child) => child?.kind === "t3"),
      ];
      //console.log(c, nextafter, filtered_children.length, res?.data?.after)
      if (filtered_children.length > 19) {
        return {
          after: res.data?.after,
          before: res.data?.before,
          children: filtered_children,
        };
      }
      nextafter = res?.data?.after;
    } catch (err) {
      //console.log(err);
      return null;
    }
  }
  if (filtered_children.length > 0) {
    return {
      after: null,
      children: filtered_children,
    };
  }
  return null;
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

export const getAllMyFollows = async () => {
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
  //split subs and users
  let users = [];
  let subs = [];
  alldata.forEach((a) => {
    if (a?.data?.url?.substring(0, 6) === "/user/") {
      users.push(a);
    } else {
      subs.push(a);
    }
  });
  return { users, subs };
};

export const getUserMultiSubs = async (user: string, multi: string) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await axios.get(
        `https://oauth.reddit.com/api/multi/user/${user}/m/${multi}`,
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      const data = await res.data;
      let subs = [];
      data?.data?.subreddits?.forEach((s) => {
        subs.push(s?.name);
      });
      //console.log(subs);
      return subs;
    } catch (err) {
      console.log("err", err);
    }
  }
};

export const getMyMultis = async () => {
  const token = await (await getToken())?.accessToken;
  //console.log(token);
  if (token && ratelimit_remaining > 1) {
    try {
      let res = await axios.get("https://oauth.reddit.com/api/multi/mine", {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {},
      });
      //console.log(res);
      let data = await res.data;
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      return data;
    } catch (err) {
      console.log(err);
    }
  } else {
    //console.log(ratelimit_remaining, 'huh');
  }
};

export const addToMulti = async (
  multi: string,
  user: string,
  srname: string
) => {
  //console.log(multi, user, srname);
  const token = await (await getToken())?.accessToken;
  //console.log(
  //   `https://oauth.reddit.com/api/multi/user/${user}/m/${multi}/r/${srname}?model={"name":"${srname}"}`
  // );
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await fetch(
        `https://oauth.reddit.com/api/multi/user/${user}/m/${multi}/r/${srname}?model={"name":"${srname}"}`,
        {
          method: "PUT",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      //ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};
export const deleteFromMulti = async (
  multi: string,
  user: string,
  srname: string
) => {
  //console.log(multi, user, srname);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await fetch(
        `https://oauth.reddit.com/api/multi/user/${user}/m/${multi}/r/${srname}?model={"name":"${srname}"}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      //ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};
export const createMulti = async (
  display_name: string,
  user: string,
  srnames: string[],
  visibility = "private",
  description_md?: string,
  key_color?: string
) => {
  // {
  //   "description_md": raw markdown text,
  //   "display_name": a string no longer than 50 characters,
  //   "icon_img": one of (`png`, `jpg`, `jpeg`),
  //   "key_color": a 6-digit rgb hex color, e.g. `#AABBCC`,
  //   "subreddits": [
  //     {
  //       "name": subreddit name,
  //     },
  //     ...
  //   ],
  //   "visibility": one of (`private`, `public`, `hidden`),
  // }
  const subreddits = srnames.map((s) => {
    return `{"name": "${s}"}`;
  });
  const json = `{"description":"","display_name":"${display_name}","icon_img":"https://www.redditstatic.com/custom_feeds/custom_feed_default_4.png", "subreddits": [${subreddits}], "visibility":"${visibility}"}`;
  //console.log(json);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await fetch(
        `https://oauth.reddit.com/api/multi/user/${user}/m/${display_name}/?model=${json}`,
        {
          method: "PUT",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      //ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      //console.log(res);
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};
export const deleteMulti = async (multiname, username) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      const res = await fetch(
        `https://oauth.reddit.com/api/multi/user/${username}/m/${multiname}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      //ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      //console.log(res);
      return res;
    } catch (err) {
      console.log("err", err);
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
      console.log(err);
      return [];
    }
  } else {
    try {
      const res = await (
        await axios.get(`${REDDIT}/search/.json?q=${query}&type=sr`, {
          params: {
            raw_json: 1,
          },
        })
      ).data;
      return res?.data?.children?.slice(0, 4);
    } catch (err) {
      console.log(err);
      return [];
    }
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
    //console.log(permalink);
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

export const loadPost = async (
  permalink,
  sort = "top",
  loggedIn = false,
  token?
) => {
  let accessToken = token?.accessToken;
  let returnToken = token;
  //const token = await (await getToken())?.accessToken;
  if (
    loggedIn &&
    (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
  ) {
    returnToken = await getToken();
    accessToken = await returnToken?.accessToken;
  }
  if (loggedIn && accessToken && ratelimit_remaining > 1) {
    try {
      //console.log(permalink.split('/'));
      let res = await axios.get(`https://oauth.reddit.com/${permalink}`, {
        headers: {
          authorization: `bearer ${accessToken}`,
        },
        params: {
          raw_json: 1,
          article: permalink.split("/")?.[4],
          context: 4,
          showedits: true,
          showmedia: true,
          showmore: true,
          showtitle: true,
          sort: sort,
          theme: "default",
          threaded: true,
          truncate: true,
        },
      });
      let data = await res.data;
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      //console.log(data);
      const post = {
        post: data?.[0]?.data?.children?.[0]?.data,
        comments: data?.[1]?.data?.children,
      };
      //console.log(data);
      return { ...post, token: returnToken };
    } catch (err) {
      return { post: undefined, comments: undefined, token: returnToken };
    }
  } else {
    try {
      const res = await (
        await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
          params: { raw_json: 1 },
        })
      ).data;
      //console.log(res);
      const data = {
        post: res?.[0]?.data?.children?.[0].data,
        comments: res?.[1]?.data?.children,
        token: returnToken,
      };
      //console.log(data);
      return data;
    } catch (err) {
      console.log(err);
      return { post: undefined, comments: undefined, token: returnToken };
    }
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

export const postComment = async (parent, text) => {
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
};

export const getUserVotes = async () => {
  const data = await getToken();
  const token = await data.accessToken;
  const username = "talezus"; //await data.username;

  if (token && ratelimit_remaining > 1) {
    try {
      const res = await fetch(
        `https://oauth.reddit.com/user/${username}/upvoted`,
        {
          method: "GET",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      console.log(res);
    } catch (err) {
      console.log(err);
      return false;
    }
  }
};

export const getMyVotes = async () => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      let res = await axios.get(
        "https://oauth.reddit.com/user/talezus/upvoted",
        {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {
            context: 2,
            sort: "new",
            type: "links",
            username: "talezus",
            limit: 10,
          },
        }
      );
      let data = await res.data;
      //console.log(data);
      ratelimit_remaining = res.headers["x-ratelimit-remaining"];
      if (data?.data?.children ?? false) {
        return { after: data.data.after, children: data.data.children };
      }
    } catch (err) {
      console.log("err:", err);
    }
  }
  return null;
};
