import { useRouter } from "next/router";
import Feed from "../../../components/Feed"

const Users = () => {
  const router = useRouter();
  const { users } = router.query;
  return (
    <div>
      <p>user: {users}</p>
      <Feed subreddits={users} sort="hot" isUser={true} />
    </div>
  );
};

export default Users;
