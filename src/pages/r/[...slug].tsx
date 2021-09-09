import { useRouter } from "next/router";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";

const Sort = ({ query }) => {
  return (
    <div>
      <NavBar />
      <Feed query={query} />
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
