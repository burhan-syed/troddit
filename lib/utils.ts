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

export const findMediaInfo = async (post) => {
  let videoInfo = { url: "", height: 0, width: 0 };
  let imageInfo = { url: "", height: 0, width: 0 };
  let gallery = [];
  let isPortrait = false;
  let isImage = false;
  let isVideo = false;
  const checkIfPortrait = async (post) => {
    let a = await findVideo(post);
    //console.log(a);
    if (a) {
      if (videoInfo.height > videoInfo.width) {
        //setIsPortrait(true);
        return true;
      }
    }
    let b = await findImage(post);
    //console.log(b);
    if (b) {
      if (imageInfo.height > imageInfo.width) {
        //setIsPortrait(true);
        return true;
      } else if (gallery?.[0]?.height > gallery?.[0]?.width) {
        return true;
      }
    } else {
      return false;
    }
  };

  const checkURL = (url) => {
    const placeholder =
      "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"; //"http://goo.gl/ijai22";
    if (!url) return placeholder;
    if (!url.includes("http")) return placeholder;
    return url;
  };

  const loadImg = async (purl) => {
    //let img =  Image()
    let img = document.createElement("img");
    imageInfo = {
      url: checkURL(purl),
      height: 1080,
      width: 1080,
    };
    isImage = true;
    img.onload = function (event) {
      // console.log("natural:", img.naturalWidth, img.naturalHeight);
      // console.log("width,height:", img.width, img.height);
      // console.log("offsetW,offsetH:", img.offsetWidth, img.offsetHeight);
      imageInfo = {
        url: checkURL(purl),
        height: img.naturalHeight,
        width: img.naturalWidth,
      };
      isImage = true;
    };
    img.src = purl;
    //document.body.appendChild(img);
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

        imageInfo = {
          url: checkURL(post?.thumbnail),
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        };
        return true;
        //setLoaded(true);
      }
    }
    if (post.media) {
      if (post.media.reddit_video) {
        videoInfo = {
          url: post.media.reddit_video.fallback_url,
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        };
        imageInfo = {
          url: checkURL(post?.thumbnail),
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        };
        return true;
      }
    }
    return false;
  };

  const findImage = async (post) => {
    if (post.media_metadata) {
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
      //setGalleryInfo(gallery);
      //setIsGallery(true);
      isImage = true;
      return true;
    } else if (post.preview) {
      //images
      if (post.preview.images[0]) {
        if (post.preview.images[0].resolutions.length > 0) {
          let num = post.preview.images[0].resolutions.length - 1;

          let imgheight = post.preview?.images[0]?.resolutions[num].height;
          let imgwidth = post.preview?.images[0]?.resolutions[num].width;

          imageInfo = {
            url: checkURL(
              post.preview?.images[0]?.resolutions[num].url.replace("amp;", "")
            ),
            height: imgheight,
            width: imgwidth,
          };
          isImage = true;
          return true;
        }
      }
    } else if (post.url) {
      let purl: string = post.url;
      if (
        purl.includes(".jpg") ||
        purl.includes(".png") ||
        purl.includes(".gif")
      ) {
        await loadImg(purl);
        isImage = true;
        return true;
      }
    }
    return false;
  };

  //isPortrait = await checkIfPortrait(post);
  return checkIfPortrait(post);
};
