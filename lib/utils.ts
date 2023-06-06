import {
  localRead,
  localSeen,
  subredditFilters,
  userFilters,
} from "../src/MainContext";
import { GalleryInfo, ImageInfo, MediaInfo, VideoInfo } from "../types";

const DOMAIN = "www.troddit.com";
export const secondsToTime = (
  seconds,
  verbiage = [
    " seconds ago",
    " minutes ago",
    " hours ago",
    " days ago",
    " months ago",
    " years ago",
  ]
) => {
  let t = Math.floor(Math.floor(Date.now() / 1000) - seconds);
  if (t < 60) return `${t}${verbiage[0]}`;
  t = Math.ceil(t / 60);
  if (t < 60) return `${t}${verbiage[1]}`;
  t = Math.ceil(t / 60);
  if (t < 72) return `${t}${verbiage[2]}`;
  t = Math.floor(t / 24);
  if (t < 30) return `${t}${verbiage[3]}`;
  t = Math.floor(t / 30);
  if (t < 24) return `${t}${verbiage[4]}`;
  t = Math.floor(t / 12);
  return `${t}${verbiage[5]}`;
};

export const secondsToHMS = (e, del = ":") => {
  if (e <= 0) return "0.00";
  let h: any = Math.floor(e / 3600);
  if (h > 0) {
    h = h.toString().padStart(2, "0");
  } else {
    h = "";
  }
  let m = Math.floor((e % 3600) / 60).toString();
  //.padStart(2, "0");
  let s = Math.floor(e % 60)
    .toString()
    .padStart(2, "0");

  return (h !== "" ? `${h}${del}` : "") + m + del + s;
  //return `${h}:${m}:${s}`;
};

export const secondsToDate = (seconds) => {
  let date = new Date(seconds * 1000);
  let month = date.toLocaleDateString("en-US", { month: "long" });
  let day = date.toLocaleDateString("en-US", { day: "numeric" });
  let year = date.toLocaleDateString("en-US", { year: "numeric" });
  return `${month} ${day}, ${year}`;
};
export const numToString = (x: number, max = 10000) => {
  let suffix = "k";
  if (x < max) {
    return x.toString();
  } else {
    let y = x / 1000;
    if (y > 1000) {
      y = y / 1000;
      suffix = "m";
    }
    let z = y.toFixed(1);
    return z.toString() + suffix;
  }
};

export const checkVersion = (a, b) => {
  const x = a.split(".").map((e) => parseInt(e, 10));
  const y = b.split(".").map((e) => parseInt(e, 10));

  for (const i in x) {
    y[i] = y[i] || 0;
    if (x[i] === y[i]) {
      continue;
    } else if (x[i] > y[i]) {
      return 1;
    } else {
      return -1;
    }
  }
  return y.length > x.length ? -1 : 0;
};

export function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    var later = function () {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
}

export const fixCommentFormat = async (comments) => {
  if (comments?.length > 0) {
    let basedepth = comments[0].data.depth;

    let idIndex = new Map();
    comments.forEach((comment) => {
      idIndex.set(`t1_${comment.data.id}`, comment);
    });
    await comments.forEach((comment, i) => {
      let c = idIndex.get(comment.data.parent_id);
      if (c && c.data.replies?.data?.children) {
        c.data.replies.data.children.push(comment);
      } else if (c) {
        c.data.replies = {
          kind: "Listing",
          data: {
            children: [comment],
          },
        };
      }
      c && idIndex.set(comment.data.parent_id, c);
    });

    let fixedcomments = [] as any[];
    idIndex.forEach((comment, i) => {
      if (comment?.data?.depth === basedepth) {
        fixedcomments.push(comment);
      } else {
      }
    });
    return fixedcomments;
  }
  return comments;
};

