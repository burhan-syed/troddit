import Image from "next/image";
const Placeholder = ({ imageInfo }) => {
  return (
    <div className="object-fill">
      <Image
        src={imageInfo.url}
        height={imageInfo.height}
        width={imageInfo.width}
        alt="thumbnail"
        layout="responsive"
        placeholder="blur"
        blurDataURL={
          "iVBORw0KGgoAAAANSUhEUgAAAfQAAAAyCAYAAACqECmXAAAAuElEQVR42u3VMQ0AAAgDMPbi3y9ciCBpTTTpngIAXovQAUDoAIDQAQChAwBCBwChAwBCBwCEDgAIHQCEDgAIHQAQOgAgdAAQOgAgdABA6ACA0AFA6ACA0AEAoQMAQgcAoQMAQgcAhA4ACB0AhA4ACB0AEDoAIHQAEDoAIHQAQOgAgNABQOgAgNABAKEDAEIHAKEDAEIHAIQOAAgdAIQudAAQOgAgdABA6ACA0AFA6ACA0AEAoQMAZwGc6TYbROcIIwAAAABJRU5ErkJggg=="
        }
      />
    </div>
  );
};

export default Placeholder;
