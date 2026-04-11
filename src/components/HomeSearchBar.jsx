import React from "react";
import { Search } from "lucide-react";

const HomeSearchBar = ({ value, onChange, onSubmit }) => {
  return (
    <form className="ag-home-search-wrap" onSubmit={onSubmit}>
      <button type="submit" className="ag-home-search-icon" aria-label="Search in ApnaGaon">
        <Search size={17} />
      </button>
      <input
        value={value}
        onChange={onChange}
        placeholder="Search groceries, services, shops"
        className="ag-home-search-input"
      />
    </form>
  );
};

export default HomeSearchBar;
