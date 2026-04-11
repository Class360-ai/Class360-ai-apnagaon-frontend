import React from "react";
import CategoryBrowserPage from "./CategoryBrowserPage";
import { CATEGORY_BROWSER_VARIANTS } from "../data/categoryBrowserData";

const VillageBrowserPage = () => {
  return <CategoryBrowserPage mode={CATEGORY_BROWSER_VARIANTS.VILLAGE} />;
};

export default VillageBrowserPage;
