import { useRouter } from "next/router";
import { useEffect } from "react";
import Feed from "../../components/Feed";
import NavBar from "../../components/NavBar";
import Sort from "../../components/Sort";

const Subs = ({ query }) => {
  const router = useRouter();
  //console.log(query);
  const { frontsort } = router.query;

  return (
    <div>
      <NavBar />
      <p>sort: {frontsort}</p>
      <Feed query={query} />
    </div>
  );
};

Subs.getInitialProps = ({ query }) => {
  return { query };
};

export default Subs;
