import { useState, useEffect } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";
import { numToString } from "../../lib/utils";

const MAX_DISPLAY = 5;

const Awardings = ({ all_awardings, truncate = true, styles = "" }) => {
  const [rewardCount, setRewardCount] = useState(0);
  useEffect(() => {
    let r = 0;
    all_awardings?.forEach((a, i) => {
      r = r + a?.count;
    });
    setRewardCount(r);
    return () => {
      setRewardCount(0);
    };
  }, []);

  if (all_awardings?.length > 0)
    return (
      <>
        {all_awardings.map((a, i) => {
          if ((truncate && i < MAX_DISPLAY) || !truncate) {
            return (
              <div key={a?.icon_url} className={styles}>
                <Image
                  src={a?.resized_icons?.[1]?.url ?? a?.icon_url}
                  alt=""
                  unoptimized={true}
                  layout="intrinsic"
                  width={a?.resized_icons?.[0]?.width ?? 16}
                  height={a?.resized_icons?.[0]?.height ?? 16}
                  className={""}
                />
              </div>
            );
          } else {
            return <></>;
          }
        })}
        {rewardCount > 0 && (
          <h4 className="text-xs font-semibold">
            {rewardCount} award{rewardCount == 1 ? "" : "s"}
          </h4>
        )}
      </>
    );
  return <></>;
};

export default Awardings;
