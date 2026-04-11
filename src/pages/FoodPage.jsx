import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MessageCircle,
  Star,
  Clock,
  Truck,
  Shield,
  Flame,
  Zap,
  CheckCircle,
  Plus,
  Minus,
  ShoppingCart
} from "lucide-react";
import Header from "../components/Header";
import FoodCard from "../components/FoodCard";
import useTranslation from "../utils/useTranslation";
import { useCart } from "../context/CartContext";
import { useUser } from "../context/UserContext";
import { getProductsByCategory } from "../data/seed-data";
import { safeGenerateMessage, getWhatsAppLink } from "../utils/whatsappUtils";

// Food subcategories for chips
const foodSubcategories = [
  { id: "cold-drinks", name: "Cold Drinks", nameHi: "कोल्ड ड्रिंक्स", emoji: "🥤", color: "from-blue-400 to-cyan-500" },
  { id: "fast-food", name: "Fast Food", nameHi: "फास्ट फूड", emoji: "🍔", color: "from-red-400 to-pink-500" },
  { id: "snacks", name: "Snacks", nameHi: "नाश्ता", emoji: "🍿", color: "from-yellow-400 to-orange-500" },
  { id: "tea-breakfast", name: "Tea", nameHi: "चाय", emoji: "☕", color: "from-amber-400 to-yellow-500" },
  { id: "sweets", name: "Sweets", nameHi: "मिठाइयाँ", emoji: "🍬", color: "from-pink-400 to-rose-500" },
];

// Combo deals
const comboDeals = [
  {
    id: "combo-001",
    name: "Tea + Samosa Combo",
    nameHi: "चाय + समोसा कम्बो",
    items: ["Premium Tea", "Samosas"],
    price: 49,
    originalPrice: 55,
    discount: 11,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400",
    badge: "Popular Combo",
    badgeHi: "लोकप्रिय कम्बो",
  },
  {
    id: "combo-002",
    name: "Burger + Cold Drink Combo",
    nameHi: "बर्गर + कोल्ड ड्रिंक कम्बो",
    items: ["Veg Burger", "Coca Cola"],
    price: 109,
    originalPrice: 119,
    discount: 8,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
    badge: "Meal Deal",
    badgeHi: "मील डील",
  },
  {
    id: "combo-003",
    name: "Family Snack Box",
    nameHi: "फैमिली स्नैक बॉक्स",
    items: ["Samosas", "Potato Chips", "Namkeen Mix"],
    price: 125,
    originalPrice: 145,
    discount: 14,
    image: "https://images.unsplash.com/photo-1608039755401-5131e1ba8623?w=400",
    badge: "Family Pack",
    badgeHi: "फैमिली पैक",
  },
  {
    id: "combo-004",
    name: "Sweet Box Combo",
    nameHi: "स्वीट बॉक्स कम्बो",
    items: ["Gulab Jamun", "Rasgulla", "Laddu"],
    price: 155,
    originalPrice: 175,
    discount: 11,
    image: "https://images.unsplash.com/photo-1605193167214-0a5a7b4c4c6f?w=400",
    badge: "Festive",
    badgeHi: "त्योहार",
  },
];

