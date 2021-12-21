/* eslint-disable @next/next/no-img-element */
import Image from "next/dist/client/image";
import { useState, useEffect, createRef } from "react";
import { AiOutlineRight, AiOutlineLeft } from "react-icons/ai";

const Gallery = ({ images, maxheight = 0 }) => {
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [imgtall, setimgtall] = useState(0);
  const [imgwidth, setimgwidth] = useState(0);
  const [style, setStyle] = useState({});
  const [imagesRender, setImagesRender] = useState(images);

  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = (e) => {
    if (touchStart - touchEnd > 50) {
      advance(e);
      //console.log("right");
    } else if (touchStart - touchEnd < -50) {
      previous(e);
      //console.log("left");
    }
  };

  useEffect(() => {
    let ratio = 1;
    let tallest = 0;
    let widest = 0;
    if (images.length > 0) {
      //console.log(images, "gallery");

      if (maxheight > 0) {
        let newimages = [];
        //console.log(maxheight);
        images.forEach((img, i) => {
          if (img.height > maxheight) {
            ratio = maxheight / img.height;
            newimages.push({
              url: img.url,
              height: Math.floor(img.height * ratio),
              width: Math.floor(img.width * ratio),
            });
          }
          if (images[i].height > tallest) {
            tallest = images[i].height;
          }
          if (images[i].width > widest) {
            widest = images[i].width;
          }
        });
        setImagesRender(newimages);
        setimgtall(tallest);
        setimgwidth(widest);
        setStyle({ height: `${tallest}px`, width: `${widest}px` });
      } else {
        setImagesRender(images);
      }
    }
    setLoaded(true);
    return () => {
      setLoaded(false);
    };
  }, [images, maxheight]);

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

  // Tailwind styles. Most importantly notice position absolute, this will sit relative to the carousel's outer div.
  const arrowStyle =
    "absolute text-lightText text-xl z-10 bg-black h-10 w-10 rounded-full flex items-center justify-center opacity-50";

  // Let's create dynamic buttons. It can be either left or right. Using
  // isLeft boolean we can determine which side we'll be rendering our button
  // as well as change its position and content.
  const sliderControl = (isLeft) => (
    <button
      type="button"
      onClick={isLeft ? previous : advance}
      className={`${arrowStyle} ${isLeft ? "left-2" : "right-2"} ${
        isLeft && index === 0 && "hidden"
      } ${!isLeft && index === images.length - 1 && "hidden"}`}
      // style={{ top: '40%' }}
    >
      <span role="img" aria-label={`Arrow ${isLeft ? "left" : "right"}`}>
        {isLeft ? <AiOutlineLeft /> : <AiOutlineRight />}
      </span>
    </button>
  );

  if (loaded) {
    return (
      <div
        className={"relative flex flex-row items-center"}
        onTouchStart={(e) => handleTouchStart(e)}
        onTouchMove={(e) => handleTouchMove(e)}
        onTouchEnd={(e) => handleTouchEnd(e)}
      >
        {/* <button className={index === 0 ? "opacity-0" : ""} onClick={(e) => previous(e)}>
          {"<"}
        </button> */}
        <div className="absolute z-10 p-2 bg-black rounded-lg opacity-50 text-lightText top-2 right-2">
          <h1>{index + 1 + "/" + images.length}</h1>
        </div>
        {/* <div className="block border-2 opacity-100 border-upvote">
          <Image
            className=""
            src={images[0].url}
            height={imgtall}
            width={imgwidth}
            alt=""
            layout="intrinsic"
            priority={false}
            unoptimized={true}
          ></Image>
        </div> */}
        {sliderControl(true)}
        <div className="">
          {imagesRender.map((image, i) => {
            if (i < index + 3 || i > index - 3) {
              return (
                <div
                  key={i + image.url}
                  className={`${i === index ? " opacity-100 block" : "hidden"}`}
                >
                  <Image
                    src={image.url}
                    height={image.height}
                    width={image.width}
                    alt=""
                    layout={image.url === "spoiler" ? "fill" : "intrinsic"}
                    priority={true}
                    unoptimized={true}
                  ></Image>
                </div>
              );
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
        {/* <button
          className={index === images.length - 1 ? "opacity-0" : ""}
          onClick={(e) => advance(e)}
        >
          {">"}
        </button> */}
        {sliderControl(false)}
      </div>
    );
  } else return <div>loading gallery</div>;
};

export default Gallery;
