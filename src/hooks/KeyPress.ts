// import React, { useState, useEffect, Dispatch, SetStateAction, createRef, RefObject } from "react";
import {useState, useEffect} from 'react';
// const useKeyPress = function (targetKey: string, ref: RefObject<HTMLInputElement>) {
//     const [keyPressed, setKeyPressed] = useState(false);


//     function downHandler({ key }: { key: string }) {
//         if (key === targetKey) {
//             setKeyPressed(true);
//         }
//     }

//     const upHandler = ({ key }: { key: string }) => {
//         if (key === targetKey) {
//             setKeyPressed(false);
//         }
//     };

//     React.useEffect(() => {
//         ref.current?.addEventListener("keydown", downHandler);
//         ref.current?.addEventListener("keyup", upHandler);

//         return () => {
//             ref.current?.removeEventListener("keydown", downHandler);
//             ref.current?.removeEventListener("keyup", upHandler);
//         };
//     });

//     return keyPressed;
// };

export const  useKeyPress = (targetKey) => {
  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState<boolean>(false);
  // If pressed key is our target key then set to true
  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true);
    }
  }
  // If released key is our target key then set to false
  const upHandler = ({ key }) => {
    //console.log(key);
    if (key === targetKey) {
      setKeyPressed(false);
    }
  };
  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  }, []); // Empty array ensures that effect is only run on mount and unmount
  return keyPressed;
}