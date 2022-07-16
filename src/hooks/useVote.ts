import React, { useEffect, useMemo, useState } from "react";
import useMutate from "./useMutate";
interface VoteArgs {
  name: string;
  likes: number | boolean;
  score: number;
  scoreHideMins?: number;
  postTime?: number;
}

const calculateScore = (x: number) => {
  if (x < 1000) {
    return x.toString();
  } else {
    let y = Math.floor(x / 1000);
    let z = (x / 1000).toFixed(1);
    return z.toString() + "k";
  }
};

const useVote = ({ name, likes, score, postTime, scoreHideMins }: VoteArgs) => {
  const { voteMutation } = useMutate();
  const [voteScore, setVoteScore] = useState<number>(score);
  const [liked, setLiked] = useState<number | undefined>();

  const voteDisplay = useMemo(() => {
    let display = calculateScore(voteScore) ?? "0";
    if (scoreHideMins && postTime && scoreHideMins > 0 && postTime > 0) {
      const now = new Date().getTime() / 1000;
      if (postTime + scoreHideMins * 60 > now) {
        display = "Vote";
      }
    }
    return display;
  }, [voteScore, postTime, scoreHideMins]);

  useEffect(() => {
    setLiked(() => {
      if (likes === 1 || likes === true) return 1;
      if (likes === false || likes === -1) return -1;
      return undefined;
    });
    //update like changes or revert if theres an error liking
  }, [likes, voteMutation.isError]);

  const castVote = async (v) => {
    let postv;
    if (v === liked) {
      postv = 0;
    } else if (v === 1) {
      postv = 1;
    } else if (v === -1) {
      postv = -1;
    }
    let increment =
      postv === 0
        ? liked === 1
          ? -1
          : 1
        : postv === 1
        ? liked === -1
          ? 2
          : 1
        : postv === -1 ? (liked === 1 ? -2 : -1) : 0;
    setLiked(postv === 1 ? 1 : postv === -1 ? -1 : undefined);
    setVoteScore((v) => v + increment);
    voteMutation.mutate({ vote: postv, id: name, increment: increment });
  };

  return {
    voteDisplay,
    castVote,
    liked,
    loading: voteMutation.isLoading,
  };
};

export default useVote;
