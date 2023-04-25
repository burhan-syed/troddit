import useResizeObserver from "@react-hook/resize-observer";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

const ResizeObserverComponent = ({ id, handleSizeChange }) => {
  const observeElement = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useResizeObserver(observeElement, (ref) => {
    setHeight(ref.contentRect.height);
  });
  useLayoutEffect(() => {
    setHeight(observeElement?.current?.getBoundingClientRect()?.height);
  }, []);
  useEffect(() => {
    if (id && height) {
      handleSizeChange(id, height);
    }
  }, [height, id, handleSizeChange]);

  return (
    <>
      <div
        ref={observeElement}
        className="absolute w-full h-full pointer-events-none"
      ></div>
      <div
        className="absolute top-0 w-full pointer-events-none"
        style={{
          height: `${height}px`,
        }}
      ></div>
    </>
  );
};

export default ResizeObserverComponent;
