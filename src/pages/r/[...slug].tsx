import { useRouter } from "next/router";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";

const Sort = ({ query }) => {
  const router = useRouter();
  console.log(query);
  const [subs, sort] = router.query?.slug ?? [];
  return (
    <div>
      <NavBar />
      <p>
        query: {subs}
        {sort}
      </p>
      <Feed query={query} />
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
