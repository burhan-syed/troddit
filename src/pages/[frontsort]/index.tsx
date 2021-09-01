import { useRouter } from "next/router";
import { useEffect } from "react";
import FrontPage from "../../components/FrontPage";
import NavBar from "../../components/NavBar";
import Sort from "../../components/Sort";

const Subs = ({ query }) => {
  const router = useRouter();
  const { frontsort } = router.query;

  return (
    <div>
      <NavBar/>
      <p>sort: {frontsort}</p>
      <FrontPage sort={frontsort ?? "best"} range={query.t ?? ""} />
    </div>
  );
};

Subs.getInitialProps = ({ query }) => {
  return { query };
};

export default Subs;
