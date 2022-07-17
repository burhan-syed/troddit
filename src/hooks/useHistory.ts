import React, { useState } from 'react'

import { localRead, localSeen, useMainContext } from "../MainContext";

const useHistory = () => {
  const context: any = useMainContext(); 
  const clearRead = async(since?: number) => {
    return await context.clearReadPosts();
  }
  const clearSeen = async(since?: number) => {
    try{
      await localSeen.clear(); 
      return true; 
    } catch(err){
      return false; 
    }  }
  const getReadCount = async() => {
    return await localRead.length()
  }
  const getSeenCount = async() => {
    return await localSeen.length()
  }
  return {
    clearRead,
    clearSeen,
    getSeenCount, 
    getReadCount,
  }
}

export default useHistory