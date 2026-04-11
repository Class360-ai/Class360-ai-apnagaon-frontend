import React, { useEffect, useMemo, useState } from "react";
import { Camera, Search, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SidebarMenu from "../components/SidebarMenu";
import SectionBlock from "../components/SectionBlock";
import { CATEGORY_BROWSER_VARIANTS, getCategoryBrowserData } from "../data/categoryBrowserData";
import { useCart } from "../context/CartContext";
import { handleCardAction } from "../utils/actionHelpers";
import useTranslation from "../utils/useTranslation";
import "./CategoryBrowserPage.css";

const CategoryBrowserPage = ({ mode = CATEGORY_BROWSER_VARIANTS.CATEGORIES }) => {
  const navigate = useNavigate();
  const { getCartItemCount, addToCart } = useCart();
  const { t, lang } = useTranslation();

  const data = useMemo(() => getCategoryBrowserData(mode, lang), [mode, lang]);
  const tabs = data?.tabs || [];

  const [activeCategoryId, setActiveCategoryId] = useState(tabs[0]?.id || "");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    setActiveCategoryId(tabs[0]?.id || "");
  }, [mode, tabs]);

  useEffect(() => {
    if (!feedback) return;
    const timeout = setTimeout(() => setFeedback(""), 1800);
    return () => clearTimeout(timeout);
  }, [feedback]);

  const selectedCategory = useMemo(() => {
    return tabs.find((entry) => entry.id === activeCategoryId) || tabs[0];
  }, [activeCategoryId, tabs]);

  const cartCount = getCartItemCount ? getCartItemCount() : 0;

  const onItemAction = ({ entry, categoryName, sectionTitle }) => {
    handleCardAction({
      actionType: entry?.actionType,
      entry,
      categoryName,
      sectionTitle,
      addToCart,
      onFeedback: setFeedback,
      lang,
      onView: (clickedEntry) => {
        window.alert(`${clickedEntry?.name || t("item")} ${t("detailsComingSoon")}`);
      },
    });
  };

  const openCameraPlaceholder = () => {
    window.alert(t("cameraComingSoon"));
  };

  return (
    <div className="ag-browser-page">
      <header className="ag-browser-topbar">
        <div className="ag-browser-title-wrap">
          <h1>{data?.title || t("categories")}</h1>
          <p>{data?.subtitle || t("browse")}</p>
        </div>
        <div className="ag-browser-actions" role="group" aria-label={t("search")}>
          <button type="button" className="ag-icon-btn" onClick={() => navigate("/search")} aria-label={t("search")}>
            <Search size={18} />
          </button>
          <button type="button" className="ag-icon-btn" aria-label={t("comingSoon")} onClick={openCameraPlaceholder}>
            <Camera size={18} />
          </button>
          <button type="button" className="ag-icon-btn is-cart" onClick={() => navigate("/cart")} aria-label={t("cart")}>
            <ShoppingCart size={18} />
            {cartCount > 0 ? <span className="ag-cart-badge">{cartCount > 9 ? "9+" : cartCount}</span> : null}
          </button>
        </div>
      </header>

      <main className="ag-browser-layout">
        <SidebarMenu
          tabs={tabs}
          activeId={selectedCategory?.id}
          onSelect={setActiveCategoryId}
        />

        <section className="ag-browser-content" aria-live="polite">
          <div className="ag-browser-content-head">
            <h2>{selectedCategory?.name || t("browse")}</h2>
            <span>{t("appPicks")}</span>
          </div>

          {feedback ? <p className="ag-browser-feedback">{feedback}</p> : null}

          {(selectedCategory?.sections || []).length > 0 ? (
            (selectedCategory?.sections || []).map((section) => (
              <SectionBlock
                key={section.id}
                section={section}
                categoryName={selectedCategory?.name || t("category")}
                onItemAction={onItemAction}
              />
            ))
          ) : (
            <div className="ag-browser-empty">
              <h3>{t("noContentYet")}</h3>
              <p>{t("preparingSection")}</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CategoryBrowserPage;
