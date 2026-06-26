import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";

function Search({ searchQuery, setSearchQuery }) {
  const [inputValue, setInputValue] = useState(searchQuery);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearchQuery(inputValue);
    }, 300); // 300ms debounce time

    return () => {
      clearTimeout(handler);
    };
  }, [inputValue, setSearchQuery]);

  return (
    <div className="px-4 py-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            className="w-full bg-themeBgInput border border-themeBorder rounded-lg pl-10 pr-3 py-2 outline-none text-themeTextPrimary placeholder-themeTextSecondary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all duration-200"
            placeholder="Search users..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-themeTextSecondary text-sm" />
        </div>
      </div>
    </div>
  );
}

export default Search;
