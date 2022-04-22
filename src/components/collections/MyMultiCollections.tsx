import { useSession } from "next-auth/client";
import { useEffect, useState } from "react";
import { useSubsContext } from "../../MySubs";
import Collection from "./Collection";
import { MyCollectionsProvider } from "./CollectionContext";
import SelectedSubs from "./SelectedSubs";

const MyMultiCollections = () => {
  const mySubs: any = useSubsContext();
  const [session, loading] = useSession();
  let { myMultis, myLocalMultis, myLocalMultiRender } = mySubs;
  if (session) {
    return (
      <>
        {myMultis?.map((multi, i) => (
          <div key={i}>
            <Collection
              name={multi?.data?.display_name}
              subreddits={multi?.data?.subreddits?.map((subs) => subs?.name)}
              icon={multi?.data?.icon_url}
              over_18={multi?.data?.over_18}
              owner={multi?.data?.owner}
              key_color={multi?.data?.key_color}
            />
          </div>
        ))}
      </>
    );
  }
  if (!loading) {
    return (
      <>
        {myLocalMultis?.map((multi, i) => (
          <div key={i}>
            <Collection
              name={multi?.data?.display_name}
              subreddits={multi?.data?.subreddits?.map((subs) => subs?.name)}
              icon={multi?.data?.icon_url}
              over_18={multi?.data?.over_18}
              owner={multi?.data?.owner}
              key_color={multi?.data?.key_color}
            />
          </div>
        ))}
      </>
    );
  }

  return <></>;
};

export default MyMultiCollections;
