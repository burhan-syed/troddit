/**
 * useScroll React custom hook
 * Usage:
 *    const { scrollX, scrollY, scrollDirection } = useScroll();
 */

import { useState, useEffect } from "react";
import { debounce } from "../../lib/utils";

export function useScroll() {
  // storing this to get the scroll direction
  const [lastScrollTop, setLastScrollTop] = useState(0);
  // the offset of the document.body
  const [bodyOffset, setBodyOffset] = useState<DOMRect>();
  // the vertical direction
  const [scrollY, setScrollY] = useState<number>();
  // the horizontal direction
  const [scrollX, setScrollX] = useState<number>();
  // scroll direction would be either up or down
  const [scrollDirection, setScrollDirection] = useState<
    "down" | "up" | undefined
  >();

  const listener = debounce(
    (e) => {
      let bodyOffset = document.body.getBoundingClientRect()
      //setBodyOffset(document.body.getBoundingClientRect());
      setScrollY(-(bodyOffset?.top ?? 0));
      setScrollX(bodyOffset?.left);
      setScrollDirection(
        bodyOffset?.top === undefined ||  lastScrollTop === -(bodyOffset?.top ?? 0)
          ? undefined
          : lastScrollTop > -(bodyOffset?.top ?? 0)
          ? "down"
          : "up"
      );
      setLastScrollTop(-(bodyOffset?.top ?? 0));
    },
    10,
    false
  );

  useEffect(() => {
    setBodyOffset(document.body.getBoundingClientRect());
    setScrollY(document.body.getBoundingClientRect().top);
    setScrollX(document.body.getBoundingClientRect().left);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", listener);
    return () => {
      window.removeEventListener("scroll", listener);
    };
  });

  return {
    scrollY,
    scrollX,
    scrollDirection,
  };
}
