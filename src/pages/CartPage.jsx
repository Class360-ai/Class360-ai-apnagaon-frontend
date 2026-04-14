import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import NearbyServicesSection from "../components/NearbyServicesSection";
import NearbyShopsSection from "../components/NearbyShopsSection";
import CartItemCard from "../components/cart/CartItemCard";
import CartSummary from "../components/cart/CartSummary";
import CartTabs from "../components/cart/CartTabs";
import EmptyCartState from "../components/cart/EmptyCartState";
import RecommendationRow from "../components/cart/RecommendationRow";
import RewardApplyBox from "../components/cart/RewardApplyBox";
import ServiceCartCard from "../components/cart/ServiceCartCard";
import useTranslation from "../utils/useTranslation";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { getBestCartReward } from "../utils/rewardHelpers";
import { getApplicableRewards, getRewardById, removeExpiredRewards, rewardWalletEvents } from "../utils/rewardWallet";
import { getDirectWhatsAppLink, getWhatsAppLink, safeGenerateMessage } from "../utils/whatsappUtils";
import { getSeedProducts, getSeedServices } from "../data/seed-data";
import { useLocationIntelligence } from "../utils/locationHelper";
import { loadCatalogProducts, loadCatalogServices, normalizeCatalogProduct, normalizeCatalogService } from "../utils/catalogApi";
import { calculateCartTotals } from "../utils/calculateCartTotals";

const cartSubtotal = (items = []) =>
  (Array.isArray(items) ? items : []).reduce(
    (sum, item) => sum + (Number(item?.price) || Number(item?.fee) || 0) * (Number(item?.quantity) || 1),
    0
  );

const isServiceCartItem = (item = {}) =>
  item.cartType === "service" ||
  item.itemType === "service" ||
  item.type === "service" ||
  item.kind === "service" ||
  Boolean(item.provider && (item.fee || item.whatsapp || item.phone));

const normalizeRecommendation = (product) => ({
  ...product,
  quantity: 1,
});

const getQuickEssentials = (products = []) => {
  const sourceProducts = Array.isArray(products) && products.length > 0 ? products : getSeedProducts().map(normalizeCatalogProduct);
  const names = ["Milk", "Bread", "Tea", "Cold Drink", "Eggs"];
  const matched = names
    .map((name) => sourceProducts.find((item) => String(item.name).toLowerCase().includes(name.toLowerCase())))
    .filter(Boolean);

  const fallbacks = [
    { id: "quick-milk", name: "Milk", unit: "500 ml", price: 30 },
    { id: "quick-bread", name: "Bread", unit: "1 pack", price: 35 },
    { id: "quick-tea", name: "Tea", unit: "250 g", price: 90 },
    { id: "quick-cold-drink", name: "Cold Drink", unit: "750 ml", price: 40 },
    { id: "quick-eggs", name: "Eggs", unit: "6 pcs", price: 45 },
  ];

  return (matched.length >= 4 ? matched : fallbacks).map(normalizeRecommendation);
};

