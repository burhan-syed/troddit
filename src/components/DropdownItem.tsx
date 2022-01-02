import { useRouter } from "next/router";
import Image from "next/dist/client/image";
import { useState, useEffect } from "react";
import { usePlausible } from "next-plausible";

const DropdownItem = ({ sub, isUser = false, preventNav = false }) => {
  const [loaded, setLoaded] = useState(false);
  const [thumbURL, setThumbURL] = useState("");
  const [isMulti, setisMulti] = useState(false);
  const router = useRouter();
  const plausible = usePlausible();
  useEffect(() => {
    //console.log('>>',sub);
    sub?.data?.subreddits?.length > 0 ? setisMulti(true) : setisMulti(false);
    if (sub.data?.icon_url) {
      setThumbURL(sub.data.icon_url);
    } else {
      sub?.data?.community_icon?.length > 1
        ? setThumbURL(sub?.data?.community_icon?.replaceAll("amp;", ""))
        : sub?.data?.icon_img?.length > 1
        ? setThumbURL(sub?.data?.icon_img) : setThumbURL("");
        // : sub?.data?.header_img?.length > 1 &&
        //   setThumbURL(sub?.data?.header_img);
    }

    // if (sub.data?.icon_url) {
    //   setThumbURL(sub.data.icon_url);
    //   setisMulti(true);
    // } else {
    //   if (sub.data?.icon_img && sub.data?.icon_img !== "") {
    //     setThumbURL(sub.data.icon_img);
    //   }
    //   if (sub.data?.community_icon && sub.data?.community_icon !== "") {
    //     setThumbURL(sub.data.community_icon.replaceAll("amp;", ""));
    //   }
    // }
    //console.log(thumbURL);
    if (sub?.data) {
      setLoaded(true);
    }

    return () => {};
  }, [sub]);

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    plausible("goToSub");
    router.push(`/r/${suggestion}${isMulti ? `?m=${sub?.data?.name}` : ""}`);
  };

  const goToMulti = (e) => {
    let suggestions = "";
    plausible("goToMulti");
    for (let s of sub.data.subreddits) {
      suggestions.length === 0
        ? (suggestions = s.name)
        : (suggestions = suggestions + "+" + s.name);
    }
    //console.log(sub);
    goToSub(e, suggestions);
  };

  const goTo = (e) => {
    isMulti ? goToMulti(e) : goToSub(e, sub.data.display_name);
  };

  return (
    <div>
      <div
        className="flex flex-row items-center text-sm text-center cursor-pointer"
        onClick={(e) => !preventNav && goTo(e)}
      >
        {/* Image */}
        <div className="flex flex-row items-center flex-none w-6 h-6 ml-1 ">
          {thumbURL?.includes('https://') ? (
            <Image
              src={thumbURL}
              alt="sub"
              height={sub.data?.icon_size?.[0] ?? 256}
              width={sub.data?.icon_size?.[1] ?? 256}
              unoptimized={true}
              objectFit="cover"
              className={
                (isMulti ? "rounded" : "rounded-full") + " flex-none border "
              }
            />
          ) : (
            loaded && (
              <div
                className={
                  (isMulti
                    ? "rounded bg-red-400"
                    : "rounded-full bg-blue-700") +
                  " w-6 h-6 text-center text-lightText"
                }
              >
                {isUser ? "u/" : isMulti ? "m" : "r/"}
              </div>
            )
          )}
        </div>
        {/* Text */}
        <h1 className="ml-2 truncate">
          {sub.data?.display_name_prefixed ?? sub.data?.display_name}
          {isUser && router?.query?.slug?.[0].toString()}
        </h1>
      </div>
    </div>
  );
};

export default DropdownItem;