export const findGreatestsImages = (images: GalleryInfo[], maxheight = 0) => {
  let fImages = [] as any[];

  if (maxheight > 0) {
    images.forEach((img, i) => {
      if (img?.media?.[0]?.height > maxheight) {
        let ratio = maxheight / img?.media?.[0]?.height;
        fImages.push({
          ...img,
          caption: img?.caption,
          src: img?.media?.[0]?.src,
          height: Math.floor(img?.media?.[0]?.height * ratio),
          width: Math.floor(img?.media?.[0]?.width * ratio),
        });
      } else {
        fImages.push({
          ...img,
          src: img?.media?.[0]?.src,
          height: img?.media?.[0]?.height,
          width: img?.media?.[0]?.width,
        });
      }
    });
  } else {
    fImages = images;
  }

  let tallest = fImages[0];
  let widest = fImages[0];
  let ratio = fImages[0];
  fImages.forEach((img, i) => {
    if (img.height > tallest?.height) {
      tallest = img;
    }
    if (img.width > widest?.width) {
      widest = img;
    }
    if (img.height / img.width > ratio.height / ratio.width) {
      ratio = img;
    }
  });

  return { tallest, widest, ratio, fImages };
};

export const findOptimalImageIndex = (
  images: any[],
  params: {
    fullRes;
    postMode;
    context: { saveWideUI; cardStyle; columns };
    windowWidth;
    containerDims?;
  }
) => {
  const { postMode, fullRes, containerDims, windowWidth, context } = params;
  let num = images?.length - 1;
  let done = false;
  let width = windowWidth;
  if (!fullRes) {
    if (containerDims?.[0]) {
      width = containerDims?.[0];
    } else if (
      !context.saveWideUI &&
      context.cardStyle !== "row1" &&
      (context.columns === 1 || postMode)
    ) {
      width = 768; //3xl width
    } else if (postMode) {
      width = windowWidth;
    } else {
      width = width / (context?.columns ?? 1);
    }
    images.forEach((img, i) => {
      if (!done) {
        if (img.width > width) {
          num = i;
          done = true;
        }
      }
    });
  }
  return num;
};

