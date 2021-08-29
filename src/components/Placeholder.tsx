import Image from "next/image";
const Placeholder = ({ imageInfo }) => {
  return (
    <div>
      <h1>{">>>PLACEHOLDER<<<"}</h1>
      <Image
        src={imageInfo.url}
        height={imageInfo.height}
        width={imageInfo.width}
        alt="thumbnail"
        layout="responsive"
      />
    </div>
  );
};

export default Placeholder;
