import React, { useCallback, useState } from "react";

const useCardHeightTrigger = ({
  postCardRef,
  postName,
  handleSizeChange,
}: {
  postCardRef: React.RefObject<HTMLDivElement>;
  postName: string;
  handleSizeChange: (name: string, height: number) => void;
}) => {
  const checkCardHeight = useCallback((heightOverride?:number) => {
    const height = heightOverride ?? postCardRef.current?.getBoundingClientRect().height ?? 0;
    handleSizeChange(postName, height);
  }, [postName, postCardRef, handleSizeChange]);

  return checkCardHeight;
};

export default useCardHeightTrigger;
