import { useSession } from "next-auth/react";
import { useSubsContext } from "../../MySubs";
import Collection from "./Collection";

const MyMultiCollections = () => {
  const mySubs: any = useSubsContext();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  let { myMultis, myLocalMultis, myLocalMultiRender } = mySubs;
  if (session && myMultis?.length > 0) {
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
              isOwner={true}
              collapsed={myMultis?.length > 5}
            />
          </div>
        ))}
      </>
    );
  }
  if (!loading && myLocalMultis?.length > 0) {
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
              isOwner={true}
              collapsed={myLocalMultis?.length > 5}

            />
          </div>
        ))}
      </>
    );
  }

  return (
    <div className="mt-3 text-center">
      No multis or subreddit collections found<br></br>Try using the search to
      add subs and create a multi
    </div>
  );
};

export default MyMultiCollections;
