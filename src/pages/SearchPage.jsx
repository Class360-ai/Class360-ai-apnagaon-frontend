import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, Search } from "lucide-react";
import useTranslation from "../utils/useTranslation";
import { getSeedProducts, getSeedServices } from "../data/seed-data";
import { formatPrice } from "../utils/helpers";

const SearchPage = () => {
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const productResults = useMemo(() => {
    if (!query.trim()) return [];
    return getSeedProducts().filter((item) =>
      (`${item.name} ${item.description}`.toLowerCase()).includes(query.toLowerCase())
    );
  }, [query]);

  const serviceResults = useMemo(() => {
    if (!query.trim()) return [];
    return getSeedServices().filter((item) =>
      (`${item.name} ${item.description}`.toLowerCase()).includes(query.toLowerCase())
    );
  }, [query]);

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
            {query
              ? `${productResults.length + serviceResults.length} results for "${query}"`
              : lang === "hi"
              ? "कृपया उत्पाद या सेवाएं खोजें"
              : "Search products or services"}
          </p>
        </div>

        {query.trim() ? (
          <div className="space-y-4">
            {productResults.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">Products</h2>
                <div className="space-y-3">
                  {productResults.slice(0, 4).map((product) => (
                    <div key={product.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
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
                          <h3 className="font-semibold text-slate-900">{lang === "hi" ? product.nameHi || product.name : product.name}</h3>
                          <p className="text-sm text-slate-500">{product.unit}</p>
                        </div>
                        <span className="ml-auto text-sm font-semibold text-slate-900">{formatPrice(product.price)}</span>
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
                    <div key={service.id} className="rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-2xl">
                          {service.emoji || "🔧"}
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">{lang === "hi" ? service.nameHi || service.name : service.name}</h3>
                          <p className="text-sm text-slate-500">{service.category || service.area}</p>
                        </div>
                        <span className="ml-auto text-sm font-semibold text-slate-900">{service.fee ? formatPrice(service.fee) : "—"}</span>
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
        ) : null}
      </div>
    </div>
  );
};

export default SearchPage;
