import React from "react";
import { Search } from "lucide-react";
import useTranslation from "../utils/useTranslation";

const SearchWithAI = ({ value, onChange, onSubmit, onAskAI }) => {
  const { t } = useTranslation();

  return (
    <form className="ag-home-search-ai" onSubmit={onSubmit}>
      <span className="ag-home-search-ai-icon" aria-hidden="true">
        <Search size={17} />
      </span>
      <input
        value={value}
        onChange={onChange}
        placeholder={t("searchInApnaGaon")}
        className="ag-home-search-ai-input"
      />
      <button type="button" className="ag-home-search-ai-chip" onClick={onAskAI}>
        {t("askAi")}
      </button>
    </form>
  );
};

export default SearchWithAI;
