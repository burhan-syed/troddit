import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ToastCustom from "../components/toast/ToastCustom";
import { subredditFilters, useMainContext } from "../MainContext";
import { userFilters } from "../MainContext";
const useFilterSubs = () => {
  const context: any = useMainContext(); 
  const {updateFilters, setUpdateFilters} = context; 
  const [filteredSubs, setFilteredSubs] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  useEffect(() => {
    const loadFilters = async () => {
      subredditFilters.iterate((value, key, iterationNumber) => {
        setFilteredSubs((f) => [...f, key]);
      });
      userFilters.iterate((value, key, iterationNumber) => {
        setFilteredUsers((f) => [...f, key]);
      });
    };

    loadFilters();
    return () => {
      setFilteredSubs([]);
      setFilteredUsers([]);
    };
  }, [updateFilters]);

  const addSubFilter = async (sub: string, showToast = true) => {
    if (sub.includes("/")) {
      sub = sub.split("/")?.[1] ?? sub;
    }
    let exists = await subredditFilters.getItem(sub.toUpperCase());
    if (exists == undefined && sub.length > 0) {
      subredditFilters.setItem(sub.toUpperCase(), 1);
      setFilteredSubs((f) => [...f, sub.toLowerCase()]);
      showToast &&
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Added r/${sub} to filters`}
              mode={"success"}
            />
          ),
          { position: "bottom-center", duration: 3000 }
        );
        setUpdateFilters(n => n+1);
    } else if (sub.length > 0) {
      showToast &&
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`r/${sub} already filtered`}
              mode={"error"}
            />
          ),
          { position: "bottom-center", duration: 3000 }
        );
    }
  };
  const removeSubFilter = async (sub: string) => {
    let exists = await subredditFilters.getItem(sub.toUpperCase());
    if (exists) {
      subredditFilters.removeItem(sub.toUpperCase());
      setFilteredSubs((f) =>
        f.filter((s) => s.toLowerCase() !== sub.toLowerCase())
      );
      setUpdateFilters(n => n+1);
    }
  };
  const addUserFilter = async (user: string, showToast = true) => {
    if (user.includes("/")) {
      user = user.split("/")?.[1] ?? user;
    }

    let exists = await userFilters.getItem(user.toUpperCase());
    if (exists == undefined && user.length > 0) {
      userFilters.setItem(user.toUpperCase(), 1);
      setFilteredUsers((f) => [...f, user.toLowerCase()]);
      showToast &&
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`Added u/${user} to filters`}
              mode={"success"}
            />
          ),
          { position: "bottom-center", duration: 3000 }
        );
        setUpdateFilters(n => n+1);

    } else if (user.length > 0) {
      showToast &&
        toast.custom(
          (t) => (
            <ToastCustom
              t={t}
              message={`u/${user} already filtered`}
              mode={"error"}
            />
          ),
          { position: "bottom-center", duration: 3000 }
        );
    }
  };
  const removeUserFilter = async (user: string) => {
    let exists = await userFilters.getItem(user.toUpperCase());
    if (exists) {
      userFilters.removeItem(user.toUpperCase());
      setFilteredUsers((f) =>
        f.filter((u) => u.toLowerCase() !== user.toLowerCase())
      );
      setUpdateFilters(n => n+1);

    }
  };

  return {
    filteredSubs,
    filteredUsers,
    addSubFilter,
    removeSubFilter,
    addUserFilter,
    removeUserFilter,
  };
};

export default useFilterSubs;
