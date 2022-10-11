import useResizeObserver from '@react-hook/resize-observer';
import React from 'react'

const ResizeObserverComponent = ({postRef, post, handleSizeChange}) => {
  useResizeObserver(postRef, () =>
  handleSizeChange(
    post?.data?.name,
    postRef?.current?.getBoundingClientRect()?.height
  )
);
  return (
    <></>
  )
}

export default ResizeObserverComponent