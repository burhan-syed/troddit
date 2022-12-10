import React, { useEffect } from 'react'
import { useScroll } from './useScroll';

const useNavBarScrollHelper = ({allowHide, allowShow, autoHideNav, setHidden, timeSinceNav}) => {
  const { scrollY, scrollDirection } = useScroll();
  useEffect(() => {
    const now = new Date().getTime();
    if (allowHide && now > timeSinceNav + 1000) {
      if (scrollDirection === "down" || (!scrollY && allowShow)) {
        setHidden(false);
      } else if (scrollY && scrollY > 300 && scrollDirection === "up" && autoHideNav) {
        setHidden(true);
      } else if ((!scrollY || scrollY <= 300) && allowShow) {
        setHidden(false);
      }
    } else {
      if (allowShow) {
        setHidden(false);
      }
    }
}, [scrollDirection, allowHide, scrollY, autoHideNav]);
}

export default useNavBarScrollHelper