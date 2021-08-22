import { useRouter } from "next/router";
import Feed from "../../../components/Feed";

const Subs = () => {
  const router = useRouter();
  const { subs } = router.query;
  return (
    <div>
      <p>sub: {subs}</p>
      <Feed subreddits={subs} sort="hot" />
    </div>
  );
};

export default Subs;
