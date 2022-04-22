import React, { useContext, useEffect, useState } from "react";

export const CollectionContext: any = React.createContext({});
export const useCollectionContext = () => {
  return useContext(CollectionContext);
};

export const MyCollectionsProvider = ({ children }) => {
  const [selected, setSelected] = useState([]);
  const toggleSelected = (sub) => {
    if (selected.find((s) => s?.toUpperCase() === sub?.toUpperCase())) {
      setSelected((s) =>
        s.filter((n) => n?.toUpperCase() !== sub?.toUpperCase())
      );
    } else {
      setSelected((s) => [...s, sub]);
    }
  };
  const toggleAllSelected = (subs: [any]) => {
    setSelected((selected) => {
      let exclude = selected.filter(
        (s) => !subs.find((sub) => s?.toUpperCase() === sub?.toUpperCase())
      );
      if (exclude.length < selected.length) {
        return exclude;
      } else {
        return [...selected, ...subs];
      }
    });
  };
  const clearAll = () => {
    setSelected([]);
  };

  return (
    <CollectionContext.Provider
      value={{ selected, toggleSelected, toggleAllSelected, clearAll }}
    >
      {children}
    </CollectionContext.Provider>
  );
};
