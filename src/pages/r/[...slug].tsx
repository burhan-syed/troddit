import { useRouter } from "next/router";
import Link from "next/link";
import NavBar from "../../components/NavBar";
import Feed from "../../components/Feed";
import LoginModal from "../../components/LoginModal";
const Sort = ({ query }) => {
  return (
    <div>
      <div className="z-50">
        <LoginModal />
      </div>
      <NavBar />
      <Feed query={query} />
    </div>
  );
};

Sort.getInitialProps = ({ query }) => {
  return { query };
};

export default Sort;
