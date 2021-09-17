import Head from "next/head";
import NavBar from "../components/NavBar";

const about = () => {
  return (
    <div>
      <Head>
        <title>troddit</title>
      </Head>
      <NavBar />
      <div className="flex flex-row items-center justify-center min-h-screen text-center dark:text-gray-300">
        <span>Browse Reddit better with Troddit</span>
      </div>
    </div>
  );
};

export default about;
