import { BiUpvote, BiDownvote } from "react-icons/bi";
import { useState, useEffect } from "react";
import { postVote } from "../RedditAPI";
import { useSession } from "next-auth/client";
import { useMainContext } from "../MainContext";

const calculateScore = (x: number) => {
  if (x < 10000) {
    return x.toString();
  } else {
    let y = Math.floor(x / 1000);
    let z = (x / 1000).toFixed(1);
    return z.toString() + "k";
  }
};

const Vote = ({
  name,
  likes,
  score,
  size = 6,
  hideScore = false,
  postindex = undefined,
}) => {
  const [session] = useSession();
  const context: any = useMainContext();

  const [liked, setLiked] = useState<boolean>();
  const [voteScore, setVoteScore] = useState("");

  const castVote = async (e, v) => {
    e.stopPropagation();
    if (session) {
      let postv;
      if (v === liked) {
        postv = 0;
      } else if (v) {
        postv = 1;
      } else if (v === false) {
        postv = -1;
      }
      setLiked(postv === 1 ? true : postv === -1 ? false : undefined);
      setVoteScore(calculateScore(score + postv));
      let res = await postVote(postv, name);
      if (res) {
        context.updateLikes(
          postindex,
          postv === 1 ? true : postv === -1 ? false : null
        );
      } else {
        setLiked(undefined);
        setVoteScore(calculateScore(score));
      }
    } else {
      context.setLoginModal(true);
    }
  };
  useEffect(() => {
    //postindex > -1 && console.log(postindex, score, likes);
    setLiked(likes);
    setVoteScore(calculateScore(score));

    return () => {
      //setLiked(undefined);
    };
  }, [score, likes]);

  return (
    <>
      <BiUpvote
        onClick={(e) => castVote(e, true)}
        className={
          (liked && " text-upvote ") +
          ` flex-none cursor-pointer w-${size} h-${size} hover:text-upvote hover:scale-110`
        }
      />
      {!hideScore && (
        <>
          <p
            className={
              (liked
                ? " text-upvote "
                : liked === false
                ? "text-downvote "
                : " ") + " text-sm"
            }
          >
            {voteScore ?? "0"}
          </p>
        </>
      )}

      <BiDownvote
        onClick={(e) => castVote(e, false)}
        className={
          (liked === false && " text-downvote ") +
          ` flex-none cursor-pointer w-${size} h-${size} hover:text-downvote hover:scale-110`
        }
      />
    </>
  );
};

export default Vote;