const CartPage = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { cart, addToCart, removeFromCart, updateQuantity, appliedReward, setAppliedReward, coupon } = useCart();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("grocery");
  const [applicableRewards, setApplicableRewards] = useState([]);
  const [rewardInitialized, setRewardInitialized] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogServices, setCatalogServices] = useState([]);
  const locationIntelligence = useLocationIntelligence();

  const groceryItems = useMemo(() => (Array.isArray(cart) ? cart.filter((item) => !isServiceCartItem(item)) : []), [cart]);
  const serviceItems = useMemo(() => (Array.isArray(cart) ? cart.filter(isServiceCartItem) : []), [cart]);
  const subtotal = cartSubtotal(groceryItems);
  const deliveryVillage = locationIntelligence.location?.name || user?.village || "Azampur";
  const deliveryEstimate = locationIntelligence.deliveryEstimate;
  const nearbyProducts = useMemo(() => {
    const sourceProducts = catalogProducts.length > 0 ? catalogProducts : getSeedProducts().map(normalizeCatalogProduct);
    if (!locationIntelligence.nearbyShops.length) return sourceProducts.slice(0, 8).map(normalizeRecommendation);
    const groceryNearby = locationIntelligence.nearbyShops.some((shop) => ["grocery", "dairy", "vegetables"].includes(shop.category));
    return sourceProducts
      .slice(groceryNearby ? 0 : 8, groceryNearby ? 8 : 16)
      .map(normalizeRecommendation);
  }, [catalogProducts, locationIntelligence.nearbyShops]);

  useEffect(() => {
    const syncRewards = () => {
      removeExpiredRewards();
      const eligible = getApplicableRewards({ area: "cart", subtotal });
      setApplicableRewards(eligible);

      if (!rewardInitialized) {
        if (appliedReward && eligible.some((reward) => reward.id === appliedReward.id)) {
          setRewardInitialized(true);
          return;
        }

        const best = getBestCartReward(eligible, groceryItems, { subtotal, deliveryFee: 0 });
        if (best) {
          setAppliedReward(best);
        }
        setRewardInitialized(true);
        return;
      }

      if (appliedReward && !eligible.some((reward) => reward.id === appliedReward.id)) {
        const best = getBestCartReward(eligible, groceryItems, { subtotal, deliveryFee: 0 });
        setAppliedReward(best || null);
      }
    };

    syncRewards();
    window.addEventListener(rewardWalletEvents.updated, syncRewards);
    window.addEventListener("storage", syncRewards);
    return () => {
      window.removeEventListener(rewardWalletEvents.updated, syncRewards);
      window.removeEventListener("storage", syncRewards);
    };
  }, [appliedReward, groceryItems, rewardInitialized, setAppliedReward, subtotal]);

  useEffect(() => {
    if (!groceryItems.length) {
      setRewardInitialized(false);
    }
  }, [groceryItems.length]);

  const bestReward = useMemo(
    () => getBestCartReward(applicableRewards, groceryItems, { subtotal, deliveryFee: 0 }),
    [applicableRewards, groceryItems, subtotal]
  );

  const cartTotals = useMemo(
    () =>
      calculateCartTotals(groceryItems, {
        deliveryFee: 0,
        packagingFee: 0,
        appliedReward,
        coupon,
      }),
    [appliedReward, coupon, groceryItems]
  );

  const quickEssentials = useMemo(() => getQuickEssentials(catalogProducts), [catalogProducts]);
  const suggestedServices = useMemo(() => {
    const sourceServices = catalogServices.length > 0 ? catalogServices : getSeedServices().map(normalizeCatalogService);
    return sourceServices.slice(0, 3);
  }, [catalogServices]);
  const flashMessage = location.state?.flashMessage || "";

  const handleDecrease = (item) => {
    const quantity = Number(item?.quantity) || 1;
    if (quantity <= 1) {
      removeFromCart(item.id);
      return;
    }
    updateQuantity(item.id, quantity - 1);
  };

  const openServiceWhatsApp = (service) => {
    const message = safeGenerateMessage("service-inquiry", {
      serviceName: lang === "hi" ? service.nameHi || service.name : service.name,
      category: service.categoryName || service.category || "Service",
      fee: service.fee ? `Rs. ${service.fee}` : "",
      village: deliveryVillage,
      lang,
    });

    const link = service.whatsapp ? getDirectWhatsAppLink(service.whatsapp, message) : getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  const callService = (service) => {
    if (service.phone) {
      window.location.href = `tel:${service.phone}`;
      return;
    }
    openServiceWhatsApp(service);
  };

  const rewardPromptVisible = applicableRewards.length > 0;
  const activeItemsEmpty = activeTab === "grocery" ? groceryItems.length === 0 : serviceItems.length === 0;
  const openCartSupport = () => {
    const link = getWhatsAppLink("Namaste, mujhe order place karne mein help chahiye.");
    if (link && link !== "javascript:void(0)") window.open(link, "_blank", "noopener,noreferrer");
  };

  useEffect(() => {
    let active = true;

    const loadCatalog = async () => {
      const [nextProducts, nextServices] = await Promise.all([
        loadCatalogProducts(),
        loadCatalogServices(),
      ]);

      if (!active) return;
      setCatalogProducts(Array.isArray(nextProducts) ? nextProducts : []);
      setCatalogServices(Array.isArray(nextServices) ? nextServices : []);
    };

    loadCatalog();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-orange-50/50 to-slate-50 pb-28">
      <main className="mx-auto max-w-md px-4 pt-3">
        <div className="mb-3 space-y-2">
          <h1 className="text-2xl font-black tracking-tight text-slate-950">My Cart</h1>
          {flashMessage ? (
            <div className="rounded-[20px] bg-emerald-50 px-4 py-2.5 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
              {flashMessage}
            </div>
          ) : null}
          <CartTabs
            activeTab={activeTab}
            onChange={setActiveTab}
            groceryCount={groceryItems.length}
            serviceCount={serviceItems.length}
          />
        </div>

        {rewardPromptVisible && activeItemsEmpty ? (
          <div className="mb-4 rounded-[22px] bg-orange-500 px-4 py-3 text-sm font-black text-white shadow-md shadow-orange-100">
            You have rewards available
          </div>
        ) : null}

        <div className="space-y-3.5">
          {activeTab === "grocery" ? (
            <>
              {groceryItems.length === 0 ? (
                <EmptyCartState
                  activeTab="grocery"
                  hasRewards={rewardPromptVisible}
                  onShopGrocery={() => navigate("/categories")}
                  onExploreServices={() => navigate("/services")}
                  onFastDelivery={() => navigate("/quick")}
                />
              ) : (
                <>
                  <div className="space-y-2.5">
                    {groceryItems.map((item) => (
                      <CartItemCard
                        key={item.id}
                        item={item}
                        title={lang === "hi" ? item.nameHi || item.name : item.name}
                        subtitle={item.unit || item.categoryName || item.description || "Daily essential"}
                        onDecrease={() => handleDecrease(item)}
                        onIncrease={() => updateQuantity(item.id, (Number(item.quantity) || 1) + 1)}
                        onRemove={() => removeFromCart(item.id)}
                      />
                    ))}
                  </div>

                  <RewardApplyBox
                    rewards={applicableRewards}
                    selectedRewardId={appliedReward?.id || null}
                    summary={cartTotals}
                    onSelectReward={(rewardId) => setAppliedReward(getRewardById(rewardId) || null)}
                    onClearReward={() => setAppliedReward(null)}
                    onApplyBestReward={() => setAppliedReward(bestReward || null)}
                  />

                  <button
                    type="button"
                    onClick={openCartSupport}
                    className="flex w-full items-center justify-center gap-2 rounded-[20px] bg-white px-4 py-2.5 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-100"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    Need help placing order? Contact on WhatsApp
                  </button>

                  <CartSummary
                    totals={cartTotals}
                    deliveryVillage={deliveryVillage}
                    deliveryEstimate={deliveryEstimate}
                    onCheckout={() =>
                      navigate("/checkout", {
                        state: {
                          appliedReward,
                          coupon,
                          checkoutItems: groceryItems,
                        },
                      })
                    }
                  />
                </>
              )}
            </>
          ) : (
            <>
              {serviceItems.length === 0 ? (
                <EmptyCartState
                  activeTab="services"
                  hasRewards={rewardPromptVisible}
                  onShopGrocery={() => navigate("/categories")}
                  onExploreServices={() => navigate("/services")}
                  onFastDelivery={() => navigate("/quick")}
                />
              ) : (
                <div className="space-y-3">
                  {serviceItems.map((service) => (
                    <ServiceCartCard
                      key={service.id}
                      service={{
                        ...service,
                        name: lang === "hi" ? service.nameHi || service.name : service.name,
                        subtitle: service.subtitle || service.description || service.area || "Service inquiry for your village",
                        status: service.status || "Requested",
                      }}
                      onRemove={removeFromCart}
                      onWhatsApp={openServiceWhatsApp}
                      onCall={callService}
                    />
                  ))}
                </div>
              )}

              <section className="space-y-2.5">
                <div className="px-1">
                  <h2 className="text-base font-black text-slate-950">Requested Services</h2>
                  <p className="text-xs font-semibold text-slate-500">Trusted local help near {deliveryVillage}</p>
                </div>
                {suggestedServices.map((service) => (
                  <ServiceCartCard
                    key={service.id}
                    service={{
                      ...service,
                      name: lang === "hi" ? service.nameHi || service.name : service.name,
                      subtitle: service.description || service.area || service.categoryName || "Available in your village",
                      status: service.badge || "Inquiry",
                    }}
                    onWhatsApp={openServiceWhatsApp}
                    onCall={callService}
                  />
                ))}
              </section>
            </>
          )}

          <RecommendationRow
            title="Nearby Products"
            subtitle="Fresh picks for your next village delivery"
            items={nearbyProducts}
            onAddToCart={addToCart}
          />

          <NearbyShopsSection address={locationIntelligence.address} onOrderNow={() => navigate("/categories")} />

          <NearbyServicesSection address={locationIntelligence.address} />

          <RecommendationRow
            title="Quick Add Essentials"
            subtitle="Milk, Bread, Tea, Cold Drink, Eggs"
            items={quickEssentials}
            onAddToCart={addToCart}
          />

        </div>
      </main>
    </div>
  );
};

export default CartPage;
