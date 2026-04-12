import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Phone, MessageCircle } from "lucide-react";
import Header from "../components/Header";
import ProductCard from "../components/ProductCard";
import ServiceCard from "../components/ServiceCard";
import EmptyState from "../components/EmptyState";
import useTranslation from "../utils/useTranslation";
import { useCart } from "../context/CartContext";
import { getCategoryBySlug } from "../data/categories";
import { getProductsByCategory, getProductsBySubcategory, getServicesByCategory, getOffersByCategory, getSeasonalOffers } from "../data/seed-data";
import { safeGenerateMessage, getWhatsAppLink, getDirectWhatsAppLink } from "../utils/whatsappUtils";
import { useUser } from "../context/UserContext";
import { CATEGORY_TYPES } from "../data/categories";
import { loadCatalogProducts, loadCatalogServices, normalizeCatalogProduct, normalizeCatalogService } from "../utils/catalogApi";

const CategoryPage = () => {
  const { slug } = useParams();
  const { t, lang } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, isProductInCart, cart, updateQuantity } = useCart();
  const { user } = useUser();
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = getCategoryBySlug(slug);
  const isProduct = category?.type === CATEGORY_TYPES.PRODUCT;

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      try {
        setLoading(true);
        const [nextProducts, nextServices] = await Promise.all([
          loadCatalogProducts(),
          loadCatalogServices(),
        ]);
        if (!active) return;
        setCatalogProducts(Array.isArray(nextProducts) ? nextProducts : []);
        setCatalogServices(Array.isArray(nextServices) ? nextServices : []);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  // Check if this is a subcategory (for food subcategories)
  const items = useMemo(() => {
    if (isProduct) {
      const liveMatches = catalogProducts.filter((item) => {
        const haystack = [item.category, item.categoryName, item.name, item.description]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(String(slug || "").toLowerCase());
      });
      if (liveMatches.length > 0) {
        return liveMatches;
      }

      const subcategoryItems = getProductsBySubcategory(slug).map(normalizeCatalogProduct);
      if (subcategoryItems.length > 0) {
        return subcategoryItems;
      }

      return getProductsByCategory(slug).map(normalizeCatalogProduct);
    }

    const liveMatches = catalogServices.filter((item) => {
      const haystack = [item.category, item.categoryName, item.name, item.description, item.area]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(String(slug || "").toLowerCase());
    });

    if (liveMatches.length > 0) {
      return liveMatches;
    }

    return getServicesByCategory(slug).map(normalizeCatalogService);
  }, [catalogProducts, catalogServices, isProduct, slug]);

  const targetedOffers = getOffersByCategory(slug);
  const offers = targetedOffers.length > 0 ? targetedOffers : getSeasonalOffers().slice(0, 2);

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header onLocationClick={() => navigate("/profile")} />
        <EmptyState
          title={t("noData")}
          description={lang === "hi" ? "यह श्रेणी नहीं मिली" : "This category not found"}
          action={() => navigate("/")}
          actionText={t("back")}
        />
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product);
  };

  const handleBuyNow = (product) => {
    navigate("/checkout", {
      state: {
        checkoutItems: [{ ...product, quantity: 1 }],
        checkoutMode: "buy-now",
      },
    });
  };

  const handleProductWhatsApp = (product) => {
    const message = safeGenerateMessage("product-order", {
      productName: lang === "hi" ? product.nameHi || product.name : product.name,
      quantity: 1,
      price: product.price || 0,
      category: product.category || product.type || "Product",
      unit: product.unit || "",
      village: user?.village || "Azamgarh",
      lang,
    });

    const link = getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank");
    }
  };

  const handleIncreaseQty = (productId) => {
    const item = cart.find((item) => item.id === productId);
    if (item) {
      updateQuantity(productId, item.quantity + 1);
    }
  };

  const handleDecreaseQty = (productId) => {
    const item = cart.find((item) => item.id === productId);
    if (item && item.quantity > 1) {
      updateQuantity(productId, item.quantity - 1);
    }
  };

  const handleRemoveFromCart = (productId) => {
    updateQuantity(productId, 0);
  };

  const handleServiceWhatsApp = (service) => {
    const message = safeGenerateMessage("service-inquiry", {
      serviceName: lang === "hi" ? service.nameHi : service.name,
      category: lang === "hi" ? service.categoryName : service.categoryName,
      fee: service.fee ? `₹${service.fee}` : "",
      village: user?.village || "Azamgarh",
      lang,
    });

    const link = service.whatsapp
      ? getDirectWhatsAppLink(service.whatsapp, message)
      : getWhatsAppLink(message);

    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank");
    }
  };

  const handleServiceCall = (service) => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* Header with Back Button */}
      <div className="sticky top-0 z-30 bg-white shadow-sm p-4 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Go back"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-lg font-bold">
            {lang === "hi" ? category.nameHi : category.name}
          </h1>
          {loading ? (
            <p className="text-xs text-slate-500">{lang === "hi" ? "कैटलॉग लोड हो रहा है..." : "Loading catalog..."}</p>
          ) : null}
        </div>
      </div>

      <div className="p-4">
        {offers.length > 0 && (
          <div className="mb-5 rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {lang === "hi" ? "ऑफर" : "Offers"}
                </h2>
                <p className="text-sm text-slate-500">
                  {lang === "hi" ? "इस श्रेणी के लिए विशेष डील" : "Special deals for this category"}
                </p>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                {lang === "hi" ? "टार्गेटेड" : "Targeted"}
              </span>
            </div>
            <div className="grid gap-3">
              {offers.map((offer) => (
                <button
                  key={offer.id || offer._id}
                  onClick={() => navigate(offer.link || "/")}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                  type="button"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={offer.image || "https://via.placeholder.com/100x100?text=Offer"}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100x100?text=Offer";
                      }}
                      alt={offer.title || "Offer"}
                      className="h-20 w-20 flex-shrink-0 rounded-2xl object-cover"
                    />
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {lang === "hi" ? offer.titleHi || offer.title : offer.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-2">
                        {lang === "hi" ? offer.descriptionHi || offer.description : offer.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">₹{offer.price}</span>
                        <span className="text-xs text-gray-400 line-through">₹{offer.originalPrice}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {items && items.length > 0 ? (
          <div className="space-y-4">
            {isProduct ? (
              <div className="grid grid-cols-2 gap-3">
                {items.map((product) => (
                  <ProductCard
                    key={product.id || product._id}
                    product={product}
                    isInCart={isProductInCart(product.id)}
                    cartQuantity={cart.find((item) => item.id === product.id)?.quantity || 0}
                    onAddToCart={handleAddToCart}
                    onBuyNow={handleBuyNow}
                    onWhatsApp={handleProductWhatsApp}
                    onIncreaseQty={handleIncreaseQty}
                    onDecreaseQty={handleDecreaseQty}
                    onRemoveFromCart={handleRemoveFromCart}
                    onCardClick={() => navigate(`/product/${product.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {items.map((service) => (
                  <ServiceCard
                    key={service.id || service._id}
                    service={service}
                    onWhatsAppClick={handleServiceWhatsApp}
                    onCallClick={handleServiceCall}
                    onDetailsClick={() => navigate(`/service/${service.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <EmptyState
            title={lang === "hi" ? "कोई आइटम नहीं" : "No items found"}
            description={lang === "hi" ? "इस श्रेणी में कोई उत्पाद या सेवा नहीं है" : "No products or services in this category"}
            action={() => navigate("/")}
            actionText={t("back")}
          />
        )}
      </div>
    </div>
  );
};

export default CategoryPage;
