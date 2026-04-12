import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { useUser } from "../context/UserContext";
import useTranslation from "../utils/useTranslation";
import DeliveryAddressStrip from "./DeliveryAddressStrip";
import LocationBar from "./LocationBar";
import HeroPromoBanner from "./HeroPromoBanner";
import OffersRowSection from "./OffersRowSection";
import RewardBox from "./RewardBox";
import RewardWallet from "./RewardWallet";
import SpinWheel from "./SpinWheel";
import WelcomeBanner from "./WelcomeBanner";
import ProductRowSection from "./ProductRowSection";
import PromoStrip from "./PromoStrip";
import SearchWithAI from "./SearchWithAI";
import TopShortcutsRow from "./TopShortcutsRow";
import { getWhatsAppLink } from "../utils/whatsappUtils";
import {
  homeHeroPromo,
  homeMiniPromo,
  homeTopDeals,
} from "../data/homeTopSectionData";
import todayOffers from "../data/offersData";
import { addRewardPoints, claimDailyVisitPoints } from "../utils/rewardPoints";
import { getActiveRewards, removeExpiredRewards, rewardWalletEvents } from "../utils/rewardWallet";
import { useLocationIntelligence } from "../utils/locationHelper";
import { loadCatalogProducts, normalizeCatalogProduct } from "../utils/catalogApi";
import "./homeTopSection.css";

