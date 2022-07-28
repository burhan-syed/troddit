import { useTheme } from "next-themes";
import React, { useEffect, useState } from "react";
import { BsBoxArrowInUpRight } from "react-icons/bs";

const ExternalLink = ({ domain, url }) => {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const link = `${domain}/${url
    ?.split("?")?.[0]
    ?.replace("https://", "")
    ?.split("/")
    ?.splice(1)
    ?.join("/")}`;
  if (!mounted) {
    return <></>;
  }
  return (
    <a
      aria-label="external link"
      onClick={(e) => e.stopPropagation()}
      className={
        "flex items-center flex-grow gap-1 px-2 py-2 mt-auto text-xs bg-opacity-50  text-th-link hover:text-th-linkHover " +
        (resolvedTheme === "light" ? " " : "bg-black/80")
      }
      target={"_blank"}
      rel="noreferrer"
      href={url}
      style={{ wordBreak: "break-all" }}
    >
      <span className="opacity-100 ">{link}</span>
      <BsBoxArrowInUpRight className={"flex-none w-6 h-6 ml-auto  group-hover:scale-110 " + (resolvedTheme === "light" ? "text-th-text" : " text-white ")} />
    </a>
  );
};

export default ExternalLink;
