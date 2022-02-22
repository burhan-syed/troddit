import { useRouter } from "next/router";
import Image from "next/dist/client/image";
import { useState, useEffect } from "react";
import { usePlausible } from "next-plausible";
import { loadSubredditInfo } from "../RedditAPI";
import { useSession } from "next-auth/client";
import Link from "next/link";

const DropdownItem = ({
  sub,
  isUser = false,
  preventNav = false,
  isUserLink = false,
}) => {
  const [session, loading] = useSession();
  const [loaded, setLoaded] = useState(false);
  const [thumbURL, setThumbURL] = useState("");
  const [isMulti, setisMulti] = useState(false);
  const router = useRouter();
  const plausible = usePlausible();
  useEffect(() => {
    //console.log('>>',sub);
    sub?.data?.subreddits ? setisMulti(true) : setisMulti(false);
    const findThumbnail = (sub) => {
      if (sub?.data?.icon_url) {
        setThumbURL(sub.data.icon_url);
      } else {
        sub?.data?.community_icon?.length > 1
          ? setThumbURL(sub?.data?.community_icon?.replaceAll("amp;", ""))
          : sub?.data?.icon_img?.length > 1
          ? setThumbURL(sub?.data?.icon_img?.replaceAll("amp;", ""))
          : setThumbURL("");
        // : sub?.data?.header_img?.length > 1 &&
        //   setThumbURL(sub?.data?.header_img);
      }
    };

    const findSubInfo = async (sub) => {
      let subinfo = await loadSubredditInfo(sub?.data?.display_name);
      findThumbnail({ data: subinfo?.data });
    };
    if (sub?.kind == "t5") {
      findThumbnail(sub);
    } else if (
      sub?.data?.display_name &&
      !(sub?.data?.subreddits?.length > 0)
    ) {
      setThumbURL("");
      //console.log(sub?.data?.display_name);
      //findSubInfo(sub);
      //causing alot of extra api calls, not doing this for now
    } else setThumbURL("");
    if (sub?.data) {
      setLoaded(true);
    }

    return () => {};
  }, [sub]);

  const goToSub = (e, suggestion) => {
    e.preventDefault();
    plausible("goToSub");
    router.push(`${suggestion}${isMulti ? `?m=${sub?.data?.name}` : ""}`);
  };

  const goToMulti = (e) => {
    //console.log(sub);
    if (sub.data.subreddits.length < 1) {
      router.push(
        `www.reddit.com/user/${session?.user?.name}/m/${sub.data?.name}`,
        `www.reddit.com/user/${session?.user?.name}/m/${sub.data?.name}`
      );
    } else {
      let suggestions = combineMulti(sub.data.subreddits);
      plausible("goToMulti");
      // for (let s of sub.data.subreddits) {
      //   suggestions.length === 0
      //     ? (suggestions = s.name)
      //     : (suggestions = suggestions + "+" + s.name);
      // }
      goToSub(e, suggestions);
    }
  };
  const combineMulti = (subs) => {
    let suggestions = "";
    for (let s of subs) {
      suggestions?.length === 0
        ? (suggestions = `/r/${s.name}`)
        : (suggestions = suggestions + "+" + s.name);
    }
    return suggestions;
  };

  const goTo = (e) => {
    isMulti ? goToMulti(e) : goToSub(e, sub.data.url.replace("/user/", "/u/"));
  };

  const Line = (
    <div
      className="flex flex-row items-center text-sm text-center cursor-pointer"
      onClick={(e) => !preventNav && goTo(e)}
    >
      {/* Image */}
      <div className="flex flex-row items-center flex-none w-6 h-6 ml-1 ">
        {thumbURL?.includes("https://") ? (
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
                (isMulti ? "rounded bg-red-400" : "rounded-full bg-blue-700") +
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
        {/* {isUser && router?.query?.slug?.[0].toString()} */}
      </h1>
    </div>
  );

  return (
    <div>
      {isMulti ? (
        <>{Line}</>
      ) : (
        <Link href={`${sub?.data?.url?.replace("/user/", "/u/")}`}>
          <a
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            {Line}
          </a>
        </Link>
      )}
    </div>
  );
};

export default DropdownItem;
