import axios, { AxiosRequestConfig } from "axios";
import { getSession } from "next-auth/react";
import type { Route_Types } from "../types/logs";
// let subUrl         = (sub == "" ) ? "" : "/r/"+sub;
// let limitUrl     = "limit=" + limit;
// let afterUrl     = (after == null) ? "" : "&after="+after;
// let countUrl     = (count == 0) ? "" : "&count="+count;
// let url = "https://www.reddit.com" + subUrl + "/" + sortType + "/.json?" + sortUrl + "&" + limitUrl + afterUrl + countUrl;

let ratelimit_remaining = 600;
const LOG_REQUESTS = JSON.parse(
  process?.env?.NEXT_PUBLIC_ENABLE_API_LOG ?? "false"
);
const FREE_ACCESS = JSON.parse(process?.env?.NEXT_PUBLIC_FREE_ACCESS ?? "true");
const REDDIT = "https://www.reddit.com";

export const logApiRequest = async (type: Route_Types, isOauth?: boolean) => {
  if (LOG_REQUESTS) {
    try {
      await fetch(`/api/log/increment`, {
        method: "POST",
        body: JSON.stringify({ route_type: type, is_oauth: isOauth ?? false }),
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("log error?", err);
    }
  }
};

const getToken = async () => {
  const session = await getSession();
  if (session) {
    try {
      let tokendata = await (await axios.get("/api/reddit/mytoken")).data;
      return {
        accessToken: tokendata.data.accessToken,
        refreshToken: tokendata.data.refreshToken,
        expires: tokendata.data.expires,
      };
    } catch (err) {
      //console.log(err);
      return undefined;
    }
    return undefined;
  }
};

const checkAccess = (bypass?: boolean) => {
  if (!bypass && !FREE_ACCESS) {
    throw new Error("PREMIUM REQUIRED");
  }
};

const oauthGet = async (
  accessToken: string,
  isPremium: boolean,
  method: string,
  config: AxiosRequestConfig<any>
) => {
  checkAccess(isPremium);
  const res = await axios.get(`https://oauth.reddit.com${method}`, {
    ...config,
    headers: {
      ...(config?.headers ?? {}),
      authorization: `bearer ${accessToken}`,
    },
  });
  if (res.headers["x-ratelimit-remaining"] !== undefined) {
    ratelimit_remaining = parseInt(res.headers["x-ratelimit-remaining"]);
  }
  return res;
};

//trim child data esp for initial SSG
const filterPostChildren = (children) => {
  const c = children.map((child) => ({
    kind: child?.kind,
    data: {
      all_awardings: child?.data?.all_awardings,
      archived: child?.data?.archived,
      author: child?.data?.author,
      created_utc: child?.data?.created_utc,
      crosspost_parent_list: child?.data?.crosspost_parent_list,
      distinguished: child?.data?.distinguished,
      domain: child?.data?.domain,
      downs: child?.data?.downs,
      edited: child?.data?.edited,
      gallery_data: child?.data?.gallery_data,
      hidden: child?.data?.hidden,
      hide_score: child?.data?.hide_score,
      id: child?.data?.id,
      is_self: child?.data?.is_self,
      is_video: child?.data?.is_video,
      likes: child?.data?.likes,
      link_flair_richtext: child?.data?.link_flair_richtext,
      link_flair_text: child?.data?.link_flair_text,
      link_flair_text_color: child?.data?.link_flair_text_color,
      link_flair_background_color: child?.data?.link_flair_background_color,
      locked: child?.data?.locked,
      media: child?.data?.media,
      media_embed: child?.data?.media_embed,
      media_only: child?.data?.media_only,
      media_metadata: child?.data?.media_metadata,
      name: child?.data?.name,
      no_follow: child?.data?.no_follow,
      num_comments: child?.data?.num_comments,
      num_crossposts: child?.data?.num_crossposts,
      over_18: child?.data?.over_18,
      permalink: child?.data?.permalink,
      pinned: child?.data?.pinned,
      post_hint: child?.data?.post_hint,
      preview: child?.data?.preview,
      saved: child?.data?.saved,
      score: child?.data?.score,
      secure_media: child?.data?.secure_media,
      secure_media_embed: child?.data?.secure_media_embed,
      selftext: child?.data?.selftext,
      selftext_html: child?.data?.selftext_html,
      spoiler: child?.data?.spoiler,
      sr_detail: {
        accept_followers: child?.data?.sr_detail?.accept_followers,
        banner_img: child?.data?.sr_detail?.banner_img,
        community_icon: child?.data?.sr_detail?.community_icon,
        created_utc: child?.data?.sr_detail?.created_utc,
        display_name: child?.data?.sr_detail?.display_name,
        header_img: child?.data?.sr_detail?.header_img,
        icon_img: child?.data?.sr_detail?.icon_img,
        key_color: child?.data?.sr_detail?.key_color,
        link_flair_position: child?.data?.sr_detail?.link_flair_position,
        name: child?.data?.sr_detail?.name,
        over_18: child?.data?.sr_detail?.over_18,
        primary_color: child?.data?.sr_detail?.primary_color,
        public_description: child?.data?.sr_detail?.public_description,
        quarantine: child?.data?.sr_detail?.quarantine,
        subreddit_type: child?.data?.sr_detail?.subreddit_type,
        subscribers: child?.data?.sr_detail?.subscribers,
        title: child?.data?.sr_detail?.subscribers,
        url: child?.data?.sr_detail?.url,
        user_is_banned: child?.data?.sr_detail?.user_is_banned,
        user_is_subscriber: child?.data?.sr_detail?.user_is_subscriber,
      },
      stickied: child?.data?.stickied,
      subreddit: child?.data?.subreddit,
      subreddit_id: child?.data?.subreddit_id,
      subreddit_name_prefixed: child?.data?.subreddit_name_prefixed,
      subreddit_type: child?.data?.subreddit_type,
      suggested_sort: child?.data?.suggested_sort,
      thumbnail: child?.data?.thumbnail,
      thumbnail_height: child?.data?.thumbnail_height,
      thumbnail_width: child?.data?.thumbnail_width,
      title: child?.data?.title,
      total_awards_received: child?.data?.total_awards_received,
      ups: child?.data?.ups,
      upvote_ratio: child?.data?.upvote_ratio,
      url: child?.data?.url,
      url_overridden_by_dest: child?.data?.url_url_overridden_by_dest,
    },
  }));
  //~35k byte reduction
  //console.log(new Blob([JSON.stringify(children)]).size,new Blob([JSON.stringify(c)]).size); // 38
  //console.log(JSON.stringify(children).replace(/[\[\]\,\"]/g,'').length, JSON.stringify(c).replace(/[\[\]\,\"]/g,'').length)

  return c;
};

//to reduce serverless calls to refresh token
const checkToken = async (
  loggedIn: boolean,
  token,
  skipCheck: boolean = false
) => {
  let accessToken = token?.accessToken;
  let returnToken = token;
  if (
    loggedIn &&
    (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires) &&
    !skipCheck
  ) {
    returnToken = await getToken();
    accessToken = await returnToken?.accessToken;
  }
  return {
    returnToken,
    accessToken,
  };
};

type RedditSessionPropsType = {
  loggedIn?: boolean;
  token?: { expires?: number; accessToken?: string };
};
type GenericListingPropType = {
  sort?: string;
  range?: string;
  after?: string;
  count?: number;
} & RedditSessionPropsType;
type PremiumAccessPropType = {
  isPremium?: boolean;
};

export const loadFront = async ({
  loggedIn = false,
  token,
  sort = "hot",
  range,
  after,
  count,
  localSubs,
  skipCheck = false,
  isPremium = false,
}: GenericListingPropType &
  PremiumAccessPropType & {
    skipCheck?: boolean;
    localSubs?: string[];
  }) => {
  let { returnToken, accessToken } = await checkToken(
    loggedIn,
    token,
    skipCheck
  );
  if (loggedIn && accessToken && ratelimit_remaining > 1) {
    try {
      logApiRequest("home", true);
      const res1 = await oauthGet(accessToken, isPremium, `/${sort}`, {
        headers: {
          authorization: `bearer ${accessToken}`,
        },
        params: {
          raw_json: 1,
          t: range,
          after: after,
          count: count,
          sr_detail: true,
          limit: 100
        },
      });
      let res = await res1.data;

      return {
        after: res.data.after,
        before: res.data.before,
        children: filterPostChildren(res.data.children),
        token: returnToken,
      };
    } catch (err) {
      throw err;
    }
  } else {
    let filteredsubs = localSubs?.filter((s) => s.substring(0, 2) !== "u_");
    if (filteredsubs?.length > 0) {
      return loadSubreddits({
        loggedIn,
        token,
        subreddits: filteredsubs.join("+"),
        sort,
        range,
        count,
        sr_detail: true,
        isPremium,
      });
    } else {
      try {
        logApiRequest("home", false);
        const res = await axios.get(`${REDDIT}/${sort}/.json?`, {
          params: {
            raw_json: 1,
            t: range,
            after: after,
            count: count,
            sr_detail: true,
            limit: 100
          },
        });

        const data = res.data;
        return {
          after: data.data.after,
          before: data.data.before,
          children: filterPostChildren(data.data.children),
          token: returnToken,
        };
      } catch (err) {
        throw err;
      }
    }
  }
};

export const loadSubreddits = async ({
  loggedIn = false,
  token,
  subreddits,
  sort,
  range,
  after = "",
  count = 0,
  sr_detail = false,
  isPremium,
}: GenericListingPropType &
  PremiumAccessPropType & { subreddits: string; sr_detail?: boolean }) => {
  let accessToken = token?.accessToken;
  let returnToken = token;
  if (
    loggedIn &&
    (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
  ) {
    returnToken = await getToken();
    accessToken = await returnToken?.accessToken;
  }

  let getSRDetail =
    sr_detail ||
    subreddits?.split("+")?.length > 1 ||
    subreddits?.toUpperCase()?.includes("POPULAR") ||
    subreddits?.toUpperCase()?.includes("ALL");

  if (loggedIn && accessToken && ratelimit_remaining > 1) {
    try {
      logApiRequest("r/", true);
      const res1 = await oauthGet(
        accessToken,
        isPremium,
        `/r/${subreddits}/${sort}`,
        {
          headers: {
            authorization: `bearer ${accessToken}`,
          },
          params: {
            raw_json: 1,
            t: range,
            after: after,
            count: count,
            sr_detail: getSRDetail,
            limit: 100
          },
        }
      );
      let res = await res1.data;
      return {
        after: res.data.after,
        before: res.data.before,
        children: filterPostChildren(res.data.children),
        token: returnToken,
      };
    } catch (err) {
      throw err;
    }
  } else {
    try {
      logApiRequest("r/", false);
      const res = await (
        await axios.get(`${REDDIT}/r/${subreddits}/${sort}/.json?`, {
          params: {
            raw_json: 1,
            t: range,
            after: after,
            count: count,
            sr_detail: getSRDetail,
            limit: 100
          },
        })
      ).data;
      return {
        after: res.data.after,
        before: res.data.before,
        children: filterPostChildren(res.data.children),
        token: returnToken,
      };
    } catch (err) {
      throw err;
    }
  }
};

export const getRedditSearch = async ({
  params,
  after,
  sort = "hot",
  loggedIn = false,
  subreddit = "all",
  range,
  token,
  include_over_18,
  searchtype,
  isPremium,
}: GenericListingPropType &
  PremiumAccessPropType & {
    params: { q?: string; [x: string]: string | number | boolean };
    include_over_18?: boolean;
    subreddit?: string;
    searchtype?: string;
  }) => {
  let p = {
    ...params,
    after: after,
    sort: sort,
    t: range,
    raw_json: 1,
    sr_detail: true,
  } as { q?: string; [x: string]: string | number | boolean };

  let oathsearch = `/search`;
  let noauthsearch = `${REDDIT}/search.json`;
  if (p?.q?.substring(0, 5)?.toUpperCase() === "FLAIR") {
    p.q = p.q.replaceAll(" ", "%2B").replaceAll("+", "%2B");
  }
  if (include_over_18) {
    p["include_over_18"] = "1";
  } else {
    p["include_over_18"] = "0";
  }
  if (subreddit !== "all") {
    oathsearch = `/r/${subreddit}/search/.json?q=${
      p.q
    }&sort=${sort}&restrict_sr=on&include_over_18=${
      include_over_18 ? "on" : "0"
    }&t=${range}&after=${after}`;
    noauthsearch = `https://www.reddit.com/r/${subreddit}/search/.json?q=${
      p.q
    }&sort=${sort}&restrict_sr=on&include_over_18=${
      include_over_18 ? "on" : "0"
    }&t=${range}&after=${after}`;
    p = { raw_json: 1 };
  }

  if (searchtype === "sr") {
    p["type"] = "sr";
  } else if (searchtype === "user") {
    p["type"] = "user";
  }
  //console.log(p);
  let accessToken = token?.accessToken;
  let returnToken = token;
  if (
    loggedIn &&
    (!token?.expires || Math.floor(Date.now() / 1000) > token?.expires)
  ) {
    returnToken = await getToken();
    accessToken = await returnToken?.accessToken;
  }

  if (
    loggedIn &&
    accessToken &&
    ratelimit_remaining > 1 &&
    !searchtype
    // p["include_over_18"] !== "0" //oath api doesn't respect this setting
  ) {
    try {
      //dealing with oath not respecting including_over_18 parameter
      let children = [];
      let after = "";
      let before = "";
      do {
        logApiRequest("search", true);
        const res1 = await oauthGet(accessToken, isPremium, oathsearch, {
          headers: {
            authorization: `bearer ${accessToken}`,
          },
          params: p,
        });
        let res = await res1.data;
        after = res?.data?.after;
        p["after"] = after;
        before = res?.data?.before;
        if (p["include_over_18"] === "0") {
          children = [
            ...children,
            ...res?.data?.children?.filter((c) => {
              return c.data.over_18 !== true;
            }),
          ];
        } else {
          children = res?.data?.children;
        }
      } while (
        p["include_over_18"] === "0" &&
        after &&
        children.length < 25 &&
        ratelimit_remaining > 1
      );

      return {
        after: after,
        before: before,
        children: children,
        token: returnToken,
      };
    } catch (err) {
      throw err;
    }
  } else {
    try {
      logApiRequest("search", false);
      const res = await (
        await axios.get(noauthsearch, {
          params: p,
        })
      ).data;
      //console.log(res);
      return {
        after: res.data.after,
        before: res.data.before,
        children: res.data.children,
        token: returnToken,
      };
    } catch (err) {
      // console.log(err);
      throw err;
    }
  }
};
//retiring for  getRedditSearch
export const loadSubFlairPosts = async ({
  subreddit,
  flair,
  sort = "new",
  range = "",
  after = "",
  isPremium,
}: PremiumAccessPropType & {
  subreddit: string;
  flair: string;
  sort?: string;
  range?: string;
  after?: string;
}) => {
  let f = flair.replaceAll(" ", "%2B").replaceAll("+", "%2B");
  try {
    logApiRequest("search", false);
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
    // console.log(err);
  }
};
export const getUserMultiPosts = async ({
  user,
  multiname,
  sort = "hot",
  range,
  after,
  isPremium,
}: PremiumAccessPropType & {
  user: string;
  multiname: string;
  sort?: string;
  range?: string;
  after?: string;
}) => {
  try {
    logApiRequest("u/", false);
    const res = await (
      await axios.get(`${REDDIT}/user/${user}/m/${multiname}/${sort}/.json?`, {
        params: {
          raw_json: 1,
          sort: sort,
          t: range,
          after: after,
          limit: 100,
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
export const loadSubFlairs = async ({
  subreddit,
  isPremium,
}: PremiumAccessPropType & { subreddit: string }) => {
  let token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("r/", true);
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
//oauth request
export const loadSubInfo = async ({
  subreddit,
  isPremium,
}: PremiumAccessPropType & { subreddit: string }) => {
  let token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("r/", true);
      const res = await (
        await oauthGet(token, isPremium, `/r/${subreddit}/about`, {
          headers: {
            authorization: `bearer ${token}`,
          },
          params: {},
        })
      ).data;
      return res;
    } catch (err) {
      throw err;
    }
  }
  return false;
};
//search request no auth required
export const loadSubredditInfo = async ({
  query,
  loadUser = false,
  isPremium,
}: PremiumAccessPropType & {
  query: string;
  loadUser?: boolean;
}) => {
  if (query) {
    try {
      logApiRequest(loadUser ? "u/" : "r/", false);

      const res = await (
        await axios.get(
          `${REDDIT}/${loadUser ? "user" : "r"}/${query}/about.json`,
          {
            ///search/.json?q=${query}&type=sr&include_over_18=on`, {
            params: {
              raw_json: 1,
            },
          }
        )
      ).data;
      //console.log(query, res);
      // for (let i = 0; i < res?.data?.children?.length - 1; i++){
      //   if (res?.data?.children?.[i]?.data?.display_name?.toUpperCase() === query.toUpperCase()) return res?.data?.children?.[i]?.data
      // }

      return res;
    } catch (err) {
      console.log(err);
      return undefined;
    }
  } else return undefined;
};

export const getWikiContent = async ({
  wikiquery,
  isPremium,
}: PremiumAccessPropType & {
  wikiquery: string[];
}) => {
  try {
    logApiRequest("r/", false);
    const content = await (
      await axios.get(`https://www.reddit.com/r/${wikiquery.join("/")}.json`, {
        params: { raw_json: 1 },
      })
    ).data;

    return content;
  } catch (err) {
    return undefined;
  }
};

export const favoriteSub = async ({
  favorite,
  name,
  isPremium,
}: PremiumAccessPropType & {
  favorite: boolean;
  name: string;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch("https://oauth.reddit.com/api/favorite", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `make_favorite=${favorite}&sr_name=${name}&api_type=json`,
      });
      if (res.ok) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }
};

export const subToSub = async ({
  action,
  name,
  isPremium,
}: PremiumAccessPropType & {
  action: string;
  name: string;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      //console.log(dir, id, token);
      let skip_initial_defaults = 1;
      let action_source = "o";
      if (action == "unsub") skip_initial_defaults = 0;
      logApiRequest("cud", true);
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

export const loadUserPosts = async ({
  token,
  loggedIn,
  username,
  sort = "hot",
  range,
  after = "",
  count = 0,
  type,
  isPremium,
}: PremiumAccessPropType &
  GenericListingPropType & { username: string; type?: string }) => {
  let { returnToken, accessToken } = await checkToken(loggedIn, token);
  try {
    let res;
    if (loggedIn && accessToken) {
      logApiRequest("u/", true);
      res = await (
        await oauthGet(
          accessToken,
          isPremium,
          `/user/${username}/${type ? type.toLowerCase() : ""}?sort=${sort}`,
          {
            headers: {
              authorization: `bearer ${accessToken}`,
            },
            params: {
              raw_json: 1,
              t: range,
              after: after,
              count: count,
              sr_detail: true,
              limit: 100
            },
          }
        )
      ).data;
    } else {
      logApiRequest("u/", false);
      res = await (
        await axios.get(
          `${REDDIT}/user/${username}/${
            type ? type.toLowerCase() : ""
          }.json?sort=${sort}`,
          {
            params: {
              raw_json: 1,
              t: range,
              after: after,
              count: count,
              sr_detail: true,
              limit: 100
            },
          }
        )
      ).data;
    }
    return {
      count: count + res?.data?.children?.length ?? 0,
      after: res.data?.after ?? null,
      before: res.data?.before,
      children: res?.data?.children ?? [],
      token: returnToken,
    };
  } catch (err) {
    throw err;
  }
};

export const loadUserSelf = async ({
  token,
  loggedIn,
  username,
  sort = "hot",
  range,
  after = "",
  type = "links",
  where,
  isPremium,
}: PremiumAccessPropType &
  GenericListingPropType & {
    username: string;
    where: string;
    type?: string;
  }) => {
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
      logApiRequest("u/", true);
      const res = await oauthGet(
        accessToken,
        isPremium,
        `/user/${username}/${where}`,
        {
          headers: {
            Authorization: `bearer ${accessToken}`,
          },
          params: {
            raw_json: 1,
            after: after,
            username: username,
            t: range,
            sort: sort,
            show: where,
            type: type,
            sr_detail: true,
            limit: 100
          },
        }
      );
      const data = await res.data;

      return {
        after: data.data.after,
        before: data.data.before,
        children: data.data.children,
        token: returnToken,
      };
    } catch (err) {
      throw err;
    }
  }
  return undefined;
};

export const getSubreddits = async ({
  after,
  type = "popular",
  isPremium,
}: PremiumAccessPropType & {
  after?: string;
  type?: string;
}) => {
  try {
    logApiRequest("r/", false);
    let res = await axios.get(`${REDDIT}/subreddits/${type}.json`, {
      params: { after: after, raw_json: 1, include_over_18: 1 },
    });
    let data = await res.data;
    if (data?.data?.children) {
      return { after: data?.data?.after, children: data?.data?.children };
    }
    return undefined;
  } catch (err) {}
  return undefined;
};

export const getMySubs = async ({
  after,
  count,
  isPremium,
}: PremiumAccessPropType & {
  after?: string;
  count?: boolean;
}) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      let res = await oauthGet(token, isPremium, "/subreddits/mine/subscriber", {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {
          after: after,
          before: "",
          count: count,
          limit: 100,
        },
      });
      let data = await res.data;
      if (data?.data?.children ?? false) {
        return { after: data.data.after, children: data.data.children };
      }
    } catch (err) {
      throw err;
    }
  }
  return null;
};

export const getAllMyFollows = async ({ isPremium }: PremiumAccessPropType) => {
  let alldata = [];
  let after = "";
  let count = 0;
  const token = await (await getToken())?.accessToken;
  let done = false;
  while (!done) {
    if (token && ratelimit_remaining > 1) {
      try {
        logApiRequest("cud", true);
        let res = await oauthGet(
          token,
          isPremium,
          "/subreddits/mine/subscriber",
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
        throw err;
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
  for (const a of alldata) {
    if (a?.data?.display_name?.substring(0, 2) === "u_") {
      let d = await loadSubredditInfo({
        query: a?.data?.display_name?.substring(2),
        loadUser: true,
        isPremium: isPremium,
      });
      d && users.push(d);
    } else {
      subs.push(a);
    }
  }
  return { users, subs };
};

export const getUserMultiSubs = async ({
  user,
  multi,
  isPremium,
}: PremiumAccessPropType & {
  user: string;
  multi: string;
}) => {
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await oauthGet(
        token,
        isPremium,
        `/api/multi/user/${user}/m/${multi}`,
        {
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      const data = await res.data;
      let subs = [];
      data?.data?.subreddits?.forEach((s) => {
        subs.push(s?.name);
      });
      //console.log(subs);
      return subs;
    } catch (err) {
      throw err;
    }
  }
};

export const getMyMultis = async ({ isPremium }: PremiumAccessPropType) => {
  const token = await (await getToken())?.accessToken;
  //console.log(token);
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      let res = await oauthGet(token, isPremium, "/api/multi/mine", {
        headers: {
          authorization: `bearer ${token}`,
        },
        params: {},
      });
      //console.log(res);
      let data = await res.data;
      return data;
    } catch (err) {
      throw err;
    }
  } else {
    //console.log(ratelimit_remaining, 'huh');
  }
};

export const addToMulti = async ({
  multi,
  user,
  srname,
  isPremium,
}: PremiumAccessPropType & {
  multi: string;
  user: string;
  srname: string;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch(
        `/api/reddit/multi/user/${user}/m/${multi}/r/${srname}?model=${encodeURIComponent(
          `{"name":"${srname}"}`
        )}`,
        {
          method: "PUT",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};
export const deleteFromMulti = async ({
  multi,
  user,
  srname,
  isPremium,
}: PremiumAccessPropType & {
  multi: string;
  user: string;
  srname: string;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch(
        `/api/reddit/multi/user/${user}/m/${multi}/r/${srname}?model=${encodeURIComponent(
          `{"name":"${srname}"}`
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};
export const createMulti = async ({
  display_name,
  user,
  srnames,
  visibility = "private",
  description_md,
  key_color,
  isPremium,
}: PremiumAccessPropType & {
  display_name: string;
  user: string;
  srnames: string[];
  visibility?: string;
  description_md?: string;
  key_color?: string;
}) => {
  checkAccess(isPremium);
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
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const uri = `/multi/user/${user}/m/${display_name}/?model=${encodeURIComponent(
        json
      )}`;
      const res = await fetch(`/api/reddit${uri}`, {
        method: "PUT",
        headers: {
          Authorization: `bearer ${token}`,
        },
      });
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};
export const deleteMulti = async ({
  multiname,
  username,
  isPremium,
}: { multiname: string; username: string } & PremiumAccessPropType) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch(
        `https://oauth.reddit.com/api/multi/user/${username}/m/${multiname}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `bearer ${token}`,
          },
        }
      );
      return res;
    } catch (err) {
      console.log("err", err);
    }
  }
};

export const searchSubreddits = async ({
  query,
  over18 = false,
  loggedIn = false,
  token,
  isPremium,
}: PremiumAccessPropType & {
  query: string;
  over18?: boolean;
} & RedditSessionPropsType) => {
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
      logApiRequest("search", true);
      let res = await oauthGet(
        accessToken,
        isPremium,
        "/api/subreddit_autocomplete_v2",
        {
          headers: {
            authorization: `bearer ${accessToken}`,
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
      return { data: data?.data?.children, token: returnToken };
    } catch (err) {
      throw err;
    }
  } else {
    try {
      logApiRequest("search", false);
      const res = await (
        await axios.get(`${REDDIT}/search/.json?q=${query}&type=sr`, {
          params: {
            raw_json: 1,
          },
        })
      ).data;
      return { data: res?.data?.children?.slice(0, 4), token: returnToken };
    } catch (err) {
      console.log(err);
      return undefined;
    }
    return undefined;
  }
  return undefined;
};

export const loadComments = async ({
  permalink,
  sort = "top",
  isPremium,
}: PremiumAccessPropType & {
  permalink: string;
  sort?: string;
}) => {
  try {
    //console.log(permalink);
    logApiRequest("thread", false);
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

export const loadMoreComments = async ({
  children,
  link_id,
  permalink,
  loggedIn = false,
  token,
  sort = "top",
  depth,
  id,
  isPremium,
}: PremiumAccessPropType & {
  children: string;
  link_id: string;
  permalink?: string;
  sort?: string;
  depth?: number;
  id?: string;
} & RedditSessionPropsType) => {
  let { returnToken, accessToken } = await checkToken(loggedIn, token);
  if (accessToken && ratelimit_remaining > 1) {
    try {
      logApiRequest("thread", true);
      const res = await fetch(`https://oauth.reddit.com/api/morechildren`, {
        method: "POST",
        headers: {
          Authorization: `bearer ${accessToken}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `api_type=json&children=${children}&link_id=${link_id}&sort=${sort}&limit_children=${false}&raw_json=1&&id=${id}&profile_img=${true}`, //&category=${category}
      });
      let data = await res.json();
      return { data: data?.json?.data?.things, token: returnToken };
    } catch (err) {
      console.log(err);
      return undefined;
    }
  } else {
    logApiRequest("thread", false);
    const res = await (
      await axios.get(`${REDDIT}${permalink}.json`, {
        params: { raw_json: 1, profile_img: true },
      })
    ).data;
    return { data: res?.[1]?.data?.children, token: returnToken };
  }
};

export const loadPost = async ({
  permalink,
  sort = "top",
  loggedIn = false,
  token,
  withcontext,
  withDetail = false,
  isPremium,
}: PremiumAccessPropType & {
  permalink: string;
  sort?: string;
  withcontext?: boolean;
  withDetail?: boolean;
} & RedditSessionPropsType) => {
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
    let path = permalink;
    //handle direct link case
    if (!permalink.includes("/comments/")) {
      try {
        logApiRequest("thread", false);
        const res = await (
          await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
            params: { raw_json: 1, profile_img: true, sr_detail: withDetail },
          })
        ).data;
        path = res?.[0]?.data?.children?.[0].data?.permalink;
      } catch (err) {}
    }

    try {
      logApiRequest("thread", true);
      let res = await oauthGet(accessToken, isPremium, path, {
        headers: {
          authorization: `bearer ${accessToken}`,
        },
        params: {
          raw_json: 1,
          article: path.split("/")?.[4] ?? path,
          context: withcontext ? 10000 : 1,
          showedits: true,
          showmedia: true,
          showmore: true,
          showtitle: true,
          sort: sort,
          theme: "default",
          threaded: true,
          truncate: true,
          profile_img: true,
          sr_detail: withDetail,
        },
      });
      let data = await res.data;
      const post = {
        post: data?.[0]?.data?.children?.[0]?.data,
        post_comments: data?.[1]?.data?.children,
      };
      return { ...post, token: returnToken };
    } catch (err) {
      return { post: undefined, post_comments: undefined, token: returnToken };
    }
  } else {
    try {
      logApiRequest("thread", false);
      const res = await (
        await axios.get(`${REDDIT}${permalink}.json?sort=${sort}`, {
          params: {
            raw_json: 1,
            profile_img: true,
            sr_detail: withDetail,
            context: withcontext ? 10000 : "",
          },
        })
      ).data;
      const data = {
        post: res?.[0]?.data?.children?.[0].data,
        post_comments: res?.[1]?.data?.children,
        token: returnToken,
      };
      //console.log(data);
      return data;
    } catch (err) {
      //console.log(err);
      return { post: undefined, post_comments: undefined, token: returnToken };
    }
  }
};

export const getMyID = async ({ isPremium }: PremiumAccessPropType) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  try {
    logApiRequest("cud", true);
    const res = await axios.get("https://oauth.reddit.com/api/v1/me", {
      headers: {
        authorization: `bearer ${token}`,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

export const saveLink = async ({
  category,
  id,
  isSaved,
  isPremium,
}: PremiumAccessPropType & {
  category?: string;
  id: string;
  isSaved: boolean;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch(
        `https://oauth.reddit.com/api/${isSaved ? "unsave" : "save"}`,
        {
          method: "POST",
          headers: {
            Authorization: `bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `id=${id}`, //&category=${category}
        }
      );
      if (res?.ok) {
        return { saved: isSaved ? false : true, id: id };
      } else {
        throw new Error("Unable to save");
      }
    } catch (err) {
      console.log(err);
      throw new Error("Unable to save");
    }
  }
  throw new Error("Unable to save");
};

export const hideLink = async ({
  id,
  isHidden,
  isPremium,
}: PremiumAccessPropType & {
  id: string;
  isHidden: boolean;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch(
        `https://oauth.reddit.com/api/${isHidden ? "unhide" : "hide"}`,
        {
          method: "POST",
          headers: {
            Authorization: `bearer ${token}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `id=${id}`, //&category=${category}
        }
      );
      if (res?.ok) {
        return { hidden: isHidden ? false : true, id: id };
      } else {
        throw new Error("Unable to hide");
      }
    } catch (err) {
      throw new Error("Unable to hide");
      return false;
    }
  }
  throw new Error("Unable to hide");
};

export const postVote = async ({
  isPremium,
  dir,
  id,
}: PremiumAccessPropType & { dir: number; id: string }) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    logApiRequest("cud", true);
    const res = await fetch("https://oauth.reddit.com/api/vote", {
      method: "POST",
      headers: {
        Authorization: `bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `id=${id}&dir=${dir}&rank=3`,
    });
    if (res.ok) {
      return { vote: dir, id: id };
    }
    // } catch (err) {
    //   return err;
    // }
  }
  throw new Error("Unable to vote");
};

export const postComment = async ({
  parent,
  text,
  isPremium,
}: PremiumAccessPropType & {
  parent: string;
  text: string;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch("https://oauth.reddit.com/api/comment", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `api_type=${"json"}&return_rtjson=${true}&text=${encodeURIComponent(
          text
        )}&thing_id=${parent}`,
      });
      const data = await res.json();
      if (res.ok) {
        if (data?.json?.errors) {
          throw new Error("Comment error");
        }
        return data;
      } else {
        throw new Error("Unable to comment");
      }
    } catch (err) {
      throw new Error("Unable to comment");
    }
  }
  throw new Error("Unable to comment");
};

export const editUserText = async ({
  id,
  text,
  isPremium,
}: PremiumAccessPropType & {
  id: string;
  text: string;
}) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch("https://oauth.reddit.com/api/editusertext", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `api_type=${"json"}&return_rtjson=${true}&text=${encodeURIComponent(
          text
        )}&thing_id=${id}`,
      });
      const data = await res.json();
      if (res.ok) {
        if (data?.json?.errors) {
          throw new Error("Edit text error");
        }
        return data;
      } else {
        throw new Error("Unable to edit text");
      }
    } catch (err) {
      throw new Error("Unable to edit text");
    }
  }
  throw new Error("Unable to edit text");
};

export const deleteLink = async ({
  id,
  isPremium,
}: PremiumAccessPropType & { id: string }) => {
  checkAccess(isPremium);
  const token = await (await getToken())?.accessToken;
  if (token && ratelimit_remaining > 1) {
    try {
      logApiRequest("cud", true);
      const res = await fetch("https://oauth.reddit.com/api/del", {
        method: "POST",
        headers: {
          Authorization: `bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `id=${id}`,
      });
      const data = await res.json();
      if (res.ok) {
        return data;
      } else {
        throw new Error("Unable to delete");
      }
    } catch (err) {
      throw new Error("Unable to delete");
    }
  }
  throw new Error("Unable to delete");
};

export const findDuplicates = async ({
  token,
  loggedIn,
  permalink,
  after = "",
  count = 0,
  isPremium,
}: PremiumAccessPropType & {
  permalink: string;
  after?: string;
  count?: number;
} & RedditSessionPropsType) => {
  let { returnToken, accessToken } = await checkToken(loggedIn, token);
  if (loggedIn && accessToken) {
    try {
      logApiRequest("thread", false);
      let res = await (
        await oauthGet(
          accessToken,
          isPremium,
          `${permalink?.replace("/comments/", "/duplicates/")}`,

          {
            headers: {
              authorization: `bearer ${accessToken}`,
            },
            params: {
              raw_json: 1,
              after,
              count,
            },
          }
        )
      ).data;
      //console.log("Dup:", res);
      return { res, returnToken };
    } catch (err) {
      throw err;
    }
  } else {
    try {
      logApiRequest("thread", false);
      let res = await (
        await axios.get(
          `https://www.reddit.com${permalink?.replace(
            "/comments/",
            "/duplicates/"
          )}.json`,
          {
            params: {
              raw_json: 1,
              after,
              count,
            },
          }
        )
      ).data;
      //console.log("duplo",res);
      return { res };
    } catch (err) {
      console.log("err", err);
    }
  }
};
