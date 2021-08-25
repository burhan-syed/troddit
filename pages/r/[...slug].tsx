import { useRouter } from "next/router";
import Feed from "../../components/Feed";
import Link from "next/link";
import FrontPage from "../../components/FrontPage";
const Sort = () => {
  const router = useRouter();
  const [subs, sort]= router.query?.slug ?? [];
  return (
    <div>
      <Link href='/'>Home</Link>
      <p>
        query: {subs}
        {sort}
      </p>
      {subs ? <Feed subreddits={subs} sort={sort ?? "hot"} isUser={false}/> : <FrontPage sort="best" range=""/>}
      
    </div>
  );
};

export default Sort;
