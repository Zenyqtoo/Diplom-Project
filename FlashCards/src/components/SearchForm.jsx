import React, { useState } from 'react';

const SearchForm = ({ onSearchHandler }) => {
  const [searchValue, setSearchValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    onSearchHandler(searchValue.trim());
  }

  return (
    <form className="search-form" onSubmit={handleSubmit} style={{ display: "flex", gap: 8 }}>
      <input
        type="text"
        className="search-input"
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search categories or cards..."
        style={{ padding: 8, borderRadius: 8, border: "1px solid #e8e8e8", width: 280 }}
      />
      <button className="button-search" type="submit" style={{ padding: "8px 12px" }}>Search</button>
    </form>
  );
};

export default SearchForm;