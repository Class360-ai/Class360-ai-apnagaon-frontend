import React, { createContext, useContext, useState } from "react";
import { getLanguagePreference, saveLanguagePreference } from "../utils/storage";

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(getLanguagePreference());

  const toggleLanguage = () => {
    const newLang = language === "en" ? "hi" : "en";
    setLanguage(newLang);
    saveLanguagePreference(newLang);
  };

  const setLang = (lang) => {
    if (["en", "hi"].includes(lang)) {
      setLanguage(lang);
      saveLanguagePreference(lang);
    }
  };

  const value = {
    language,
    toggleLanguage,
    setLang,
    isHindi: language === "hi",
    isEnglish: language === "en",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
