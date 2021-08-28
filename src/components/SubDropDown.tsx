import axios from "axios";
import { useState } from "react";
import { useMainContext } from "../MainContext";

const SubDropDown = () => {
  const [mySubs, setMySubs] = useState([]);

  const context:any = useMainContext();

  const getSubs = async (after?) => {
    console.log("getsubs");
    if (context?.token?.accessToken ?? false) {
      console.log(context.token.accessToken);
      try {
        let data = await axios.get(
          "https://oauth.reddit.com/api/subreddits/mine/subscriber",
          {
            headers: {
              authorization: `bearer ${context.token.accessToken}`,
            },
            params: {
              after: "",
              before: "",
              count: 0,
              limit: 100,
            },
          }
        );
        console.log(data);
      } catch (err) {
        console.log(err);
      }
    }
  };

  return (
    <div>
      <button onClick={getSubs}>My Subs v </button>
    </div>
  );
};

export default SubDropDown;
