import React, { useEffect, useRef, useState } from "react";
import { IoMdRefresh } from "react-icons/io";
import { useMainContext } from "../../MainContext";

interface IntInputProps {
  label?: string;
  subtext?: string;
  setting: "fastRefreshInterval" | "slowRefreshInterval" | "autoPlayInterval";
  mini?: boolean;
  rounded?: boolean; 
  styles?: string
}

const IntInput = ({ label, subtext, setting, mini = false, rounded=true, styles="" }: IntInputProps) => {
  const context: any = useMainContext();
  const [defaultValue, setDefaultValue] = useState<number>();
  const [inputValue, setInputValue] = useState<number>();
  const [inputLabel, setInputLabel] = useState<string | undefined>(label);
  const [inputSubtext, setInputSubtext] = useState<string | undefined>(subtext);
  const [errMessage, setErrMessage] = useState("");
  const [MAX, setMAX] = useState(24 * 60 * 60);
  const [MIN, setMIN] = useState(5);
  const [disabled, setDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (context.ready) {
      switch (setting) {
        case "fastRefreshInterval":
          setDefaultValue(60);
          setInputValue(context?.fastRefreshInterval / 1000 ?? 60);
          !label && setInputLabel("Fast Refresh Interval");
          !subtext &&
            setInputSubtext(
              `The interval, in seconds, to check for new posts when sorted by new or rising. "Monitor Feed" must be enabled. `
            );
          break;
        case "slowRefreshInterval":
          setDefaultValue(60 * 30);
          setInputValue(context?.slowRefreshInterval / 1000 ?? 60 * 30);
          !label && setInputLabel("Refresh Interval");
          !subtext &&
            setInputSubtext(
              `The interval, in seconds, to check for new posts when not sorted by new or rising. "Monitor Feed" must be enabled.`
            );
          break;
        case "autoPlayInterval":
          setMIN(1);
          setMAX(9999);
          setDefaultValue(10);
          setInputValue(context?.autoPlayInterval ?? 10);
          !label && setInputLabel("Auto Play Interval");
          !subtext &&
            setInputSubtext(
              `The interval, in seconds, before moving to the next post`
            );
          break;
        default:
          break;
      }
    }
  }, [context.ready]);

  useEffect(() => {
    if (
      setting === "fastRefreshInterval" ||
      setting === "slowRefreshInterval"
    ) {
      if (!context.autoRefreshFeed) {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    }
  }, [context.autoRefreshFeed]);

  useEffect(() => {
    if (inputValue || inputValue === 0) {
      if (+inputValue > MAX) {
        setErrMessage(`Can't exceed ${MAX}`);
      } else if (+inputValue < MIN) {
        setErrMessage(`Must be greater than ${MIN}`);
      } else {
        setErrMessage("");

        switch (setting) {
          case "fastRefreshInterval":
            context.setFastRefreshInterval(inputValue * 1000);
            break;
          case "slowRefreshInterval":
            context.setSlowRefreshInterval(inputValue * 1000);
            break;
          case "autoPlayInterval":
            context.setAutoPlayInterval(inputValue);
            break;
          default:
            break;
        }
      }
    }
  }, [inputValue]);

  return (
    <form
      className={
        "flex gap-2  hover:cursor-pointer " +
        (disabled ? " opacity-50 pointer-events-none  " : "") + (rounded ? " rounded-md " : " ") + (mini ? "" : " p-2 hover:bg-th-highlight ")
        + styles
      }
      onSubmit={(e) => e.preventDefault()}
      onClick={(e) => {
        e.preventDefault();
        inputRef?.current?.select();
      }}
    >
      {mini ? <></>: <label className="flex flex-col gap-0.5 hover:cursor-pointer">
        <span>{inputLabel}</span>
        {inputSubtext && (
          <span className="mr-2 text-xs opacity-70">{inputSubtext}</span>
        )}
      </label>}
      
      <div
        className={"flex flex-col items-end justify-center min-h-full " + (mini ? "" : " my-3  ")}
      >
        <div className="relative flex justify-end flex-grow w-20 h-full px-1 text-sm text-right border rounded-md outline-none ring-0 border-th-border bg-th-highlight focus:border-th-borderHighlight">
          {defaultValue && (
            <button
              aria-label="apply default"
              disabled={disabled}
              onClick={(e) => {
                e.preventDefault();
                setInputValue(defaultValue);
              }}
              className="rounded-full opacity-20 hover:opacity-80 "
              title="Default"
            >
              <IoMdRefresh className="flex-none w-4 h-4 " />
            </button>
          )}
          <input
            ref={inputRef}
            className={
              "bg-transparent outline-none w-full h-full flex-grow text-right"
            }
            disabled={!context.ready}
            type="text"
            onKeyPress={(event) => {
              if (
                !/[0-9]/.test(event.key) ||
                +`${inputValue}${event.key}` > MAX ||
                disabled
              ) {
                if (!disabled) {
                  if (!/[0-9]/.test(event.key)) {
                    setErrMessage("Enter numbers only");
                  } else if (+`${inputValue}${event.key}` > MAX) {
                    setErrMessage(`Can't exceed ${MAX}`);
                  }
                }

                event.preventDefault();
              }
            }}
            value={inputValue}
            onChange={(e) => setInputValue(+e.target.value)}
          />

          {true && (
            <span
              className="absolute italic text-left translate-y-full -bottom-1 text-th-red"
              style={{ fontSize: "0.5rem", lineHeight: "0.5rem" }}
            >
              {errMessage}
            </span>
          )}
        </div>
      </div>
    </form>
  );
};

export default IntInput;
