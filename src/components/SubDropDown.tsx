import axios from "axios";
import { useState } from "react";

const SubDropDown = ({ accessToken }) => {
  const [mySubs, setMySubs] = useState([]);

  const getSubs = async (after?) => {
    console.log("getsubs");
    if (accessToken) {
      console.log(accessToken);
      try {
        let data = await axios.get(
          "https://oauth.reddit.com/api/subreddits/mine/subscriber",
          {
            headers: {
              authorization: `bearer ${accessToken}`,
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
