import React, { useEffect, useRef, useState } from "react";
import useFilterSubs from "../hooks/useFilterSubs";
import { MdOutlineClear } from "react-icons/md";
import { AiOutlinePlus } from "react-icons/ai";

const scrollbar =
  " scrollbar-thin scrollbar-thumb-th-scrollbar scrollbar-track-transparent scrollbar-thumb-rounded-full scrollbar-track-rounded-full ";

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
    <div className="flex flex-col gap-2 border rounded-md bg-th-background2 border-th-border">
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
                  className="flex flex-row justify-between p-2 rounded-md cursor-pointer group hover:bg-th-highlight"
                  onClick={(e) => {
                    e.preventDefault();
                    removeFilter(f);
                  }}
                >
                  <h4 className="capitalize">{f?.toLowerCase()}</h4>
                  <button
                    aria-label="remove"
                    className="p-0.5 rounded-md border-transparent group-hover:ring-2 hover:bg-th-highlight ring-th-accent border "
                  >
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
              " flex-grow border  outline-none ring-0 p-1 rounded-md border-th-border bg-th-highlight focus:border-th-borderHighlight "
            }
          />
          <button
            aria-label="add"
            onClick={(e) => handleSubmit(e)}
            className="flex items-center justify-center ml-2 border rounded-md w-9 h-9 hover:bg-th-highlight border-th-border hover:border-th-borderHighlight"
          >
            <AiOutlinePlus className="w-5 h-5" />
          </button>
        </form>
      ) : (
        <button
          aria-label="add"
          className="flex flex-row items-center px-2 py-1 mb-2 ml-2 border rounded-md hover:bg-th-highlight border-th-border w-28 hover:border-th-borderHighlight"
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
