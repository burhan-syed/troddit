import { useState, useEffect } from "react";

export function FindMedia(post) {
  const [isPortrait, setIsPortrait] = useState(false);
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [isTweet, setIsTweet] = useState(false);
  const [showMP4, setShowMP4] = useState(true);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoAudio, setvideoAudio] = useState("");
  const [placeholderInfo, setPlaceholderInfo] = useState({
    url: "",
    height: 0,
    width: 0,
  });

  useEffect(() => {
    const check = async() => {
      // await findVideo(post);
      // await findImage(post);
      let p = await checkIfPortrait(post);
      console.log('wait', imageInfo,videoInfo, p);

    }
    if (post?.id) check();
    return () => {

    }
  }, [post]);

  const checkIfPortrait = async (post) => {
    let a = await findVideo(post);
    console.log(a);
    if (a) {
      if (videoInfo.height > videoInfo.width) {
        setIsPortrait(true);
        return true;
      }
    }
    let b = await findImage(post);
    console.log(b);
    if (b) {
      if (imageInfo.height > imageInfo.width) {
        setIsPortrait(true);
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
    setImageInfo({
      url: checkURL(purl),
      height: 1080,
      width: 1080,
    });
    setIsImage(true);
    img.onload = function (event) {
      // console.log("natural:", img.naturalWidth, img.naturalHeight);
      // console.log("width,height:", img.width, img.height);
      // console.log("offsetW,offsetH:", img.offsetWidth, img.offsetHeight);
      setImageInfo({
        url: checkURL(purl),
        height: img.naturalHeight,
        width: img.naturalWidth,
      });
      setIsImage(true);
    };
    img.src = purl;
    //document.body.appendChild(img);
  };

  const findVideo = async (post) => {
    // console.log("find vid", post?.title);
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        setVideoInfo({
          url: post.preview.reddit_video_preview.fallback_url,
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });

        setImageInfo({
          url: checkURL(post?.thumbnail),
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });
        return true;
        //setLoaded(true);
      }
    }
    if (post.media) {
      if (post.media.reddit_video) {
        setVideoInfo({
          url: post.media.reddit_video.fallback_url,
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        });
        setImageInfo({
          url: checkURL(post?.thumbnail),
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        });
        return true;
      }
    }
    return false;
  };

  const findImage = async (post) => {
    if (post.media_metadata) {
      let gallery = [];
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
      setGalleryInfo(gallery);
      setIsGallery(true);
      return true;
    } else if (post.preview) {
      //images
      if (post.preview.images[0]) {
        if (post.preview.images[0].resolutions.length > 0) {
          let num = post.preview.images[0].resolutions.length - 1;

          let imgheight = post.preview?.images[0]?.resolutions[num].height;
          let imgwidth = post.preview?.images[0]?.resolutions[num].width;

          setImageInfo({
            url: checkURL(
              post.preview?.images[0]?.resolutions[num].url.replace("amp;", "")
            ),
            height: imgheight,
            width: imgwidth,
          });
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
        return true;
      }
    }
    return false;
  };

  return {
    isPortrait,
    checkIfPortrait,
  };
}
