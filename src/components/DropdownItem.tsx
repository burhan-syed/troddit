import { useRouter } from "next/router";
import Image from "next/dist/client/image";
import { useState, useEffect } from "react";

const DropdownItem   = ({ sub }) => {
  const [thumbURL, setThumbURL] = useState("");
  const [isMulti, setisMulti] = useState(false);
  const router = useRouter();
  useEffect(() => {
    if (sub.data?.icon_url) {
      setThumbURL(sub.data.icon_url);
      setisMulti(true);
    } else {
      if (sub.data?.icon_img && sub.data?.icon_img !== "") {
        setThumbURL(sub.data.icon_img);
      }
      if (sub.data?.community_icon && sub.data?.community_icon !== "") {
        setThumbURL(sub.data.community_icon.replaceAll("amp;", ""));
      }
    }

    return () => {};
  }, [sub]);

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    router.push(`/r/${suggestion}`);
  };

  const goToMulti = (e) => {
    let suggestions = "";
    for (let s of sub.data.subreddits) {
      suggestions.length === 0
        ? (suggestions = s.name)
        : (suggestions = suggestions + "+" + s.name);
    }
    goToSub(e, suggestions);
  };

  const goTo = (e) => {
    isMulti ? goToMulti(e) : goToSub(e, sub.data.display_name);
  };
  return (
    <div>
      <div
        className="flex flex-row items-center py-1.5 text-sm text-center border hover:bg-gray-200"
        onClick={(e) => goTo(e)}
      >
        {/* Image */}
        <div className="flex flex-row items-center w-6 h-6 ml-1 ">
          {thumbURL ? (
            <Image
              src={thumbURL}
              alt="sub"
              height={sub.data?.icon_size?.[0] ?? 256}
              width={sub.data?.icon_size?.[1] ?? 256}
              objectFit="cover"
              className={
                (isMulti ? "rounded" : "rounded-full") + " flex-none border "
              }
            />
          ) : (
            <div
              className={
                (isMulti ? "rounded bg-red-400" : "rounded-full bg-blue-700") +
                " w-6 h-6 text-center text-white"
              }
            >
              {isMulti ? "m" : "r/"}
            </div>
          )}
        </div>
        {/* Text */}
        <h1 className="ml-2 font-light">
          {" "}
          {sub.data?.display_name_prefixed ?? sub.data.display_name}
        </h1>
      </div>
    </div>
  );
};

export default DropdownItem;
