export interface VideoInfo {
  hlsSrc?: string;
  src: string;
  height: number;
  width: number;
  hasAudio?: boolean;
  duration?: number;
}
export interface ImageInfo {
  src: string;
  height: number;
  width: number;
}

export interface GalleryInfo {
  media: ImageInfo[] | VideoInfo[];
  caption?: string;
}

export interface MediaInfo {
  videoInfo: VideoInfo[];
  imageInfo: ImageInfo[];
  thumbnailInfo: ImageInfo;
  iFrameHTML: Element;
  galleryInfo: GalleryInfo[];

  isPortrait?: boolean;
  isImage: boolean;
  isVideo: boolean;
  isLink: boolean;
  isSelf: boolean;
  isTweet: boolean;
  isIframe: boolean;
  isMedia: boolean;
  dimensions: [number, number];
}
