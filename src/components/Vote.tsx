import { BiUpvote, BiDownvote } from "react-icons/bi";
import { useState, useEffect } from "react";
import { postVote } from "../RedditAPI";
import { useSession } from "next-auth/react";
import { useMainContext } from "../MainContext";
import { useKeyPress } from "../hooks/KeyPress";

const calculateScore = (x: number) => {
  if (x < 1000) {
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
  postMode = false,
}) => {
  const { data: session, status } = useSession();
  const context: any = useMainContext();
  const aPress = useKeyPress("a");
  const zPress = useKeyPress("z");

  const [liked, setLiked] = useState<boolean>();
  const [voteScore, setVoteScore] = useState("");

  const castVote = async (e, v) => {
    e?.preventDefault();
    e?.stopPropagation();
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

  useEffect(() => {
    if (!context.replyFocus && postMode) {
      if (aPress) {
        castVote(undefined, true);
      } else if (zPress) {
        castVote(undefined, false);
      }
    }

    return () => {};
  }, [aPress, zPress, context.replyFocus]);

  const VoteFilledUp = (
    <svg
      onClick={(e) => castVote(e, true)}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      className={
        (liked ? " text-upvote " : "") +
        ` flex-none cursor-pointer w-${size} h-${size} hover:text-upvote scale-110 hover:scale-100`
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{`unvote ${postMode ? "(a)" : ""}`}</title>
      <path d="M12.781,2.375C12.4,1.9,11.6,1.9,11.219,2.375l-8,10c-0.24,0.301-0.286,0.712-0.12,1.059C3.266,13.779,3.615,14,4,14h2h2 v3v4c0,0.553,0.447,1,1,1h6c0.553,0,1-0.447,1-1v-5v-2h2h2c0.385,0,0.734-0.221,0.901-0.566c0.166-0.347,0.12-0.758-0.12-1.059 L12.781,2.375z"></path>
    </svg>
  );

  const VoteFilledDown = (
    <svg
      onClick={(e) => castVote(e, false)}
      stroke="currentColor"
      fill="currentColor"
      strokeWidth="0"
      viewBox="0 0 24 24"
      className={
        (liked === false ? " text-downvote " : " ") +
        ` flex-none cursor-pointer w-${size} h-${size} hover:text-downvote scale-110 hover:scale-100`
      }
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>{`unvote ${postMode ? "(v)" : ""}`}</title>
      <path d="M20.901,10.566C20.734,10.221,20.385,10,20,10h-2h-2V7V3c0-0.553-0.447-1-1-1H9C8.447,2,8,2.447,8,3v5v2H6H4 c-0.385,0-0.734,0.221-0.901,0.566c-0.166,0.347-0.12,0.758,0.12,1.059l8,10C11.409,21.862,11.696,22,12,22 s0.591-0.138,0.781-0.375l8-10C21.021,11.324,21.067,10.913,20.901,10.566z"></path>
    </svg>
  );

  return (
    <>
      {liked ? (
        <>{VoteFilledUp}</>
      ) : (
        <BiUpvote
          title={`upvote ${postMode ? "(a)" : ""}`}
          onClick={(e) => castVote(e, true)}
          className={
            (liked ? " text-upvote " : liked === false ? " opacity-50 " : "") +
            ` flex-none cursor-pointer w-${size} h-${size} hover:text-upvote hover:scale-110 hover:opacity-100`
          }
        />
      )}
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
      {liked === false ? (
        <>{VoteFilledDown}</>
      ) : (
        <BiDownvote
          title={`downvote ${postMode ? "(v)" : ""}`}
          onClick={(e) => castVote(e, false)}
          className={
            (liked ? " opacity-50 " : "") +
            ` flex-none cursor-pointer w-${size} h-${size} hover:text-downvote hover:scale-110 hover:opacity-100`
          }
        />
      )}
    </>
  );
};

export default Vote;
