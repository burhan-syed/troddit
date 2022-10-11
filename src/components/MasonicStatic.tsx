import { useWindowSize } from '@react-hook/window-size';
import {
  Masonry,
  useContainerPosition,
  useInfiniteLoader,
  usePositioner,
  useMasonry,
  useScroller,
  useResizeObserver,
} from "masonic";import React from 'react'

const MasonicStatic = ({key, items, render, onRender,cols,margin}) => {
  const [windowWidth, windowHeight] = useWindowSize();
  const containerRef = React.useRef(null);
  const { offset, width } = useContainerPosition(containerRef, [
    windowWidth,
    windowHeight,
  ]);
  const positioner = usePositioner({
    width,
    columnGutter: 0,
    columnWidth: width / cols,
    columnCount: cols
  });
  const resizeObserver = useResizeObserver(positioner);
  const { scrollTop, isScrolling } = useScroller(offset);
  let m = parseInt(margin.split("m-")?.[1] ?? 0);

  return (
    <>
    {useMasonry({
          positioner,
          scrollTop,
          isScrolling,
          height: windowHeight,
          containerRef,
          items: items,
          itemHeightEstimate : ((((width/cols) - (m*8))*16)/9),
          overscanBy: 4,
          render: render,
          onRender: onRender,
          resizeObserver, 
          className: "outline-none"        })}
    </>
  )
}

export default MasonicStatic