export const findMediaInfo = async (
  post,
  quick = false,
  domain = DOMAIN
): Promise<MediaInfo> => {
  let videoInfo: VideoInfo[];
  let imageInfo: ImageInfo[];
  let thumbnailInfo: ImageInfo;
  let iFrameHTML: Element;
  let galleryInfo: GalleryInfo[]; // = [];
  let isPortrait = undefined as unknown as boolean;
  let isImage = false;
  let isGallery = false;
  let isVideo = false;
  let isLink = true;
  let isSelf = false; //self text post
  let isTweet = false;
  let isYTVid = false;
  let isIframe = false;
  let hasMedia = false;
  let isDual = false;

  let dimensions: [number, number] = [0, 0]; //x,y pixels

  const loadInfo = async (post, quick = false) => {
    let a = await findVideo(post);
    if (a) {
      isVideo = true;
      dimensions[0] = videoInfo[0].width;
      dimensions[1] = videoInfo[0].height;
    } else {
      let b = await findImage(post, quick);
      if (b) {
        //isImage = true;
        if (galleryInfo?.[0]?.media?.[0]?.height > 0) {
          isImage = true;
          //just setting dimensions to first gallery image for now
          dimensions[0] = galleryInfo?.[0]?.media?.[0]?.width;
          dimensions[1] = galleryInfo?.[0]?.media?.[0]?.height;
        } else if (imageInfo) {
          //last item would be highest resolution
          if (
            post?.domain?.includes("redd.it") ||
            post?.domain?.includes("imgur")
          ) {
            isImage = true;
          }
          dimensions[0] = imageInfo[imageInfo.length - 1].width;
          dimensions[1] = imageInfo[imageInfo.length - 1].height;
        }
      }
    }

    if (!quick) {
      let i = await findIframe(post);
      if (i) {
        isIframe = true;
        hasMedia = true;
      }
    }

    if (
      post.thumbnail === "self" ||
      post.is_self ||
      post?.domain?.includes("self") ||
      post?.selftext_html
    ) {
      isSelf = true;
    }
    if (
      post?.domain?.includes("redd.it") ||
      post?.domain?.includes("reddit") ||
      post?.domain?.includes("self.") ||
      post?.url?.includes("imgur") ||
      isVideo ||
      isGallery ||
      isSelf
    ) {
      isLink = false;
    }
    let domainEnd = post?.url?.split("?")?.[0]?.split(".")?.[
      post?.url?.split("?")?.[0]?.split(".")?.length - 1
    ];
    //console.log(domainEnd);
    if (
      (domainEnd === "jpg" || domainEnd === "png" || domainEnd === "gif") &&
      dimensions[0] > 0
    ) {
      isLink = false;
      isImage = true;
    }
    //portrait && media check
    if (dimensions[0] > 0) {
      hasMedia = true;
      if (dimensions[1] >= dimensions[0]) {
        isPortrait = true;
      } else if (dimensions[1] < dimensions[0]) {
        isPortrait = false;
      }
    }

    if (
      isSelf &&
      hasMedia &&
      (post?.preview?.enabled || isVideo || isGallery || isTweet)
    ) {
      isDual = true;
    }

    if (post?.url?.includes("youtube.com") || post?.url?.includes("youtu.be")) {
      isYTVid = true;
    }

    return {
      videoInfo,
      imageInfo,
      thumbnailInfo,
      iFrameHTML,
      galleryInfo,
      isPortrait,
      isImage,
      isGallery,
      isVideo,
      isTweet,
      isIframe,
      isLink,
      isSelf,
      dimensions,
      hasMedia,
      isDual,
      isYTVid,
    };
  };

  const checkURL = (url) => {
    const placeholder =
      "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"; //"http://goo.gl/ijai22";
    if (!url?.includes("https://")) return placeholder;
    return url;
  };

  const findGfy = async (id, post) => {
    let req = await fetch(`https://api.gfycat.com/v1/gfycats/${id}`);
    if (req?.ok) {
      let data = await req.json();
      videoInfo = [
        {
          src: data["gfyItem"]["mp4Url"],
          height: data["gfyItem"]["height"],
          width: data["gfyItem"]["width"],
          hasAudio: data["gfyItem"]["hasAudio"],
        },
      ];
      if (data["gfyItem"]["mobileUrl"]) {
        videoInfo.push({
          src: data["gfyItem"]["mobileUrl"],
          height: data["gfyItem"]["height"],
          width: data["gfyItem"]["width"],
          hasAudio: data["gfyItem"]["hasAudio"],
        });
      }
      findImage(post);
      isVideo = true;
      return true;
    } else {
      findVideo(post, true);
    }
  };

  const findVideo = async (post, skipGfy = false) => {
    if (
      post?.url_overridden_by_dest?.includes("https://gfycat.com") &&
      post?.url_overridden_by_dest?.split("/")?.[3] &&
      !skipGfy
    ) {
      let res = await findGfy(
        post?.url_overridden_by_dest?.split("/")?.[3],
        post
      );
      return res;
    }
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        videoInfo = [
          {
            hlsSrc: post.preview?.reddit_video?.hls_url,
            src: post.preview.reddit_video_preview.fallback_url,
            height: post.preview.reddit_video_preview.height,
            width: post.preview.reddit_video_preview.width,
            duration: post.preview.reddit_video_preview?.duration,
          },
        ];

        (thumbnailInfo = {
          src: checkURL(post?.thumbnail),
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        }),
          await findImage(post, true);
        isVideo = true;
        return true;
        //setLoaded(true);
      }
      //gifs are stored as mp4s here, also with resolutions but just using source for now
      else if (post?.preview?.images?.[0]?.variants?.mp4) {
        videoInfo = [
          {
            src: checkURL(
              post?.preview?.images?.[0]?.variants?.mp4?.source?.url
            ),
            height: post?.preview?.images?.[0]?.variants?.mp4?.source?.height,
            width: post?.preview?.images?.[0]?.variants?.mp4?.source?.width,
          },
        ];

        thumbnailInfo = {
          src: checkURL(post?.preview?.images?.[0]?.source?.url),
          height: post?.preview?.images?.[0]?.source?.height,
          width: post?.preview?.images?.[0]?.source?.width,
        };

        await findImage(post, true);
        isVideo = true;
        return true;
      }
    }
    if (post.media) {
      if (post.media.reddit_video) {
        videoInfo = [
          {
            hlsSrc: post.media?.reddit_video?.hls_url,
            src: post.media.reddit_video.fallback_url,
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
            duration: post.media?.reddit_video?.duration,
          },
        ];
        (thumbnailInfo = {
          src: checkURL(post?.thumbnail),
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        }),
          await findImage(post, true);
        isVideo = true;
        return true;
      }
    }

    return false;
  };

  const findImage = async (post, quick = false) => {
    if (
      post?.url_overridden_by_dest?.includes("twitter.com") ||
      (post?.url?.includes("twitter.com") && post?.domain?.includes("twitter"))
    ) {
      isTweet = true;
      //return true;
    }
    if (post.media_metadata) {
      galleryInfo = [];
      //gallery_data is array of ordered gallery images but may not exist, media_metadata is object, not necessarily ordered
      for (let i in post?.gallery_data?.items ?? post.media_metadata) {
        let image = post?.media_metadata?.[i];
        let caption = post?.gallery_data?.items?.[i]?.caption ?? "";
        let id = post?.gallery_data?.items?.[i]?.media_id;
        if (id && post.media_metadata[id]) {
          image = post.media_metadata[id];
        }
        if (image.p) {
          if (image.p.length > 0) {
            let num = image.p.length - 1;
            //console.log(num);
            galleryInfo.push({
              media: [
                {
                  src: checkURL(
                    image?.s?.gif ?? image.p[num].u.replace("amp;", "")
                  ),
                  height: image.p[num].y,
                  width: image.p[num].x,
                },
              ],
              caption: caption,
            });
          }
        }
      }
      if (post?.gallery_data?.items?.length ?? 0 > 0) {
        isGallery = true;
      }
      //isImage = true;
      return true;
    } else if (post.preview) {
      //images
      if (post.preview.images[0]) {
        if (post.preview.images[0].resolutions.length > 0) {
          imageInfo = [];
          for (let i in post.preview.images[0].resolutions) {
            imageInfo.push({
              src: checkURL(
                post.preview?.images[0]?.resolutions[i].url.replace("amp;", "")
              ),
              height: post.preview?.images[0]?.resolutions[i].height,
              width: post.preview?.images[0]?.resolutions[i].width,
            });
          }
          if (post.preview.images[0].source) {
            imageInfo.push({
              src: checkURL(
                post.preview.images[0].source.url.replace("amp;", "")
              ),
              height: post.preview.images[0].source?.height,
              width: post.preview.images[0].source?.width,
            });
          }
          //isImage = true;
          return true;
        }
      }
    } else if (post.url) {
      let purl: string = post.url;
      if (
        purl?.includes(".jpg") ||
        purl?.includes(".png") ||
        (purl?.includes(".gif") && !purl?.includes(".gifv")) //gifs should be handled in findVideo with mp4 format
      ) {
        if (!quick) {
          let info = await loadImg(purl);
          imageInfo = info;
        }

        //isImage = true;
        return true;
      }
    }
    return false;
  };
  const loadImg = async (purl) => {
    let dim: any = await addImageProcess(purl);

    return [
      {
        src: checkURL(purl),
        height: dim?.naturalHeight ?? 1080,
        width: dim?.naturalWidth ?? 1080,
      },
    ];
  };
  const addImageProcess = (src) => {
    return new Promise((resolve, reject) => {
      let img = document.createElement("img");
      img.onload = () =>
        resolve({
          naturalHeight: img.naturalHeight,
          naturalWidth: img.naturalWidth,
        });
      img.onerror = reject;
      img.src = src;
    });
  };
  const stringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body.firstElementChild as Element;
  };

  const findIframe = async (post) => {
    if (post?.media_embed?.content) {
      if (post.media_embed.content?.includes("iframe")) {
        let html: Element = stringToHTML(post.media_embed.content);
        html.setAttribute("height", "100%");
        html.setAttribute("width", "100%");
        let htmlsrc = html.getAttribute("src");
        if (htmlsrc?.includes("clips.twitch.tv")) {
          html.setAttribute(
            "src",
            `https://clips.twitch.tv/embed?clip=${
              post?.url.split("/")?.[3]
            }&parent=${domain}`
          );
        }
        iFrameHTML = html;
        return true;
      }
    }
    return false;
  };

  return loadInfo(post?.crosspost_parent_list?.[0] ?? post, quick);
};

