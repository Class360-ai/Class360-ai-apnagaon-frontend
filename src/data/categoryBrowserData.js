import { categoriesData } from "./categoriesData";
import { villageData } from "./villageData";
import { localizeDataTree, translateDynamicText } from "./translations";

export const CATEGORY_BROWSER_VARIANTS = {
  CATEGORIES: "categories",
  VILLAGE: "village",
};

const byVariant = {
  [CATEGORY_BROWSER_VARIANTS.CATEGORIES]: {
    title: { en: "Categories", hi: "कैटेगरी" },
    subtitle: {
      en: "Shop and book village essentials",
      hi: "गांव की ज़रूरी चीज़ें खरीदें और बुक करें",
    },
    tabs: categoriesData,
  },
  [CATEGORY_BROWSER_VARIANTS.VILLAGE]: {
    title: { en: "Village", hi: "गांव" },
    subtitle: {
      en: "Smart village services and opportunities",
      hi: "स्मार्ट गांव सेवाएं और अवसर",
    },
    tabs: villageData,
  },
};

export const getCategoryBrowserData = (variant, lang = "en") => {
  const base = byVariant[variant] || byVariant[CATEGORY_BROWSER_VARIANTS.CATEGORIES];
  return {
    ...base,
    title: translateDynamicText(base.title, lang),
    subtitle: translateDynamicText(base.subtitle, lang),
    tabs: localizeDataTree(base.tabs || [], lang),
  };
};
