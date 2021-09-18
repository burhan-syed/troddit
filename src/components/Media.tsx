import Image from "next/dist/client/image";
//import MyImage from './Image';
import LazyLoad from "react-lazyload";
import Gallery from "./Gallery";
import VideoHandler from "./VideoHandler";
import ImageHandler from "./ImageHandler";
import { forceCheck } from "react-lazyload";
import { useEffect, useState } from "react";
import { useMainContext } from "../MainContext";

const TWITCH_PARENT='www.troddit.com'//'localhost'

const Media = ({ post, allowIFrame = false, imgFull = false }) => {
  const context:any = useMainContext();
  const [isGallery, setIsGallery] = useState(false);
  const [galleryInfo, setGalleryInfo] = useState([]);
  const [isImage, setIsImage] = useState(false);
  const [isMP4, setIsMP4] = useState(false);
  const [showMP4, setShowMP4] = useState(true);
  const [imageInfo, setImageInfo] = useState({ url: "", height: 0, width: 0 });
  const [videoInfo, setVideoInfo] = useState({ url: "", height: 0, width: 0 });
  const [placeholderInfo, setPlaceholderInfo] = useState({
    url: "",
    height: 0,
    width: 0,
  });

  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [toLoad, setToLoad] = useState(false);
  const onLoaded = () => {
    setMediaLoaded(true);
  };

  useEffect(() => {
    if (shouldLoad()) {
      initialize();
      setToLoad(true);
    } else {
      //console.log("ERRRRRR");
    }
    forceCheck();
  }, [post]);

  const shouldLoad = () => {
    if (!post) return false;
    if (!post.url) return false;
    if (!post.title) return false;
    if (!post.subreddit) return false;
    //console.log(post);
    return true;
  };

  const initialize = async () => {
    let a, b, c;
    b = await findVideo();
    if (!b) {
      a = await findImage();
    }
    if (allowIFrame) {
      c = await findIframe();
    }
    //a = await findImage();

    //console.log(imageInfo, videoInfo, placeholderInfo);

    //checkURLs();
    a || b || c ? setLoaded(true) : setLoaded(false);
  };

  //if deleted by copyright notice may be set to 'self'
  const checkURLs = () => {
    //console.log(imageInfo, videoInfo, placeholderInfo);
    const placeholder = "http://goo.gl/ijai22";
    if (imageInfo.url === "self") {
      setImageInfo((imgInfo) => {
        return { ...imageInfo, url: placeholder };
      });
    }
    if (videoInfo.url === "self") {
      setVideoInfo((imgInfo) => {
        return { ...imageInfo, url: placeholder };
      });
    }
    if (placeholderInfo.url === "self") {
      setPlaceholderInfo((imgInfo) => {
        return { ...imageInfo, url: placeholder };
      });
    }
  };

  const checkURL = (url) => {
    const placeholder = "https://www.publicdomainpictures.net/pictures/280000/velka/not-found-image-15383864787lu.jpg"//"http://goo.gl/ijai22";
    if (!url) return placeholder;
    if (!url.includes("http")) return placeholder;
    return url;
  };

  const findVideo = async () => {
    // console.log("find vid", post?.title);
    if (post.preview) {
      if (post.preview.reddit_video_preview) {
        setVideoInfo({
          url: post.preview.reddit_video_preview.fallback_url,
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });

        setPlaceholderInfo({
          url: checkURL(post?.thumbnail),
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
          //height: post.prevt.thumbnail_height,
          //width: post.thumbnail_width,
        });
        setImageInfo({
          url: checkURL(post?.thumbnail),
          height: post.preview.reddit_video_preview.height,
          width: post.preview.reddit_video_preview.width,
        });
        //console.log(`${post.title}: ${imageInfo.url}`);
        setIsMP4(true);
        setIsImage(false);
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
        setPlaceholderInfo({
          url: checkURL(post.thumbnail),
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
          //height: post.thumbnail_height,
          //width: post.thumbnail_width,
        });
        setImageInfo({
          url: checkURL(post?.thumbnail),
          height: post.media.reddit_video.height,
          width: post.media.reddit_video.width,
        });
        setIsMP4(true);
        setIsImage(false);
        //setLoaded(true);
        return true;
      }
    }
    return false;
  };
  const [isIFrame, setIsIFrame] = useState(false);
  const [iFrame, setIFrame] = useState<Element>();
  const [isYTVid, setisYTVid] = useState(false);
  const [ytVidHeight, setytVidHeight] = useState({});
  const stringToHTML = function (str) {
    let parser = new DOMParser();
    let doc = parser.parseFromString(str, "text/html");
    return doc.body.firstElementChild;
  };

  const findIframe = async () => {
    //console.log("find iframe", post?.title);
    if (post?.media_embed?.content) {
      if (post.media_embed.content.includes("iframe")) {
        let html: Element = stringToHTML(post.media_embed.content);
        html.setAttribute("height", "100%");
        html.setAttribute("width", "100%");
        let htmlsrc = html.getAttribute("src");
        if (htmlsrc.includes("clips.twitch.tv")) {
          //console.log(post?.url.split("/"));
          html.setAttribute(
            "src",
            `https://clips.twitch.tv/embed?clip=${
              post?.url.split("/")?.[3]
            }&parent=${TWITCH_PARENT}`
            
          );
          // console.log(html);
        } if (htmlsrc.includes("youtube.com")){
          setytVidHeight({height: `${Math.floor(screen.height * 0.75)}px`});
          setisYTVid(true);
        }
        //console.log(html);
        setIFrame(html);
        // let iframe = document.createElement('div');
        // iframe.innerHTML=media;
        // let fragment = document.createDocumentFragment();
        // fragment.appendChild(iframe);
        // let html = iframe.firstChild;

        // if (iframe.includes("www.youtube.com")){
        //   iframe = iframe.replace("")
        // }
        //setIFrame(post.media_embed.content);
        allowIFrame && setIsIFrame(true);
        return true;
      } else {
        // console.log(post.media_embed.content);
      }
    }
    return false;
  };

  const findImage = async () => {
    //console.log("find iframe", post?.title);
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
      //setLoaded(true);
      return true;
    } else if (post.preview) {
      //images
      if (post.preview.images[0]) {
        if (post.preview.images[0].resolutions.length > 0) {
          let num = post.preview.images[0].resolutions.length - 1;
          
          //choose smallest image possible
          //for reference
          // const breakpointColumnsObj = {
          //   default: 4,
          //   2560: 3,
          //   1280: 2,
          //   767: 1,
          // };

          if (!imgFull) {
            let done = false; 
            let width = screen.width; 
            if (width > 767 && width < 1280) {
              width = width/2
            } else if (width < 2560) {
              width = width/3
            } else {
              width = width/4
            }
            post.preview.images[0].resolutions.forEach((res, i) => {
              //console.log(width,res,i);
              if (!done){
                if (res.width > width){
                  num = i; 
                  //console.log("DONE",num);
                  done = true; 
                }
              }
            })
          }

          setImageInfo({
            url: checkURL(
              post.preview?.images[0]?.resolutions[num].url.replace("amp;", "")
            ),
            height: post.preview?.images[0]?.resolutions[num].height,
            width: post.preview?.images[0]?.resolutions[num].width,
          });
          setPlaceholderInfo({
            url: checkURL(post.thumbnail),
            height: post.thumbnail_height,
            width: post.thumbnail_width,
          });
          // try {
          //   const base64 = await imageToBase64(post.thumbnail.replace("amp;", ""));
          //   setBase64(base64);
          // } catch (err) {
          //   console.log(err);
          // }

          //console.log(imageInfo);
          setIsImage(true);
          //setLoaded(true);
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
        // let img = new Image()
        // img.addEventListener("load", function(){
        //     alert( this.naturalWidth +' '+ this.naturalHeight );
        // });
        // img.src = purl;
        imgFull = true;
        setImageInfo({
          url: checkURL(purl),
          height: 1080,
          width: 1080,
        });
        setIsImage(true);
        return true;
      }
    }
    return false;
  };

  const [imgheight, setheight] = useState({});
  const [maxheight, setmaxheight] = useState({});
  const [maxheightnum, setmaxheightnum] = useState<Number>();
  useEffect(() => {
    setheight({
      height: `${imageInfo.height}px`,
      maxHeight: `${Math.floor(screen.height * 0.75)}px`,
    });
    setmaxheight({ maxHeight: `${Math.floor(screen.height * 0.75)}px` });
    setmaxheightnum(Math.floor(screen.height * 0.75));
  }, [imageInfo]);

  return (
    <div>
      {isIFrame && allowIFrame ? (
        <div className="relative" style={imgFull&&isYTVid ? ytVidHeight : imgFull ? imgheight : {}}>
          {/* <Iframe
                    url={iFrame[3]}
                    width={iFrame[5] + "px"}
                    height={iFrame[7 + "px"]}
                    allowFullScreen={true}
                    frameBorder={0}
                    scrolling={"no"}
                    id={"player"}
                  /> */}
          {/* <iframe
                    src={Iframe[3]}
                    height={Iframe[7]}
                    width={iFrame[5]}
                    allowFullScreen={true}
                  ></iframe> */}
          {/* {iFrame} */}
          <div
            className="w-full h-full"
            dangerouslySetInnerHTML={{ __html: iFrame.outerHTML }}
          ></div>
        </div>
      ) : (
        ""
      )}

      {isGallery ? (
        <div className="flex flex-col items-center">
          <Gallery images={galleryInfo} />{" "}
        </div>
      ) : (
        ""
      )}

      {isImage && !isIFrame && !isMP4 ? (
        // <ImageHandler placeholder={placeholderInfo} imageInfo={imageInfo} />
        <div className={"relative"} style={imgFull ? imgheight : {}}>
          {mediaLoaded ? (
            ""
          ) : (
            <div className="absolute w-16 h-16 -mt-8 -ml-8 border-b-2 rounded-full top-1/2 left-1/2 animate-spin"></div>
          )}

          <Image
            src={imageInfo.url}
            height={imageInfo.height}
            width={imageInfo.width}
            alt="image"
            layout={imgFull ? "fill" : "responsive"}
            onLoadingComplete={onLoaded}
            lazyBoundary={imgFull ? "0px" : "2000px"}
            objectFit={imgFull ? "contain" : "contain"}
            priority={imgFull}
            unoptimized={true}
            // placeholder="blur"
            // blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkKF5YDwADJAGVKdervwAAAABJRU5ErkJggg=="
          />
          {/* <MyImage imageInfo={imageInfo}/> */}
        </div>
      ) : (
        // <LazyLoad height={imageInfo.height}>
        //   <img src={imageInfo.url} alt="img" />
        // </LazyLoad>
        ""
      )}

      {isMP4 && !isIFrame ? (
        showMP4 ? (
          <div
            className="flex flex-col items-center flex-none "
            style={imgFull ? maxheight : {}}
          >
            <LazyLoad
              height={videoInfo.height}
              once={true}
              offset={2000}
              unmountIfInvisible={false}
            >
              <VideoHandler
                placeholder={placeholderInfo}
                videoInfo={videoInfo}
                maxHeight={maxheight}
                imgFull={imgFull}
              />
            </LazyLoad>
          </div>
        ) : (
          ""
        )
      ) : (
        ""
      )}

      {post?.selftext_html ? (
        // <Markdown className="overflow-y-scroll react-markdown max-h-60 overflow-ellipsis overscroll-contain">
        //   {post?.selftext}
        // </Markdown>
        <div className="overflow-y-auto max-h-96 overscroll-contain">
          {" "}
          <div id="innerhtml" dangerouslySetInnerHTML={{ __html: post?.selftext_html }}></div>
        </div>
      ) : (
        // <p className="overflow-y-scroll max-h-60 overflow-ellipsis overscroll-contain">{post.selftext}</p>
        ""
      )}
    </div>
  );
};

export default Media;
