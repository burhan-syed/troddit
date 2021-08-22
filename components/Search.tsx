import Link from "next/link";
import { useState } from "react";

const Search = () => {

  const [query, setQuery] = useState("");

  const handleInputChange = () => {
    setQuery(""
    )
  }

  return (
    <form>
       <input
         placeholder="Search for..."
         onChange={handleInputChange}
       />
       <p>{query}</p>
     </form>
  );
};

export default Search;