export const checkImageInCache = (imageUrl, callback) => {
  const img = document.createElement("img");
  img.src = imageUrl;
  let status = img.complete && img.naturalWidth > 0;
  img.src = "";
  callback(status);
};

export const filterPosts = async (
  posts,
  filters,
  prevposts = {},
  checkSubs = false,
  checkUsers = true,
  domain = DOMAIN
) => {
  let {
    seenFilter,
    readFilter,
    imgFilter,
    vidFilter,
    selfFilter,
    //galFilter,
    linkFilter,
    imgPortraitFilter,
    imgLandscapeFilter,
    userPostType,
  } = filters;
  let filtercount = 0;

  async function filter(arr, callback) {
    const fail = Symbol();
    return (
      await Promise.all(
        arr.map(async (item) => ((await callback(item)) ? item : fail))
      )
    ).filter((i) => i !== fail);
  }

  const preFilterCheck = async (d) => {
    //check duplicate
    if (prevposts?.[d?.name] == 1) {
      return false;
    }

    //check subs / users. Done in background without increasing filter count
    if (checkUsers && (await userFilters.getItem(d?.author?.toUpperCase()))) {
      return false;
    }
    if (
      checkSubs &&
      (await subredditFilters.getItem(d?.subreddit?.toUpperCase()))
    ) {
      return false;
    }

    //if filtering read, no need for other content checks
    if (!seenFilter && (await localSeen.getItem(d?.name))) {
      filtercount += 1;
      return false;
    }
    if (!readFilter && (await localRead.getItem(d?.name))) {
      filtercount += 1;
      return false;
    }
    return true;
  };

  const filterCheck = async (d) => {
    let quick = true;
    //need to get all resolution data if filtering out orientations
    if (!imgPortraitFilter || !imgLandscapeFilter) {
      quick = false;
    }

    let mediaInfo = d?.mediaInfo ?? (await findMediaInfo(d, quick, domain));
    //orientation check
    if (!imgPortraitFilter || !imgLandscapeFilter) {
      //only check on videos or images (galleries consider images)
      if (mediaInfo?.isVideo || mediaInfo?.isImage) {
        //hide portrait if they are portrait, square is considered portrait

        if (!imgPortraitFilter && mediaInfo?.isPortrait) {
          filtercount += 1;

          return false;
        }
        //hide landscape if not portrait (are landscape)
        if (!imgLandscapeFilter && mediaInfo?.isPortrait === false) {
          filtercount += 1;

          return false;
        }
      }
    }

    if (!vidFilter && mediaInfo.isVideo) {
      //if video is not in self post, filter out
      if (!(selfFilter && mediaInfo.isSelf)) {
        filtercount += 1;
        return false;
      }
    } else if (!imgFilter && mediaInfo.isImage) {
      //if image is not in self post, filter out
      if (!(selfFilter && mediaInfo.isSelf)) {
        filtercount += 1;
        return false;
      }
    } else if (!linkFilter && mediaInfo.isLink) {
      filtercount += 1;
      return false;
    }
    //if self post, filter out
    else if (!selfFilter && mediaInfo.isSelf) {
      filtercount += 1;
      return false;
    }
    // else if (!galFilter && mediaInfo.isGallery) {
    // filtercount += 1;
    //   return false;
    // }
    else {
      return true;
    }
  };

  const prefilterChildren = async (data: Array<any>) => {
    let f = await filter(data, async (d) => {
      let r = await preFilterCheck(d.data);
      return r;
    });
    //console.log("prefilter?", f.length, data.length)
    return f;
  };

  const filterChildren = async (data: Array<any>, domain = DOMAIN) => {
    let f = await filter(data, async (d) => {
      //console.log(d);
      let mediaInfo = await findMediaInfo(d.data, false, domain);
      d.data["mediaInfo"] = mediaInfo;
      let r = await filterCheck(d.data);
      return r;
    });
    return f;
  };

  let filtered = posts;
  if (
    true //always going to do this to get mediaInfo initally, additional filter steps decided in filterCheck()
  ) {
    filtered = await prefilterChildren(posts);
    filtered = await filterChildren(filtered, domain);
  }
  return {
    filtered: filtered,
    filtercount: filtercount,
  };
};
