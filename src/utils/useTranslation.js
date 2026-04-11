import { useLanguage } from "../context/LanguageContext";
import { translations, translateDynamicText } from "../data/translations";

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = (key) => {
    const keys = key.split(".");
    let value = translations[language] || translations.en;

    for (const k of keys) {
      if (value && typeof value === "object") {
        value = value[k];
      } else {
        return translations.en?.[key] || key;
      }
    }

    if (value === undefined || value === null || value === "") {
      return translations.en?.[key] || key;
    }
    return value;
  };

  const tx = (value) => translateDynamicText(value, language);

  return { t, tx, lang: language };
};

export default useTranslation;
