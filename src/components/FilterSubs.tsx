import React, { useEffect, useRef, useState } from "react";
import useFilterSubs from "../hooks/useFilterSubs";
import { MdOutlineClear } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";

const scrollbar =
  " scrollbar-thin scrollbar-thumb-lightScroll scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full dark:scrollbar-thumb-darkScroll";

const FilterSubs = ({ mode = "subs" }) => {
  const {
    filteredSubs,
    filteredUsers,
    addSubFilter,
    removeSubFilter,
    addUserFilter,
    removeUserFilter,
  } = useFilterSubs();

  const [openForm, setOpenForm] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    return () => {
      setOpenForm(false);
    };
  }, []);
  useEffect(() => {
    openForm && inputRef?.current?.focus();
    return () => {};
  }, [openForm]);

  const handleSubmit = (e) => {
    e.preventDefault();
    mode == "subs"
      ? addSubFilter(input, false)
      : mode == "users"
      ? addUserFilter(input, false)
      : "";

    setInput("");
  };

  const removeFilter = (f) => {
    mode == "subs"
      ? removeSubFilter(f)
      : mode == "users"
      ? removeUserFilter(f)
      : "";
  };
  return (
    <div className="flex flex-col gap-2 border rounded-md dark:bg-darkHighlight bg-lightPostHover border-lightBorder dark:border-transparent">
      <div
        className={
          "flex flex-col p-2   max-h-40 overflow-y-scroll" + `${scrollbar}`
        }
      >
        {(mode == "subs" ? filteredSubs : mode == "users" ? filteredUsers : [])
          .length > 0 ? (
          <>
            {(mode == "subs"
              ? filteredSubs
              : mode == "users"
              ? filteredUsers
              : []
            )
              .sort((a, b) => {
                let A = a.toUpperCase();
                let B = b.toUpperCase();
                return A < B ? -1 : A > B ? 1 : 0;
              })
              .map((f) => (
                <div
                  key={f}
                  className="flex flex-row justify-between p-2 rounded-md cursor-pointer group hover:dark:bg-darkBG hover:bg-lightHighlight"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFilter(f);
                  }}
                >
                  <h4 className="capitalize">{f?.toLowerCase()}</h4>
                  <button className="p-0.5 border rounded-md border-transparent hover:ring group-hover:dark:border-darkBorder group-hover:border-lightBorderHighlight">
                    <MdOutlineClear className="w-5 h-5 transition-transform " />
                  </button>
                </div>
              ))}
          </>
        ) : (
          <h3 className="font-semibold text-center">
            {mode == "subs"
              ? "No Subreddits Filtered"
              : mode == "users"
              ? "No Users Filtered"
              : ""}
          </h3>
        )}
      </div>
      {openForm ? (
        <form
          onSubmit={(e) => handleSubmit(e)}
          className="flex items-center flex-grow mx-2 mb-2 mr-4 rounded-md "
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Add.."
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            className={
              "dark:bg-darkPostHover flex-grow border dark:border-darkBorder border-lightBorder bg-lightPostHover outline-none ring-0 p-1 rounded-md focus:dark:border-darkBorderHighlight focus:border-lightBorderHighlight "
            }
          />
          <button
            onClick={(e) => handleSubmit(e)}
            className="flex items-center justify-center ml-2 border rounded-md w-9 h-9 dark:border-darkBorder hover:dark:border-darkBorderHighlight border-lightBorder hover:dark:bg-darkBG hover:border-lightBorderHighlight hover:bg-lightHighlight"
          >
            <AiOutlinePlus className="w-5 h-5" />
          </button>
        </form>
      ) : (
        <button
          className="flex flex-row items-center px-2 py-1 mb-2 ml-2 border rounded-md hover:border-lightBorderHighlight hover:dark:bg-darkPostHover w-28 dark:border-darkBorder dark:hover:border-darkBorderHighlight"
          onClick={(e) => {
            e.preventDefault();
            setOpenForm((o) => !o);
          }}
        >
          <AiOutlinePlus className="flex-none mr-1" />
          add filter
        </button>
      )}
    </div>
  );
};

export default FilterSubs;
