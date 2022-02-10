const TWITCH_PARENT = "www.troddit.com";
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

export const secondsToDate = (seconds) => {
  let date = new Date(seconds * 1000);
  let month = date.toLocaleDateString("en-US", { month: "long" });
  let day = date.toLocaleDateString("en-US", { day: "numeric" });
  let year = date.toLocaleDateString("en-US", { year: "numeric" });
  return `${month} ${day}, ${year}`;
};
export const numToString = (x: number, max = 10000) => {
  if (x < max) {
    return x.toString();
  } else {
    let y = Math.floor(x / 1000);
    let z = (x / 1000).toFixed(1);
    return z.toString() + "k";
  }
};

export const findMediaInfo = async (post, quick = false) => {
  let videoInfo; // = { url: "", height: 0, width: 0 };
  let imageInfo; // = [{ url: "", height: 0, width: 0 }];
  let thumbnailInfo;
  let iFrameHTML;
  let gallery; // = [];
  let isPortrait = undefined;
  let isImage = false;
  let isGallery = false;
  let isVideo = false;
  let isLink = true;
  let isSelf = false; //self text post
  let isTweet = false;
  let isIframe = false;

  let dimensions = [-1, -1]; //x,y pixels

  const loadInfo = async (post, quick = false) => {
    let a = await findVideo(post);
    if (a) {
      isVideo = true;
      dimensions[0] = videoInfo.width;
      dimensions[1] = videoInfo.height;
    } else {
      let b = await findImage(post, quick);
      if (b) {
        //isImage = true;
        if (gallery?.[0]?.height > 0) {
          isImage = true;
          //just setting dimensions to first gallery image for now
          dimensions[0] = gallery[0].width;
          dimensions[1] = gallery[0].height;
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
      }
    }

    if (
      post.thumbnail === "self" ||
      post.is_self ||
      post.domain.includes("self")
    ) {
      isSelf = true;
    }
    if (
      post?.domain?.includes("redd.it") ||
      post?.domain?.includes("reddit") ||
      post?.domain?.includes("self.") ||
      post?.url?.includes("imgur")
    ) {
      isLink = false;
    }

    //portrait check
    if (dimensions[0] > 0) {
      if (dimensions[1] >= dimensions[0]) {
        isPortrait = true;
      } else if (dimensions[1] < dimensions[0]) {
        isPortrait = false;
      }
    }

    return {
      videoInfo,
      imageInfo,
      thumbnailInfo,
      iFrameHTML,
      gallery,
      isPortrait,
      isImage,
      isGallery,
      isVideo,
      isTweet,
      isIframe,
      isLink,
      isSelf,
      dimensions,
    };
  };

  const checkURL = (url) => {
    const placeholder =
      "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"; //"http://goo.gl/ijai22";
    if (!url) return placeholder;
    if (!url.includes("http")) return placeholder;
    return url;
  };

  const findVideo = async (post) => {
    // console.log("find vid", post?.title);
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        videoInfo = {
          url: post.preview.reddit_video_preview.fallback_url,
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        };

        thumbnailInfo = [
          {
            url: checkURL(post?.thumbnail),
            height: post.preview.reddit_video_preview.height,
            width: post.preview.reddit_video_preview.width,
          },
        ];
        await findImage(post, true);
        isVideo = true;
        return true;
        //setLoaded(true);
      }
      //gifs are stored as mp4s here, also with resolutions but just using source for now
      else if (post?.preview?.images?.[0]?.variants?.mp4) {
        videoInfo = {
          url: checkURL(post?.preview?.images?.[0]?.variants?.mp4?.source?.url),
          height: post?.preview?.images?.[0]?.variants?.mp4?.source?.height,
          width: post?.preview?.images?.[0]?.variants?.mp4?.source?.width,
        };

        thumbnailInfo = [
          {
            url: checkURL(post?.preview?.images?.[0]?.source?.url),
            height: post?.preview?.images?.[0]?.source?.height,
            width: post?.preview?.images?.[0]?.source?.width,
          },
        ];
        await findImage(post, true);
        isVideo = true;
        return true;
      }
    }
    if (post.media) {
      if (post.media.reddit_video) {
        videoInfo = {
          url: post.media.reddit_video.fallback_url,
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        };
        thumbnailInfo = [
          {
            url: checkURL(post?.thumbnail),
            height: post.media.reddit_video.height,
            width: post.media.reddit_video.width,
          },
        ];
        await findImage(post, true);
        isVideo = true;
        return true;
      }
    }
    return false;
  };

  const findImage = async (post, quick = false) => {
    if (post?.url?.includes("twitter.com")) {
      isTweet = true;
      //return true;
    }
    if (post.media_metadata) {
      gallery = [];
      for (let i in post.media_metadata) {
        let image = post.media_metadata[i];
        if (image.p) {
          if (image.p.length > 0) {
            let num = image.p.length - 1;
            //console.log(num);
            gallery.push({
              url: checkURL(image.p[num].u.replace("amp;", "")),
              height: image.p[num].y,
              width: image.p[num].x,
            });
          }
        }
      }
      isGallery = true;
      //isImage = true;
      return true;
    } else if (post.preview) {
      //images
      if (post.preview.images[0]) {
        if (post.preview.images[0].resolutions.length > 0) {
          imageInfo = [];
          for (let i in post.preview.images[0].resolutions) {
            imageInfo.push({
              url: checkURL(
                post.preview?.images[0]?.resolutions[i].url.replace("amp;", "")
              ),
              height: post.preview?.images[0]?.resolutions[i].height,
              width: post.preview?.images[0]?.resolutions[i].width,
            });
          }
          if (post.preview.images[0].source) {
            imageInfo.push({
              url: checkURL(
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
        purl.includes(".jpg") ||
        purl.includes(".png") ||
        purl.includes(".gif") //gifs should be handled in findVideo with mp4 format
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
        url: checkURL(purl),
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
    return doc.body.firstElementChild;
  };

  const findIframe = async (post) => {
    if (post?.media_embed?.content) {
      if (post.media_embed.content.includes("iframe")) {
        let html: Element = stringToHTML(post.media_embed.content);
        html.setAttribute("height", "100%");
        html.setAttribute("width", "100%");
        let htmlsrc = html.getAttribute("src");
        if (htmlsrc.includes("clips.twitch.tv")) {
          html.setAttribute(
            "src",
            `https://clips.twitch.tv/embed?clip=${
              post?.url.split("/")?.[3]
            }&parent=${TWITCH_PARENT}`
          );
        }
        iFrameHTML = html;
        return true;
      }
    }
    return false;
  };

  return loadInfo(post, quick);
};
