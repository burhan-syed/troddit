import { useRouter } from "next/router";

const Subs = () => {
  const router = useRouter();
  const { frontsort } = router.query;
  return (
    <div>
      <p>sort: {frontsort}</p>
    </div>
  );
};

export default Subs;
