import { useState, useEffect } from "react";
import Image from "next/dist/client/image";
import Link from "next/dist/client/link";
import { numToString } from "../../lib/utils";

const MAX_DISPLAY = 5;

const Awardings = ({ all_awardings, truncate = true }) => {
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
      <div
        className={`rounded-lg select-none flex flex-row flex-wrap items-center justify-start text-xs font-semibold`}
      >
        {all_awardings.map((a, i) => (
          <div key={i} className="flex-none">
            {((truncate && i < MAX_DISPLAY) || !truncate) && (
              <div
                className="flex flex-row pr-1"
                title={`${a?.name} (${a?.count})`}
              >
                <Image
                  src={a?.resized_icons?.[1]?.url ?? a?.icon_url}
                  alt=""
                  unoptimized={true}
                  layout="intrinsic"
                  width={a?.resized_icons?.[0]?.width ?? 16}
                  height={a?.resized_icons?.[0]?.height ?? 16}
                  className="flex-none"
                />
                {/* {a?.count > 1 && !truncate && (
                  <p className="px-0.5">{a?.count}</p>
                )} */}
              </div>
            )}
          </div>
        ))}
        {rewardCount > 0 && (
          <p className="">{`${numToString(rewardCount, 1000)} award${
            rewardCount === 1 ? "" : "s"
          }`}</p>
        )}
      </div>
    );
  return <></>;
};

export default Awardings;
