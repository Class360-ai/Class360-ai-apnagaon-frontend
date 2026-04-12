import React from "react";
import { ArrowRight, Star } from "lucide-react";
import useTranslation from "../utils/useTranslation";

const ProductRowSection = ({ title, products = [], loading = false, error = "", onAdd, onViewAll }) => {
  const { t, tx } = useTranslation();
  if (loading) {
    return (
      <section className="ag-top-products">
        <header className="ag-top-products-head">
          <h3>{tx(title) || tx("Best Deals in ApnaGaon")}</h3>
        </header>
        <div className="rounded-[20px] bg-white px-4 py-4 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-100">
          Loading live products...
        </div>
      </section>
    );
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <section className="ag-top-products">
        <header className="ag-top-products-head">
          <h3>{tx(title) || tx("Best Deals in ApnaGaon")}</h3>
        </header>
        <div className="rounded-[20px] bg-white px-4 py-4 text-sm font-semibold text-slate-500 shadow-sm ring-1 ring-slate-100">
          {error ? error : "No products available right now."}
        </div>
      </section>
    );
  }

  return (
    <section className="ag-top-products">
      <header className="ag-top-products-head">
        <h3>{tx(title) || tx("Best Deals in ApnaGaon")}</h3>
        <button type="button" className="ag-top-products-more" onClick={onViewAll} aria-label={t("view")}>
          <ArrowRight size={14} />
        </button>
      </header>

      <div className="ag-top-products-row">
        {products.map((product, index) => (
          <article key={product?.id || product?._id || `${product?.name || "product"}-${index}`} className="ag-top-product-card">
            <span className="ag-top-product-discount">{tx(product?.discount) || t("popular")}</span>
            <div className="ag-top-product-media" aria-hidden="true">
              {product?.image ? (
                <img
                  src={product.image}
                  alt={product?.name || "Product"}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                "🛍️"
              )}
            </div>
            <div className="ag-top-product-rating">
              <Star size={11} fill="currentColor" />
              <span>{product?.rating || "4.0"}</span>
            </div>
            <h4>{tx(product?.name) || t("item")}</h4>
            <p>{tx(product?.qty) || tx("Daily essentials")}</p>
            <div className="ag-top-product-row">
              <strong>₹{product?.price || 0}</strong>
              <button type="button" onClick={() => onAdd?.(product)}>
                {t("add")}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default ProductRowSection;
