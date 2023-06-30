import React, { useState } from "react";
import { ImSpinner2 } from "react-icons/im";
import { BsExclamationCircleFill } from "react-icons/bs";
const EmailForm = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const formSubmit = async (e) => {
    e.preventDefault();
    const email = e.target?.email?.value;
    if (!email) {
      setError("email required");
      return;
    }
    setStatus("");
    setError("");
    setLoading(true);
    const options = {
      // The method is POST because we are sending data.
      method: "POST",
      // Tell the server we're sending JSON.
      headers: {
        "Content-Type": "application/json",
      },
      // Body of the request is the JSON data we created above.
      body: JSON.stringify({ email: email }),
    };
    try {
      const res = await fetch("/api/form/email", options);
      const data = await res.json();
      if (!res.ok) {
        setError(data?.data ?? "something went wrong");
      } else {
        setStatus(data?.data ?? "email submitted");
      }
    } catch (error) {
      setError("something went wrong");
    }
    setLoading(false);
  };

  return (
    <form
      method="post"
      onSubmit={formSubmit}
      className="flex flex-col justify-center gap-y-4"
    >
      <div className="flex flex-col gap-y-0.5">
        <label
          htmlFor="emailInput"
          className="text-xs font-medium text-th-textLight"
        >
          email address
        </label>
        <input
          id="emailInput"
          name={"email"}
          required
          type={"email"}
          placeholder={"your email.."}
          className={
            "focus:ring focus:ring-th-accent  focus:border-transparent shadow-sm rounded-md outline-none px-3 py-2 w-full border border-th-border bg-th-highlight h-12"
          }
        />
      </div>

      <div className="w-full">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center w-full h-12 px-4 text-base font-medium border border-transparent rounded-md shadow-sm bg-th-accent hover:brightness-125 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-th-accent sm:text-sm"
        >
          {loading ? <ImSpinner2 className="animate-spin" /> : "submit"}
        </button>
      </div>
      <div className="flex items-center justify-center h-4 text-xs text-center md:text-sm text-opacity-80">
        {status && <span className="text-th-textLight">{status}</span>}
        {error && (
          <span className="inline-flex items-center text-th-red gap-x-1">
            <BsExclamationCircleFill className="flex-none w-4 h-4 " />
            {error}
          </span>
        )}
      </div>
    </form>
  );
};

export default EmailForm;
