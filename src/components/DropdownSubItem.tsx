import router from "next/router";
import Image from "next/dist/client/image";
import { useState, useEffect } from "react";

const DropdownSubItem = ({ sub }) => {
  const [thumbURL, setThumbURL] = useState("");

  useEffect(() => {
    if (sub.data?.icon_img && sub.data?.icon_img !== "") {
      setThumbURL(sub.data.icon_img);
    }
    if (sub.data?.community_icon && sub.data?.community_icon !== "") {
      setThumbURL(sub.data.community_icon.replaceAll("amp;", ""));
    }

    return () => {};
  }, []);

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    console.log(suggestion);
    router.push({
      pathname: "/r/[subs]",
      query: { subs: suggestion },
    });
  };
  return (
    <div>
      <div
        className="flex flex-row items-center py-2 text-sm text-center border hover:bg-gray-200"
        onClick={(e) => goToSub(e, sub.data.display_name)}
      >
        <div className="flex flex-row items-center w-5 h-5 border">
          {thumbURL ? (
            <Image
              src={thumbURL}
              alt="sub"
              height={sub.data?.icon_size?.[0] ?? 256}
              width={sub.data?.icon_size?.[1] ?? 256}
              objectFit="cover"
              className="flex-none rounded-full"
            />
          ) : (
            <div className="w-4 h-4 bg-blue-200 rounded-full"></div>
          )}
        </div>
        <h1 className="ml-1"> {sub.data.display_name_prefixed}</h1>
      </div>
    </div>
  );
};

export default DropdownSubItem;
