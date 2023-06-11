import React,{ useState, useEffect } from "react";
import Image from "next/legacy/image";
import { numToString } from "../../lib/utils";
import { useMainContext } from "../MainContext";

const MAX_DISPLAY = 5;

const Awardings = ({ all_awardings, truncate = true, styles = "" }) => {
  const [rewardCount, setRewardCount] = useState(0);
  const context: any = useMainContext();
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

  if (all_awardings?.length > 0 && context.showAwardings)
    return (
      <>
        {all_awardings?.sort((a,b) => a?.coin_price > b?.coin_price ? -1 : a?.coin_price < b?.coin_price ? 1 : 0)?.slice(0,truncate ? MAX_DISPLAY : Infinity).map((a, i) => {
            return (
              <div
                key={a?.icon_url ?? i}
                className={styles}
                title={`${a?.name} (${a?.count})`}
              >
                <Image
                  src={a?.resized_icons?.[1]?.url ?? a?.icon_url}
                  alt={`${a?.name} (${a?.count})`}
                  unoptimized={true}
                  layout="intrinsic"
                  width={a?.resized_icons?.[0]?.width ?? 16}
                  height={a?.resized_icons?.[0]?.height ?? 16}
                  className={""}
                />
              </div>
            );
        })}
        {rewardCount > 0 && (
          <span className="text-xs font-semibold">
            {rewardCount} award{rewardCount == 1 ? "" : "s"}
          </span>
        )}
      </>
    );
  return <></>;
};

export default Awardings;
