import React, { useEffect, RefObject, useState } from "react";
import Hls from "hls.js";
import type { HlsConfig, ManifestParsedData } from "hls.js";

export interface HlsPlayerProps
  extends React.VideoHTMLAttributes<HTMLVideoElement> {
  hlsConfig?: Partial<HlsConfig>;
  playerRef: RefObject<HTMLVideoElement>;
  src: string;
  skipHls?: boolean; //skip Hls if only unsupported media available
  quality?: "sd" | "hd" | "full" | "min";
  triggerMute: Function;
  triggerHasAudio: Function;
}

function HlsPlayer({
  hlsConfig,
  playerRef = React.createRef<HTMLVideoElement>(),
  src,
  autoPlay,
  skipHls,
  quality,
  triggerMute,
  triggerHasAudio,
  ...props
}: HlsPlayerProps) {
  const [hls, setHls] = useState<Hls>();
  const selectLevel = (
    levels: number,
    quality?: "sd" | "hd" | "full" | "min"
  ) => {
    //reddit manifests generally have 8 (with audio) or 4 (no audio) levels
    if (levels >= 4) {
      switch (quality) {
        case "full":
          return levels;
        case "hd":
          return levels - 1;
        case "sd":
          return Math.floor(levels / 2);
        case "min":
          return 0;
        default:
          return levels - 1;
      }
    } else if (levels > 1) {
      switch (quality) {
        case "full":
          return levels;
        case "hd":
          return levels;
        case "sd":
          return Math.floor(levels / 2);
        case "min":
          return 0;
        default:
          return levels;
      }
    }
    return levels;
  };
  useEffect(() => {
    let hls: Hls;

    function _initPlayer() {
      if (hls != null) {
        hls.destroy();
      }
      const newHls = new Hls({
        enableWorker: false,
        debug: false,
        maxLoadingDelay: 1,
        ...hlsConfig,
      });

      if (playerRef.current != null) {
        newHls.attachMedia(playerRef.current);
      }

      newHls.on(Hls.Events.MEDIA_ATTACHED, () => {
        newHls.loadSource(src);

        newHls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          !data?.audio ? triggerHasAudio(false) : triggerHasAudio(true);
          if (quality) {
            newHls.currentLevel = selectLevel(data.levels.length - 1, quality);
          }
          if (autoPlay) {
            playerRef?.current?.play().catch((e) => {
              //workaround unmuted autoplay security issue
              triggerMute();
              if (playerRef.current) {
                playerRef.current.muted = true;
                playerRef.current.play().catch((e2) => {
                  // console.log(
                  //   "Unable to autoplay prior to user interaction with the dom.",
                  //   e2
                  // );
                });
              }
            });
          }
        });
      });

      newHls.on(Hls.Events.ERROR, function (event, data) {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              newHls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              newHls.recoverMediaError();
              break;
            default:
              _initPlayer();
              break;
          }
        }
      });

      hls = newHls;
      setHls(newHls);
    }

    // Check for Media Source support
    if (!skipHls && Hls.isSupported()) {
      _initPlayer();
    }

    return () => {
      if (hls != null) {
        hls.destroy();
      }
      setHls(undefined);
    };
  }, [autoPlay, playerRef, hlsConfig, src, skipHls]);
  useEffect(() => {
    if (quality && hls && hls.levels.length > 0) {
      hls.currentLevel = selectLevel(hls.levels.length - 1, quality);
    }
  }, [quality, hls]);
  // If Media Source is supported, use HLS.js to play video
  if (!skipHls && Hls.isSupported())
    return <video ref={playerRef} {...props} />;

  // Fallback to using a regular video player if HLS is supported by default in the user's browser
  return <video ref={playerRef} src={src} autoPlay={autoPlay} {...props} />;
}

export default HlsPlayer;
