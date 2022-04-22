/* eslint-disable @next/next/no-img-element */
import Head from "next/head";
import SubCardPlaceHolder from "../components/cards/SubCardPlaceHolder";
import Collection from "../components/collections/Collection";
import NavBar from "../components/NavBar";
const collections = () => {
  return (
    <div className="m-10">
      <Collection />
    </div>
  );
};

export default collections;
