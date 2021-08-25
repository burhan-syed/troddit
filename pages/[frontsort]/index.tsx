import { useRouter } from "next/router";
import { useEffect } from "react";
import FrontPage from "../../components/FrontPage";
import Sort from "../../components/Sort"

const Subs = ({query: {t}}) => {
  const router = useRouter();
  const { frontsort } = router.query;

  useEffect(() => {
    
  }, [t])
  return (
    <div>
      <p>sort: {frontsort}</p>
      <Sort/>
      <FrontPage sort={frontsort} range={t}/>
    </div>
  );
};

Subs.getInitialProps = ({query}) => {
  return {query}
};

export default Subs;
