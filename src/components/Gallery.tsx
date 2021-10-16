/* eslint-disable @next/next/no-img-element */
import Image from "next/dist/client/image";
import { useState, useEffect, createRef } from "react";

const Gallery = ({ images, maxheight=0 }) => {
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let ratio = 1;
    if (images.length > 0) {
      //console.log(images, "gallery");
      if (maxheight > 0){
        //console.log(maxheight);
        images.forEach((img,i) => {
          if (img.height > maxheight){
            ratio = maxheight/img.height; 
            images[i].height = Math.floor(img.height*ratio);
            images[i].width = Math.floor(img.width*ratio);
          }
        });
      }
      setLoaded(true);
    }
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
    'absolute text-white text-xl z-10 bg-black h-10 w-10 rounded-full flex items-center justify-center opacity-50';

  // Let's create dynamic buttons. It can be either left or right. Using
  // isLeft boolean we can determine which side we'll be rendering our button
  // as well as change its position and content.
  const sliderControl = isLeft => (
    <button
      type="button"
      onClick={isLeft ? previous : advance}
      className={`${arrowStyle} ${isLeft ? 'left-2' : 'right-2'} ${isLeft && index===0 && 'hidden' } ${!isLeft && index === images.length - 1 && 'hidden'}`}
      // style={{ top: '40%' }}
    >
      <span role="img" aria-label={`Arrow ${isLeft ? 'left' : 'right'}`}>
        {isLeft ? '◀' : '▶'}
      </span>
    </button>
  );

  if (loaded) {
    return (
      <div className="relative flex flex-row items-center">
        {/* <button className={index === 0 ? "opacity-0" : ""} onClick={(e) => previous(e)}>
          {"<"}
        </button> */}
        <div className="absolute z-10 p-2 bg-black rounded-lg opacity-50 top-2 right-2"><h1>{(index+1) + "/" + images.length}</h1></div>
        {sliderControl(true)}
        <div className="">
          {images.map((image, i) => {
            if (i < index+3 || i > index-3) {
              return (
                <div className={`${i===index ? 'block' : 'hidden'}`}>
                <Image
                key={i}
                  src={image.url}
                  height={image.height}
                  width={image.width}
                  alt=""
                  layout="intrinsic"
                  priority={false}
                  unoptimized={true}
                ></Image>
                </div>
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

//   const [currentImage, setCurrentImage] = useState(0);

//   // We are using react ref to 'tag' each of the images. Below will create an array of
//   // objects with numbered keys. We will use those numbers (i) later to access a ref of a
//   // specific image in this array.
//   const refs = images.reduce((acc, val, i) => {
//     acc[i] = createRef();
//     return acc;
//   }, {});

//   const scrollToImage = i => {
//     // First let's set the index of the image we want to see next
//     setCurrentImage(i);
//     // Now, this is where the magic happens. We 'tagged' each one of the images with a ref,
//     // we can then use built-in scrollIntoView API to do eaxactly what it says on the box - scroll it into
//     // your current view! To do so we pass an index of the image, which is then use to identify our current
//     // image's ref in 'refs' array above.
//     refs[i].current.scrollIntoView({
//       //     Defines the transition animation.
//       behavior: 'smooth',
//       //      Defines vertical alignment.
//       block: 'nearest',
//       //      Defines horizontal alignment.
//       inline: 'start',
//     });
//   };

//   // Some validation for checking the array length could be added if needed
//   const totalImages = images.length;

//   // Below functions will assure that after last image we'll scroll back to the start,
//   // or another way round - first to last in previousImage method.
//   const nextImage = () => {
//     if (currentImage >= totalImages - 1) {
//       scrollToImage(0);
//     } else {
//       scrollToImage(currentImage + 1);
//     }
//   };

//   const previousImage = () => {
//     if (currentImage === 0) {
//       scrollToImage(totalImages - 1);
//     } else {
//       scrollToImage(currentImage - 1);
//     }
//   };

//   // Tailwind styles. Most importantly notice position absolute, this will sit relative to the carousel's outer div.
//   const arrowStyle =
//     'absolute text-white text-2xl z-10 bg-black h-10 w-10 rounded-full opacity-75 flex items-center justify-center';

//   // Let's create dynamic buttons. It can be either left or right. Using
//   // isLeft boolean we can determine which side we'll be rendering our button
//   // as well as change its position and content.
//   const sliderControl = isLeft => (
//     <button
//       type="button"
//       onClick={isLeft ? previousImage : nextImage}
//       className={`${arrowStyle} ${isLeft ? 'left-2' : 'right-2'}`}
//       style={{ top: '40%' }}
//     >
//       <span role="img" aria-label={`Arrow ${isLeft ? 'left' : 'right'}`}>
//         {isLeft ? '◀' : '▶'}
//       </span>
//     </button>
//   );

//   return (
//   // Images are placed using inline flex. We then wrap an image in a div
//   // with flex-shrink-0 to stop it from 'shrinking' to fit the outer div.
//   // Finally the image itself will be 100% of a parent div. Outer div is
//   // set with position relative, so we can place our cotrol buttons using
//   // absolute positioning on each side of the image.
//     <div className="flex items-center justify-center w-screen p-12 md:w-1/2">
//       <div className="relative w-full">
//         <div className="carousel">
//           {sliderControl(true)}
//           {images.map((img, i) => (
//             <div className="flex-shrink-0 w-full" key={img} ref={refs[i]}>
//               <img src={img.url} alt={"img"} className="object-contain w-full" />
//               {/* <Image
//                   className="object-contain w-full"
//                   src={img.url}
//                   height={img.height}
//                   width={img.width}
//                   alt="image"
//                   layout="intrinsic"
//                   priority={true}
//                   unoptimized={true}
//                 ></Image> */}
//             </div>
//           ))}
//           {sliderControl(false)}
//         </div>
//       </div>
//     </div>
//   );
// };



};

export default Gallery;
