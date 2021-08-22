import Image from "next/dist/client/image";
import { useState, useEffect } from "react";
const Gallery = ({ images }) => {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (images.length > 0) {
      //console.log(images, "gallery");
      setLoaded(true);
    }
  }, [images]);
  if (loaded) {
    return (
      <div>
        {images.map((image, i) => {
          return (
            <div key={i}>
              <Image
                src={image.url}
                height={image.height}
                width={image.width}
                alt="thumbnail"
              ></Image>
            </div>
          );
        })}
      </div>
    );
  } else return <div>loading gallery</div>;
};

export default Gallery;
