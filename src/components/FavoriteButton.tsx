import React, { useState } from 'react'
import { BsStar, BsStarFill } from 'react-icons/bs'
import { useSubsContext } from '../MySubs';

const FavoriteButton = ({sub, favorited, isUser=false, forceShow=false}) => {
  const subsContext: any = useSubsContext();
 // const [favorited, setFavorited] = useState(sub?.data?.user_has_favorited ?? false); 
  const handleClick = async() => {
    let res = await subsContext.favorite(!favorited, sub?.data?.display_name, isUser); 
  }

  return (
    <button
    aria-label="favorite"
    onClick={(e) => {e.stopPropagation(); e.preventDefault(); handleClick()}}
        className={
          (favorited || forceShow ? " " : " md:opacity-0 md:group-hover:opacity-100 ")  + " outline-none select-none"
        }
      >
        {favorited ? (
          <BsStarFill className="flex-none w-5 h-5 transition text-th-accent hover:scale-95 hover:opacity-60 " />
        ) : (
          <BsStar className="flex-none w-5 h-5 transition hover:text-th-accent hover:scale-105" />
        )}
      </button>
  )
}

export default FavoriteButton