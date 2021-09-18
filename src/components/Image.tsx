/* eslint-disable @next/next/no-img-element */
import LazyLoad  from "react-lazyload"


const MyImage = ({imageInfo}) => {
  return (
    <div >
      <LazyLoad height={`${imageInfo?.height}px`}>
        <img src={imageInfo.url} alt="img" />
      </LazyLoad>
    </div>
  )
}

export default MyImage
