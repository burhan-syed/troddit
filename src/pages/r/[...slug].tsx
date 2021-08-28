import { useRouter } from "next/router";
import Feed from "../../components/Feed";
import Link from "next/link";
import NavBar from "../../components/NavBar";

const Sort = ({ query }) => {
  const router = useRouter();
  const [subs, sort] = router.query?.slug ?? [];
  return (
    <div>
      <NavBar/>
      <p>
        query: {subs}
        {sort}
      </p>
      <Feed
        subreddits={subs}
        sort={sort ?? "hot"}
        isUser={false}
        range={query?.t ?? ""}
      />
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
