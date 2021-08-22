import { useRouter } from "next/router";
import Feed from "../../../../components/Feed";

const Sort = () => {
  const router = useRouter();
  const { subs, sort } = router.query;
  return (
    <div>
      <p>
        query: {subs}
        {sort}
      </p>
      <Feed subreddits={subs} sort={sort} />
    </div>
  );
};

export default Sort;
