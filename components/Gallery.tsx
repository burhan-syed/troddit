import Image from "next/dist/client/image";
import { useState, useEffect } from "react";

const Gallery = ({ images }) => {
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (images.length > 0) {
      //console.log(images, "gallery");
      setLoaded(true);
    }
  }, [images]);

  const advance = () => {
    if (index < images.length - 1) {
      setIndex(index + 1);
    }
  };
  const previous = () => {
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  if (loaded) {
    return (
      <div>
        {index != 0 ? <button onClick={previous}>{"<"}</button> : ""}
        <Image
          src={images[index].url}
          height={images[index].height}
          width={images[index].width}
          alt="thumbnail"
        ></Image>
        {index < images.length - 1 ? (
          <button onClick={advance}>{">"}</button>
        ) : (
          ""
        )}
      </div>
    );
  } else return <div>loading gallery</div>;
};

export default Gallery;
