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
import { applyRewardToCart, getBestCartReward, removeAppliedReward } from "../utils/rewardHelpers";
import { getApplicableRewards, getRewardById, removeExpiredRewards, rewardWalletEvents } from "../utils/rewardWallet";
import { getDirectWhatsAppLink, getWhatsAppLink, safeGenerateMessage } from "../utils/whatsappUtils";
import { getSeedProducts, getSeedServices } from "../data/seed-data";
import { useLocationIntelligence } from "../utils/locationHelper";

const BASE_DELIVERY_FEE = 0;

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

const getQuickEssentials = () => {
  const products = getSeedProducts();
  const names = ["Milk", "Bread", "Tea", "Cold Drink", "Eggs"];
  const matched = names
    .map((name) => products.find((item) => String(item.name).toLowerCase().includes(name.toLowerCase())))
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
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  const { user } = useUser();

  const [activeTab, setActiveTab] = useState("grocery");
  const [applicableRewards, setApplicableRewards] = useState([]);
  const [selectedRewardId, setSelectedRewardId] = useState(null);
  const locationIntelligence = useLocationIntelligence();

  const groceryItems = useMemo(() => (Array.isArray(cart) ? cart.filter((item) => !isServiceCartItem(item)) : []), [cart]);
  const serviceItems = useMemo(() => (Array.isArray(cart) ? cart.filter(isServiceCartItem) : []), [cart]);
  const subtotal = cartSubtotal(groceryItems);
  const deliveryVillage = locationIntelligence.location?.name || user?.village || "Azampur";
  const deliveryEstimate = locationIntelligence.deliveryEstimate;
  const nearbyProducts = useMemo(() => {
    if (!locationIntelligence.nearbyShops.length) return getSeedProducts().slice(0, 8).map(normalizeRecommendation);
    const groceryNearby = locationIntelligence.nearbyShops.some((shop) => ["grocery", "dairy", "vegetables"].includes(shop.category));
    return getSeedProducts()
      .slice(groceryNearby ? 0 : 8, groceryNearby ? 8 : 16)
      .map(normalizeRecommendation);
  }, [locationIntelligence.nearbyShops]);

  useEffect(() => {
    const syncRewards = () => {
      removeExpiredRewards();
      const eligible = getApplicableRewards({ area: "cart", subtotal });
      setApplicableRewards(eligible);

      setSelectedRewardId((currentId) => {
        if (currentId && eligible.some((reward) => reward.id === currentId)) {
          return currentId;
        }
        const best = getBestCartReward(eligible, groceryItems, { subtotal, deliveryFee: BASE_DELIVERY_FEE });
        return best?.id || null;
      });
    };

    syncRewards();
    window.addEventListener(rewardWalletEvents.updated, syncRewards);
    window.addEventListener("storage", syncRewards);
    return () => {
      window.removeEventListener(rewardWalletEvents.updated, syncRewards);
      window.removeEventListener("storage", syncRewards);
    };
  }, [groceryItems, subtotal]);

  const selectedReward = useMemo(() => {
    if (!selectedRewardId) return null;
    return getRewardById(selectedRewardId);
  }, [selectedRewardId]);

  const bestReward = useMemo(
    () => getBestCartReward(applicableRewards, groceryItems, { subtotal, deliveryFee: BASE_DELIVERY_FEE }),
    [applicableRewards, groceryItems, subtotal]
  );

  const cartSummary = useMemo(() => {
    if (!selectedReward) {
      return removeAppliedReward(groceryItems, { subtotal, deliveryFee: BASE_DELIVERY_FEE });
    }
    return applyRewardToCart(groceryItems, selectedReward, { subtotal, deliveryFee: BASE_DELIVERY_FEE });
  }, [groceryItems, selectedReward, subtotal]);

  const quickEssentials = useMemo(() => getQuickEssentials(), []);
  const suggestedServices = useMemo(() => getSeedServices().slice(0, 3), []);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-orange-50/50 to-slate-50 pb-28">
      <main className="mx-auto max-w-md px-4 pt-4">
        <div className="mb-4 space-y-3">
          <h1 className="text-3xl font-black tracking-tight text-slate-950">My Cart</h1>
          {flashMessage ? (
            <div className="rounded-[22px] bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-800 ring-1 ring-emerald-100">
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

        <div className="space-y-4">
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
                  <div className="space-y-3">
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
                    selectedRewardId={selectedRewardId}
                    summary={cartSummary}
                    onSelectReward={setSelectedRewardId}
                    onClearReward={() => setSelectedRewardId(null)}
                    onApplyBestReward={() => setSelectedRewardId(bestReward?.id || null)}
                  />

                  <button
                    type="button"
                    onClick={openCartSupport}
                    className="flex w-full items-center justify-center gap-2 rounded-[22px] bg-white px-4 py-3 text-sm font-black text-slate-700 shadow-sm ring-1 ring-slate-100"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600" />
                    Need help placing order? Contact on WhatsApp
                  </button>

                  <CartSummary
                    subtotal={cartSummary.subtotal}
                    deliveryFee={cartSummary.deliveryFee}
                    discountAmount={cartSummary.discountAmount}
                    total={cartSummary.total}
                    deliveryVillage={deliveryVillage}
                    deliveryEstimate={deliveryEstimate}
                    onCheckout={() => navigate("/checkout/address", { state: { appliedRewardId: selectedRewardId } })}
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

              <section className="space-y-3">
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
