import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { formatPrice } from "../utils/helpers";
import { loadCatalogProducts, loadCatalogServices, searchCatalog } from "../utils/catalogApi";
import ErrorState from "../components/ErrorState";

const SearchPage = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        setError("");
        const [nextProducts, nextServices] = await Promise.all([
          loadCatalogProducts(),
          loadCatalogServices(),
        ]);

        if (!active) return;
        setProducts(Array.isArray(nextProducts) ? nextProducts : []);
        setServices(Array.isArray(nextServices) ? nextServices : []);
      } catch (err) {
        if (!active) return;
        setError(err?.message || "Failed to load catalog");
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  const productResults = useMemo(() => searchCatalog(products, query), [products, query]);
  const serviceResults = useMemo(() => searchCatalog(services, query), [services, query]);

  const totalResults = productResults.length + serviceResults.length;
  const hasQuery = Boolean(query.trim());

  if (error && !products.length && !services.length) {
    return (
      <div className="min-h-screen bg-gray-50 pb-24">
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-1 items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>
        </div>
        <div className="p-4">
          <ErrorState
            title={lang === "hi" ? "खोज लोड नहीं हुई" : "Search data failed to load"}
            description={error}
            action={() => window.location.reload()}
            actionText={lang === "hi" ? "फिर से कोशिश करें" : "Retry"}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="rounded-2xl bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 transition"
            aria-label="Back"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-1 items-center gap-3 rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-5 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{t("search")}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {loading
              ? lang === "hi"
                ? "खोज डेटा लोड हो रहा है..."
                : "Loading catalog..."
              : hasQuery
              ? `${totalResults} results for "${query}"`
              : lang === "hi"
              ? "कृपया उत्पाद या सेवाएं खोजें"
              : "Search products or services"}
          </p>
        </div>

        {hasQuery ? (
          <div className="space-y-4">
            {productResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Products</h2>
                <div className="space-y-3">
                  {productResults.slice(0, 4).map((product) => (
                    <div key={product.id || product._id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image || "https://via.placeholder.com/80?text=Img"}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/80?text=Img";
                          }}
                          className="h-16 w-16 rounded-3xl object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {lang === "hi" ? product.nameHi || product.name : product.name}
                          </h3>
                          <p className="text-sm text-slate-500">{product.unit}</p>
                        </div>
                        <span className="ml-auto text-sm font-semibold text-slate-900">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {serviceResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Services</h2>
                <div className="space-y-3">
                  {serviceResults.slice(0, 4).map((service) => (
                    <div key={service.id || service._id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
                          {service.emoji || "🔧"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {lang === "hi" ? service.nameHi || service.name : service.name}
                          </h3>
                          <p className="text-sm text-slate-500">{service.categoryName || service.area}</p>
                        </div>
                        <span className="ml-auto text-sm font-semibold text-slate-900">
                          {service.fee ? formatPrice(service.fee) : "—"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {productResults.length === 0 && serviceResults.length === 0 && (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                {lang === "hi" ? "कोई परिणाम नहीं मिला" : "No results found"}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-3xl bg-white p-5 text-sm text-slate-500 shadow-sm ring-1 ring-slate-200">
            {lang === "hi"
              ? "लाइव कैटलॉग से उत्पाद और सेवाएं खोजें"
              : "Search live products and services from the backend catalog"}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
