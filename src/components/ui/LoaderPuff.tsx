/* eslint-disable @next/next/no-img-element */
import React from "react";

const LoaderPuff = ({className="w-8 h-8 opacity-80"}) => {
  return (
    <>
      <img
        className={className}
        src="/loaders/puff.svg"
        alt="loading.."
      ></img>
    </>
  );
};

export default LoaderPuff;
