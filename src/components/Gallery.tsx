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

  const advance = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (index < images.length - 1) {
      setIndex(index + 1);
    }
  };
  const previous = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  if (loaded) {
    return (
      <div className="flex flex-row items-center">
        <button className={index === 0 ? "opacity-0" : ""} onClick={(e) => previous(e)}>
          {"<"}
        </button>
        <div className="">
          {images.map((image, i) => {
            if (i === index) {
              return (
                <Image
                key={i}
                  src={image.url}
                  height={image.height}
                  width={image.width}
                  alt="image"
                  layout="intrinsic"
                  priority={true}
                  unoptimized={true}
                ></Image>
              );
            } else {
              return "";
            }
          })}
        </div>

        {/* <Image
          src={images[index].url}
          height={images[index].height}
          width={images[index].width}
          alt="thumbnail"
          layout="intrinsic"
        ></Image> */}
        <button
          className={index === images.length - 1 ? "opacity-0" : ""}
          onClick={(e) => advance(e)}
        >
          {">"}
        </button>
      </div>
    );
  } else return <div>loading gallery</div>;
};

export default Gallery;
