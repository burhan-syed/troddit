import { BiUpvote, BiDownvote } from "react-icons/bi";
import { useState, useEffect } from "react";
import { postVote } from "../RedditAPI";
import { useSession } from "next-auth/client";
import { useMainContext } from "../MainContext";

const calculateScore = (x: number) => {
  console.log(x);
  if (x < 10000) {
    return x.toString();
  } else {
    let y = Math.floor(x / 1000);
    let z = (x / 1000).toFixed(1);
    return z.toString() + "k";
  }
};

const Vote = ({ name, likes, score, size = 6, hideScore = false }) => {
  const [session] = useSession();
  const context: any = useMainContext();

  const [vote, setVote] = useState<undefined | number>();
  const [liked, setLiked] = useState();
  const [voteScore, setVoteScore] = useState("");

  const castVote = async (e, v) => {
    e.stopPropagation();
    if (session) {
      v === vote ? (v = 0) : undefined;
      let res = await postVote(v, name);
      res ? setVote(v) : undefined;
    } else {
      context.setLoginModal(true);
    }
  };
  useEffect(() => {
    setLiked(likes);
    if (vote === 1 || vote === 0 || vote === -1) {
      setVote(vote);
    } else if (likes) {
      setVote(1);
    } else if (likes === false) {
      setVote(-1);
    } else {
      setVote(0);
    }
    setVoteScore(calculateScore(score + vote));

    return () => {};
  }, [score, vote, likes]);

  return (
    <>
      <BiUpvote
        onClick={(e) => castVote(e, 1)}
        className={
          ((vote === 1 || liked) &&
            vote !== 0 &&
            vote !== -1 &&
            " text-upvote ") +
          ` flex-none cursor-pointer w-${size} h-${size} hover:text-upvote hover:scale-110`
        }
      />
      {!hideScore && (
        <>
          <p
            className={
              ((vote === 1 || liked) && vote !== 0 && vote !== -1
                ? " text-upvote "
                : (vote === -1 || likes === false) && vote !== 1 && vote !== 0
                ? "text-downvote "
                : " ") + " text-sm"
            }
          >
            {voteScore ?? "0"}
          </p>
        </>
      )}

      <BiDownvote
        onClick={(e) => castVote(e, -1)}
        className={
          ((vote === -1 || liked === false) &&
            vote !== 1 &&
            vote !== 0 &&
            " text-downvote ") +
          ` flex-none cursor-pointer w-${size} h-${size} hover:text-downvote hover:scale-110`
        }
      />
    </>
  );
};

export default Vote;