const HomeTopSection = ({ addToCart }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { toggleLanguage } = useLanguage();
  const { t, tx } = useTranslation();
  const [searchValue, setSearchValue] = useState("");
  const [feedback, setFeedback] = useState("");
  const [welcomeSignal, setWelcomeSignal] = useState(0);
  const [highlight, setHighlight] = useState(false);
  const [spinModalOpen, setSpinModalOpen] = useState(false);
  const [walletOpen, setWalletOpen] = useState(false);
  const [activeRewardCount, setActiveRewardCount] = useState(0);
  const [rewardBannerText, setRewardBannerText] = useState("");
  const [catalogProducts, setCatalogProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const highlightTimeoutRef = useRef(null);
  const locationIntelligence = useLocationIntelligence();

  const topDeals = useMemo(() => {
    const liveProducts = Array.isArray(catalogProducts) ? catalogProducts : [];
    if (liveProducts.length > 0) {
      return liveProducts.slice(0, 6);
    }
    return (homeTopDeals?.products || []).map(normalizeCatalogProduct);
  }, [catalogProducts]);

  const navigateSafe = (route) => {
    if (!route || typeof route !== "string") {
      navigate("/");
      return;
    }
    navigate(route);
  };

  const onAddDeal = (product) => {
    if (typeof addToCart === "function") {
      addToCart({
        id: product?.id || `deal-${Date.now()}`,
        name: product?.name || "ApnaGaon Item",
        image: product?.image || "",
        price: product?.price || 0,
        unit: product?.unit || product?.qty || "",
      });
      setFeedback(`${tx(product?.name) || t("item")} ${t("addedToCart")}`);
      setTimeout(() => setFeedback(""), 1500);
    }
  };

  const addressText = locationIntelligence.location?.name
    ? `DELIVER TO  ${locationIntelligence.location.name}`
    : user?.address
    ? `${t("home").toUpperCase()}  ${user.address}`
    : user?.village
    ? `${t("home").toUpperCase()}  ${user.village}`
    : t("homeAddressFallback");

  const onSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchValue.trim()) {
      navigate("/search");
      return;
    }
    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  const handleOfferOrder = (offer) => {
    const offerName = tx(offer?.title) || "Offer";
    const offerType = tx(offer?.type) || "General";
    const itemList = Array.isArray(offer?.items) && offer.items.length > 0
      ? offer.items.map((item) => tx(item)).join(", ")
      : "Available items";

    const message = `Namaste, mujhe "${offerName}" offer order karna hai. Items: ${itemList}. Category: ${offerType}.`;
    const link = getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank", "noopener,noreferrer");
      addRewardPoints(20);
    }
  };

  const runHomeWelcomeEffects = () => {
    // Reset searchable/filterable home controls.
    setSearchValue("");

    setWelcomeSignal((value) => value + 1);
    setHighlight(true);

    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlight(false);
    }, 2600);
  };

  const handleApnaGaonHome = () => {
    if (location.pathname !== "/") {
      navigate("/", { state: { fromApnaGaonShortcut: true } });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    runHomeWelcomeEffects();
  };

  useEffect(() => {
    claimDailyVisitPoints(10);
  }, []);

  useEffect(() => {
    let active = true;

    const loadTopCatalog = async () => {
      try {
        setCatalogLoading(true);
        setCatalogError("");
        const liveProducts = await loadCatalogProducts();
        if (!active) return;
        setCatalogProducts(Array.isArray(liveProducts) ? liveProducts : []);
      } catch (error) {
        if (!active) return;
        setCatalogError(error?.message || "Failed to load live products");
        setCatalogProducts((homeTopDeals?.products || []).map(normalizeCatalogProduct));
      } finally {
        if (active) setCatalogLoading(false);
      }
    };

    loadTopCatalog();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const syncRewards = () => {
      removeExpiredRewards();
      const rewards = getActiveRewards();
      const active = Array.isArray(rewards) ? rewards.length : 0;
      setActiveRewardCount(active);

      if (active <= 0) {
        setRewardBannerText("");
        return;
      }

      const soonest = [...rewards].sort((a, b) => (a.expiry || 0) - (b.expiry || 0))[0];
      const remainingMs = (soonest?.expiry || 0) - Date.now();
      const remainingHrs = Math.max(1, Math.floor(remainingMs / (60 * 60 * 1000)));
      if (soonest?.rewardType === "delivery") {
        setRewardBannerText(`\uD83D\uDE9A Free Delivery reward active`);
      } else if (soonest?.name) {
        setRewardBannerText(`\uD83C\uDF81 ${soonest.name} expires in ${remainingHrs} hr`);
      } else {
        setRewardBannerText(`You have ${active} rewards available`);
      }
    };

    syncRewards();
    window.addEventListener(rewardWalletEvents.updated, syncRewards);
    window.addEventListener("storage", syncRewards);
    return () => {
      window.removeEventListener(rewardWalletEvents.updated, syncRewards);
      window.removeEventListener("storage", syncRewards);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.fromApnaGaonShortcut) {
      navigate("/", { replace: true });
      const welcomeTimer = window.setTimeout(runHomeWelcomeEffects, 0);
      return () => window.clearTimeout(welcomeTimer);
    }
    return undefined;
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section className="ag-home-top-shell">
      <div className="ag-home-top-three-layer">
        <WelcomeBanner trigger={welcomeSignal} />

        <div className={`ag-home-highlight ${highlight ? "ag-home-highlight--active" : ""}`}>
        <TopShortcutsRow
          onApnaGaon={handleApnaGaonHome}
          onFastDelivery={() => navigateSafe("/quick")}
          onSmartVillage={() => navigateSafe("/village")}
          onLanguageSwitch={() => {
            if (typeof toggleLanguage === "function") {
              toggleLanguage();
            } else {
              window.alert(t("languageSwitchSoon"));
            }
          }}
        />
        </div>

        <button
          type="button"
          className="ag-spin-win-home-btn"
          onClick={() => setSpinModalOpen(true)}
          aria-label="Spin and Win"
        >
          Spin & Win
        </button>

        {activeRewardCount > 0 ? (
          <button
            type="button"
            className="ag-home-reward-banner"
            onClick={() => setWalletOpen(true)}
            aria-label="Open reward wallet"
          >
            <strong>{rewardBannerText || `You have ${activeRewardCount} rewards available`}</strong>
            <span>Tap to open wallet</span>
          </button>
        ) : null}

        <div className={`ag-home-highlight ${highlight ? "ag-home-highlight--active" : ""}`}>
        <LocationBar compact intelligence={locationIntelligence} />
        </div>

        <div className={`ag-home-highlight ${highlight ? "ag-home-highlight--active" : ""}`}>
        <DeliveryAddressStrip
          address={addressText}
          timeText={locationIntelligence.deliveryEstimate || t("tenMin")}
          onAddressClick={() => window.alert(locationIntelligence.message || t("addressSelectorSoon"))}
          onTimeClick={() => navigateSafe("/quick")}
        />
        </div>

        <SearchWithAI
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          onSubmit={onSearchSubmit}
          onAskAI={() => window.alert(t("aiAssistantSoon"))}
        />
      </div>

      <HeroPromoBanner promo={homeHeroPromo} onClick={() => navigateSafe(homeHeroPromo?.route)} />

      <RewardBox />

      <div className={`ag-home-highlight ${highlight ? "ag-home-highlight--active" : ""}`}>
        <PromoStrip promo={homeMiniPromo} onClick={() => navigateSafe(homeMiniPromo?.route)} />
      </div>

      <div className={`ag-home-highlight ${highlight ? "ag-home-highlight--active" : ""}`}>
        <OffersRowSection
          title={{ en: "Today's Offers", hi: "आज के ऑफर" }}
          offers={todayOffers}
          onOrderNow={handleOfferOrder}
        />
      </div>

      {feedback ? <p className="ag-home-top-feedback">{feedback}</p> : null}

      <div className={`ag-home-highlight ${highlight ? "ag-home-highlight--active" : ""}`}>
        <ProductRowSection
          title={homeTopDeals?.title}
          products={topDeals}
          onAdd={onAddDeal}
          onViewAll={() => navigateSafe("/categories")}
          loading={catalogLoading}
          error={catalogError}
        />
      </div>

      <SpinWheel open={spinModalOpen} onClose={() => setSpinModalOpen(false)} />
      <RewardWallet open={walletOpen} onClose={() => setWalletOpen(false)} />
    </section>
  );
};

export default HomeTopSection;