const FoodPage = () => {
  const { lang } = useTranslation();
  const navigate = useNavigate();
  const { addToCart, cart, updateQuantity } = useCart();
  const { user } = useUser();

  const [activeCategory, setActiveCategory] = useState("all");

  const cartItems = cart || [];

  // Get food products
  const allFoodProducts = getProductsByCategory("food");
  const popularItems = allFoodProducts.slice(0, 6);
  const todaySpecials = allFoodProducts.filter(product => product.discount > 15).slice(0, 6);

  const handleCategoryClick = (categoryId) => {
    if (categoryId === "all") {
      navigate("/food");
    } else {
      navigate(`/food/${categoryId}`);
    }
    setActiveCategory(categoryId);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
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

  const handleWhatsAppOrder = (product) => {
    const message = safeGenerateMessage("product-order", {
      productName: product.name,
      quantity: 1,
      price: product.price,
      category: product.categoryName,
      unit: product.unit || "1 piece",
      village: user?.village || "Azamgarh",
      lang,
    });
    window.open(getWhatsAppLink(message), "_blank");
  };

  const handleComboOrder = (combo) => {
    const message = `Hello ApnaGaon,

I want to order this combo:

Combo: ${combo.name}
Items: ${combo.items.join(", ")}
Price: ₹${combo.price}

Please confirm availability.`;
    const encodedMessage = encodeURIComponent(message);
    const businessNumber = "918004710164";
    const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, "_blank");
  };

  const getCartQuantity = (productId) => {
    const item = cart.find((item) => item.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-amber-50 to-yellow-50 pb-28">
      <Header
        onSearchClick={() => navigate("/search")}
        onLocationClick={() => navigate("/profile")}
      />

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[30px] mx-4 mt-4 bg-gradient-to-br from-orange-400 via-red-400 to-pink-500 p-6 shadow-2xl">
        <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-yellow-300" />
            <span className="text-yellow-300 font-semibold text-sm uppercase tracking-wider">
              {lang === "hi" ? "गरम और ताजा" : "Hot & Fresh"}
            </span>
          </div>

          <h1 className="text-3xl font-black text-white leading-tight mb-2">
            {lang === "hi" ? "अपने गाँव का स्वाद" : "Taste of Your Gaon"}
          </h1>

          <p className="text-white/90 mb-6 text-lg">
            {lang === "hi" ? "नाश्ता, कोल्ड ड्रिंक्स, चाय, मिठाइयाँ — सब एक जगह" : "Snacks, cold drinks, tea, sweets — sab ek jagah"}
          </p>

          <div className="flex flex-wrap gap-3 mb-6">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm animate-pulse">
              <Zap className="w-4 h-4" />
              {lang === "hi" ? "तेज़ डिलीवरी" : "Fast Delivery"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              <Flame className="w-4 h-4" />
              {lang === "hi" ? "ताजा स्वाद" : "Fresh Taste"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
              <MessageCircle className="w-4 h-4" />
              {lang === "hi" ? "व्हाट्सएप ऑर्डर" : "WhatsApp Order"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400/90 px-3 py-1 text-sm font-semibold text-yellow-900 backdrop-blur-sm">
              <Star className="w-4 h-4 fill-yellow-900" />
              {lang === "hi" ? "4.8 रेटिंग" : "4.8 Rating"}
            </span>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/food")}
              className="flex-1 rounded-2xl bg-white px-6 py-3 text-lg font-bold text-orange-600 shadow-lg transition hover:scale-105 hover:shadow-xl"
            >
              {lang === "hi" ? "ऑर्डर करें" : "Order Now"}
            </button>
            <button
              onClick={() => document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="flex-1 rounded-2xl border-2 border-white bg-white/10 px-6 py-3 text-lg font-bold text-white shadow-lg transition hover:scale-105 hover:bg-white/20 backdrop-blur-sm"
            >
              {lang === "hi" ? "मेनू देखें" : "View Menu"}
            </button>
          </div>
        </div>
      </div>

      <div id="menu-section" className="h-4"></div>

      {/* Food Category Chips */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "व्हाट टू इट?" : "What to Eat?"}
          </h2>
          <button
            onClick={() => navigate("/food")}
            className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition"
          >
            {lang === "hi" ? "सब देखें" : "View All"}
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          <button
            onClick={() => handleCategoryClick("all")}
            className={`snap-center flex items-center gap-2 rounded-2xl border-2 px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-gradient-to-r from-orange-500 to-red-500 border-orange-500 text-white shadow-orange-200"
                : "bg-white border-gray-200 text-gray-700 hover:border-orange-300"
            }`}
          >
            <span className="text-lg">🍽️</span>
            <span className="font-semibold">
              {lang === "hi" ? "सब कुछ" : "All"}
            </span>
          </button>

          {foodSubcategories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`snap-center flex items-center gap-2 rounded-2xl border-2 px-4 py-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg whitespace-nowrap ${
                activeCategory === category.id
                  ? `bg-gradient-to-r ${category.color} border-transparent text-white shadow-lg`
                  : "bg-white border-gray-200 text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{category.emoji}</span>
              <span className="font-semibold">
                {lang === "hi" ? category.nameHi : category.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Popular Items Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "लोकप्रिय आइटम" : "Popular Items"}
          </h2>
          <div className="flex items-center gap-1">
            <Star className="w-5 h-5 text-yellow-500 animate-pulse" />
            <span className="text-sm font-semibold text-orange-600">
              {lang === "hi" ? "ट्रेंडिंग" : "Trending"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {popularItems.map((product) => (
            <FoodCard
              key={product.id}
              food={product}
              isInCart={getCartQuantity(product.id) > 0}
              cartQuantity={getCartQuantity(product.id)}
              onAddToCart={handleAddToCart}
              onIncreaseQty={handleIncreaseQty}
              onDecreaseQty={handleDecreaseQty}
              onRemoveFromCart={(id) => {
                const item = cart.find((item) => item.id === id);
                if (item) {
                  updateQuantity(id, 0);
                }
              }}
              onCardClick={() => {}}
            />
          ))}
        </div>
      </div>

      {/* Today Special Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "आज का स्पेशल" : "Today Special"}
          </h2>
          <Clock className="w-5 h-5 text-red-500" />
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
          {todaySpecials.map((product) => (
            <div key={product.id} className="snap-center flex-shrink-0 w-64">
              <FoodCard
                food={product}
                isInCart={getCartQuantity(product.id) > 0}
                cartQuantity={getCartQuantity(product.id)}
                onAddToCart={handleAddToCart}
                onIncreaseQty={handleIncreaseQty}
                onDecreaseQty={handleDecreaseQty}
                onRemoveFromCart={(id) => {
                  const item = cart.find((item) => item.id === id);
                  if (item) {
                    updateQuantity(id, 0);
                  }
                }}
                onCardClick={() => {}}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Quick Bites Section - Local Street Food */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "क्विक बाइट्स" : "Quick Bites"}
          </h2>
          <div className="flex items-center gap-1 text-orange-600">
            <span className="text-sm font-semibold">{lang === "hi" ? "गाँव स्टाइल" : "Village Style"}</span>
            <span className="text-lg">🏪</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {popularItems.slice(0, 4).map((product) => (
            <div
              key={`quick-${product.id}`}
              className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100 transition-all duration-200 hover:shadow-lg hover:scale-105 active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={product.image || "https://via.placeholder.com/50x50?text=Food"}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/50x50?text=Food";
                    }}
                    className="w-full h-full object-cover"
                    alt={product.name}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                    {lang === "hi" ? product.nameHi || product.name : product.name}
                  </h4>
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                    {product.discount > 0 && (
                      <span className="text-xs text-red-600 font-semibold">
                        {product.discount}% off
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs text-gray-600">{product.rating}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white transition-all duration-200 hover:scale-110 hover:shadow-md active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => navigate("/food")}
            className="text-orange-600 font-semibold text-sm hover:text-orange-700 transition-colors"
          >
            {lang === "hi" ? "और देखें →" : "View More →"}
          </button>
        </div>
      </div>

      {/* Customer Favorites Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "ग्राहक फेवरेट" : "Customer Favorites"}
          </h2>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-red-600">{lang === "hi" ? "सबसे पसंदीदा" : "Most Loved"}</span>
            <span className="text-lg animate-pulse">❤️</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-pink-50 to-red-50 rounded-2xl p-4 border border-pink-100">
          <div className="grid grid-cols-1 gap-3">
            {popularItems.slice(2, 5).map((product, index) => (
              <div
                key={`fav-${product.id}`}
                className="flex items-center gap-4 bg-white rounded-xl p-3 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]"
              >
                <div className="relative">
                  <div className="w-16 h-16 rounded-xl overflow-hidden">
                    <img
                      src={product.image || "https://via.placeholder.com/64x64?text=Food"}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/64x64?text=Food";
                      }}
                      className="w-full h-full object-cover"
                      alt={product.name}
                    />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-xs font-bold text-white">
                    {index + 1}
                  </div>
                </div>

                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 text-base mb-1">
                    {lang === "hi" ? product.nameHi || product.name : product.name}
                  </h4>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-gray-700 font-semibold">{product.rating}</span>
                    </div>
                    <span className="text-sm text-gray-900 font-bold">₹{product.price}</span>
                    {product.discount > 0 && (
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-semibold">
                        {product.discount}% off
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1">
                    {lang === "hi" ? product.descriptionHi || product.description : product.description}
                  </p>
                </div>

                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-10 h-10 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Seasonal Specials Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "सीजनल स्पेशल" : "Seasonal Specials"}
          </h2>
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-green-600">
              {lang === "hi" ? "नया और ताजा" : "New & Fresh"}
            </span>
            <span className="text-lg animate-bounce">🌿</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
          <div className="grid grid-cols-2 gap-3">
            {todaySpecials.slice(0, 4).map((product) => (
              <div
                key={`seasonal-${product.id}`}
                className="bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-200 hover:scale-105 border border-green-50"
              >
                <div className="relative mb-2">
                  <img
                    src={product.image || "https://via.placeholder.com/80x60?text=Food"}
                    onError={(e) => {
                      e.target.src = "https://via.placeholder.com/80x60?text=Food";
                    }}
                    className="w-full h-16 object-cover rounded-lg"
                    alt={product.name}
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-xs text-white font-bold">✨</span>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 text-sm line-clamp-1 mb-1">
                  {lang === "hi" ? product.nameHi || product.name : product.name}
                </h4>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-6 h-6 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 flex items-center justify-center text-white transition-all duration-200 hover:scale-110"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Combo Deals Section */}
      <div className="px-4 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {lang === "hi" ? "कम्बो डील्स" : "Combo Deals"}
          </h2>
          <span className="text-sm font-semibold text-red-600">
            {lang === "hi" ? "बेस्ट वैल्यू" : "Best Value"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {comboDeals.map((combo) => (
            <div
              key={combo.id}
              className="bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] ring-1 ring-purple-100 hover:ring-purple-200 group"
            >
              <div className="relative">
                <div className="flex">
                  <div className="w-28 h-28 flex-shrink-0 relative">
                    <img
                      src={combo.image}
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/100x100?text=Combo";
                      }}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      alt={combo.name}
                    />
                    {/* Combo badge */}
                    <div className="absolute -top-2 -right-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-2 py-1 text-xs font-bold text-white shadow-lg animate-pulse">
                      🎁 {combo.discount}% OFF
                    </div>
                  </div>

                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-purple-600 transition-colors">
                          {lang === "hi" ? combo.nameHi || combo.name : combo.name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {combo.items.join(" + ")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700">
                            {lang === "hi" ? "बेस्ट वैल्यू" : "Best Value"}
                          </div>
                          <div className="rounded-full bg-orange-100 px-2 py-1 text-xs font-semibold text-orange-700">
                            {lang === "hi" ? "लोकप्रिय" : "Popular"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="rounded-full bg-gradient-to-r from-purple-500 to-pink-600 px-3 py-1 text-xs font-bold text-white mb-1">
                          {lang === "hi" ? combo.badgeHi || combo.badge : combo.badge}
                        </div>
                        <div className="text-xs text-gray-500">
                          {lang === "hi" ? "कम्बो सेविंग" : "Combo Saving"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl font-bold text-gray-900">₹{combo.price}</span>
                          {combo.originalPrice && (
                            <span className="text-sm text-gray-400 line-through">₹{combo.originalPrice}</span>
                          )}
                        </div>
                        <div className="bg-red-50 px-2 py-1 rounded-lg">
                          <span className="text-sm font-bold text-red-600">
                            Save ₹{combo.originalPrice - combo.price}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleComboOrder(combo)}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 flex items-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        {lang === "hi" ? "ऑर्डर करें" : "Order Now"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Tempting overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div className="absolute bottom-4 right-4 text-purple-600 font-bold text-sm animate-bounce">
                    {lang === "hi" ? "👆 अभी ऑर्डर करें!" : "👆 Order Now!"}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust & Delivery Section */}
      <div className="px-4 pb-6">
        <div className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl p-6 text-white">
          <h2 className="text-xl font-bold mb-4 text-center">
            {lang === "hi" ? "हमारा वादा" : "Our Promise"}
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "तेज़ स्थानीय डिलीवरी" : "Fast Local Delivery"}
                </h3>
                <p className="text-sm text-white/80">
                  {lang === "hi" ? "आपके गाँव में 30 मिनट के अंदर" : "Within 30 mins in your village"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "स्वच्छ और हाइजेनिक" : "Clean & Hygienic"}
                </h3>
                <p className="text-sm text-white/80">
                  {lang === "hi" ? "सर्वोत्तम गुणवत्ता मानकों के साथ तैयार" : "Prepared with best quality standards"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "व्हाट्सएप सपोर्ट" : "WhatsApp Support"}
                </h3>
                <p className="text-sm text-white/80">
                  {lang === "hi" ? "सीधा संपर्क और त्वरित प्रतिक्रिया" : "Direct contact and quick response"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">
                  {lang === "hi" ? "स्थानीय विश्वसनीय विक्रेता" : "Local Trusted Vendors"}
                </h3>
                <p className="text-sm text-white/80">
                  {lang === "hi" ? "आपके गाँव के सत्यापित व्यापारी" : "Verified merchants from your village"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <button
          onClick={() => window.open(`https://wa.me/918004710164?text=${encodeURIComponent(lang === "hi" ? "नमस्ते! मैं ApnaGaon से ऑर्डर करना चाहता हूं।" : "Hello! I want to order from ApnaGaon.")}`, "_blank")}
          className="w-14 h-14 rounded-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-2xl transition-all duration-300 hover:scale-110 hover:shadow-green-500/50 flex items-center justify-center animate-bounce"
        >
          <MessageCircle className="w-6 h-6" />
        </button>
        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity whitespace-nowrap">
          {lang === "hi" ? "तुरंत ऑर्डर करें" : "Quick Order"}
        </div>
      </div>

      {/* Floating Cart Indicator */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-32 right-4 z-50">
          <button
            onClick={() => navigate('/cart')}
            className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-4 py-2 rounded-full shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 animate-pulse"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="font-bold">{cartItems.length}</span>
            <span className="text-sm">₹{cartItems.reduce((total, item) => total + (item.price * item.quantity), 0)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default FoodPage;