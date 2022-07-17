import React, { useEffect, useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import useHistory from "../../hooks/useHistory";

const History = () => {
  const { clearRead, clearSeen, getSeenCount, getReadCount } = useHistory();

  const [readCount, setReadCount] = useState<number>();
  const [seenCount, setSeenCount] = useState<number>();

  const setSeen = async () => {
    let seen = await getSeenCount();
    if (seen >= 0) {
      setSeenCount(seen);
    } else {
      setSeenCount(-1);
    }
  };
  const setRead = async () => {
    let read = await getReadCount();
    if (read >= 0) {
      setReadCount(read);
    } else {
      setReadCount(-1);
    }
  };

  const [seenPrompt, setSeenPrompt] = useState(false);
  const [readPrompt, setReadPrompt] = useState(false);

  const [clearingRead, setClearingRead] = useState(false);
  const [readErr, setReadErr] = useState(false);
  const clearReadAction = async () => {
    setReadPrompt(false);
    setClearingRead(true);
    const res = await clearRead();
    res ? setReadErr(false) : setReadErr(true);
    setRead();
    setClearingRead(false);
  };
  const [clearingSeen, setClearingSeen] = useState(false);
  const [seenErr, setSeenErr] = useState(false);
  const clearSeenAction = async () => {
    setSeenPrompt(false);
    setClearingSeen(true);
    const res = await clearSeen();
    res ? setSeenErr(false) : setSeenErr(true);
    setSeen();
    setClearingSeen(false);
  };

  useEffect(() => {
    if (seenCount === undefined) {
      setSeen();
    }
  }, []);
  useEffect(() => {
    if (readCount === undefined) {
      setRead();
    }
  }, []);

  const buttonStyle =
    "w-32 py-2 capitalize border rounded-md focus:outline-none hover:bg-th-highlight border-th-border hover:border-th-borderHighlight";
  return (
    <div className="flex flex-col w-full gap-3 text-sm">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          {seenCount === undefined ? (
            <>
              <ImSpinner2 />
            </>
          ) : seenCount >= 0 ? (
            <span>{seenCount}</span>
          ) : (
            <span>{"???"}</span>
          )}{" "}
          <span>posts seen</span>
        </div>
        {clearingSeen ? (
          <button
            aria-label="...loading"
            disabled={true}
            className={
              buttonStyle +
              " flex items-center justify-center text-transparent select-none"
            }
          >
            <span>.</span>
            <ImSpinner2 className="text-th-text animate-spin" />
            <span>.</span>
          </button>
        ) : seenPrompt ? (
          <div
            className={
              buttonStyle +
              " flex flex-col items-center justify-between relative"
            }
          >
            <label className="absolute -top-[14px] w-full text-xs text-center text-[8px]">
              Are you sure?{" "}
            </label>
            <div className="flex justify-center w-full gap-3">
              <button
                aria-label="yes"
                className="hover:underline"
                onClick={clearSeenAction}
              >
                Yes
              </button>
              <button
                aria-label="no"
                className="hover:underline"
                onClick={() => setSeenPrompt(false)}
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              aria-label="clear seen"
              className={buttonStyle}
              onClick={() => setSeenPrompt(true)}
            >
              Clear Seen
            </button>
            {seenErr && (
              <div className="absolute -bottom-[14px] text-center text-th-red text-[8px] w-full">
                something went wrong
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-1">
          {readCount === undefined ? (
            <>
              <ImSpinner2 className="animate-spin" />
            </>
          ) : readCount >= 0 ? (
            <span>{readCount}</span>
          ) : (
            <span>{"???"}</span>
          )}{" "}
          <span>posts read</span>
        </div>
        {clearingRead ? (
          <button
            aria-label="...loading"
            disabled={true}
            className={
              buttonStyle +
              " flex items-center justify-center text-transparent select-none"
            }
          >
            <span>.</span>
            <ImSpinner2 className="text-th-text animate-spin" />
            <span>.</span>
          </button>
        ) : readPrompt ? (
          <div
            className={
              buttonStyle +
              " flex flex-col items-center justify-between relative"
            }
          >
            <label className="absolute -top-[14px] w-full text-xs text-center text-[8px]">
              Are you sure?{" "}
            </label>
            <div className="flex justify-center w-full gap-3">
              <button
                aria-label="yes"
                className="hover:underline"
                onClick={clearReadAction}
              >
                Yes
              </button>
              <button
                aria-label="no"
                className="hover:underline"
                onClick={() => setReadPrompt(false)}
              >
                No
              </button>
            </div>
          </div>
        ) : (
          <div className="relative">
            <button
              aria-label="clear read"
              className={buttonStyle}
              onClick={() => setReadPrompt(true)}
            >
              Clear Read
            </button>
            {readErr && (
              <div className="absolute -bottom-[14px] text-center text-th-red text-[8px] w-full">
                something went wrong
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
