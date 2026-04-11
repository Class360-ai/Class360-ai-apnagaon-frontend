import React, { useEffect, useMemo, useState } from "react";
import { Gift, X } from "lucide-react";
import { getWhatsAppLink } from "../utils/whatsappUtils";
import { addRewardPoints } from "../utils/rewardPoints";
import { addReward, REWARD_TTL_MS } from "../utils/rewardWallet";
import RewardWheelSVG from "./RewardWheelSVG";
import "./spinWheel.css";

const STORAGE_KEY = "apnagaon_spin_win_result";

const REWARDS = [
  { id: "free-delivery", name: "Free Delivery", displayName: "Delivery", weight: 30, points: 12, rare: false },
  { id: "cashback-10", name: "\u20B910 Cashback", displayName: "Cashback", weight: 25, points: 15, rare: false },
  { id: "free-tea", name: "Free Tea", displayName: "Tea", weight: 15, points: 10, rare: false },
  { id: "free-cold-drink", name: "Free Cold Drink", displayName: "Cold Drink", weight: 15, points: 10, rare: false },
  { id: "discount-20", name: "20% OFF", displayName: "20% OFF", weight: 10, points: 18, rare: false },
  { id: "free-milk", name: "Free Milk", displayName: "Milk", weight: 3, points: 14, rare: true },
  { id: "coupon-50", name: "\u20B950 Coupon", displayName: "\u20B950", weight: 2, points: 20, rare: true },
];

function getWeightedReward(rewards) {
  const totalWeight = rewards.reduce((sum, r) => sum + r.weight, 0);
  let random = Math.random() * totalWeight;

  for (const reward of rewards) {
    if (random < reward.weight) {
      return reward.name;
    }
    random -= reward.weight;
  }

  return rewards[0]?.name || null;
}

const getTodayDateKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const readTodaySpinResult = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const spinDate = parsed?.spinDate || parsed?.date;
    const rewardWon = parsed?.rewardWon || parsed?.rewardId;

    if (!parsed || spinDate !== getTodayDateKey()) return null;
    if (typeof rewardWon !== "string") return null;

    const reward = REWARDS.find((item) => item.id === rewardWon);
    return reward || null;
  } catch (error) {
    return null;
  }
};

const saveTodaySpinResult = (rewardId) => {
  try {
    const spinDate = getTodayDateKey();
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        spinDate,
        rewardWon: rewardId,
        date: spinDate,
        rewardId,
      })
    );
  } catch (error) {
    // Ignore storage errors safely.
  }
};

const resultMessage = (reward) => {
  if (!reward) return "";
  if (reward.rare) return `\uD83E\uDD5B Rare Reward! ${reward.name}!`;
  return `\uD83C\uDF89 You won ${reward.name}!`;
};

const getRewardMeta = (reward) => {
  const safeName = String(reward?.name || "").toLowerCase();
  if (safeName.includes("delivery")) {
    return {
      rewardType: "delivery",
      code: "FREE_DELIVERY",
      value: "Free Delivery",
      applicableOn: ["cart", "food", "all"],
      minOrderValue: 0,
      autoApplicable: true,
      rarity: "common",
    };
  }

  if (safeName.includes("cashback")) {
    return {
      rewardType: "discount",
      code: "CASHBACK_10",
      value: "\u20B910",
      discountType: "flat",
      discountValue: 10,
      applicableOn: ["cart", "food"],
      minOrderValue: 0,
      autoApplicable: true,
      rarity: "common",
    };
  }

  if (safeName.includes("20%")) {
    return {
      rewardType: "discount",
      code: "OFF_20",
      value: "20%",
      discountType: "percent",
      discountValue: 20,
      applicableOn: ["cart", "food"],
      minOrderValue: 99,
      autoApplicable: true,
      rarity: "common",
    };
  }

  if (safeName.includes("50")) {
    return {
      rewardType: "discount",
      code: "COUPON_50",
      value: "\u20B950",
      discountType: "flat",
      discountValue: 50,
      applicableOn: ["cart", "food"],
      minOrderValue: 149,
      autoApplicable: true,
      rarity: "rare",
    };
  }

  if (safeName.includes("milk")) {
    return {
      rewardType: "item",
      code: "FREE_MILK",
      value: "Free Milk",
      freeItemName: "Milk",
      applicableOn: ["cart", "food"],
      minOrderValue: 0,
      autoApplicable: true,
      rarity: "rare",
    };
  }

  if (safeName.includes("cold drink")) {
    return {
      rewardType: "item",
      code: "FREE_COLD_DRINK",
      value: "Free Cold Drink",
      freeItemName: "Cold Drink",
      applicableOn: ["cart", "food"],
      minOrderValue: 0,
      autoApplicable: true,
      rarity: "common",
    };
  }

  return {
    rewardType: "item",
    code: "FREE_TEA",
    value: "Free Tea",
    freeItemName: "Tea",
    applicableOn: ["cart", "food"],
    minOrderValue: 0,
    autoApplicable: true,
    rarity: "common",
  };
};

const makeConfettiPieces = (count, rare) =>
  Array.from({ length: count }).map((_, index) => ({
    id: `${Date.now()}-${index}`,
    left: Math.random() * 100,
    delay: Math.random() * 0.32,
    duration: 1.2 + Math.random() * 0.9,
    rotate: Math.floor(Math.random() * 360),
    hue: rare ? [44, 32, 142, 346][index % 4] : [142, 198, 28, 14][index % 4],
  }));

const SpinWheelModal = ({ open, onClose }) => {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [alreadySpun, setAlreadySpun] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const anglePerSlice = useMemo(() => 360 / REWARDS.length, []);
  const rareRewardWon = Boolean(selectedReward?.rare);

  useEffect(() => {
    if (!open) return;
    const todayResult = readTodaySpinResult();
    setSelectedReward(todayResult);
    setAlreadySpun(Boolean(todayResult));
    setSpinning(false);
    setConfettiPieces([]);
  }, [open]);

  if (!open) return null;

  const triggerConfetti = (rare) => {
    const burst = makeConfettiPieces(rare ? 48 : 26, rare);
    setConfettiPieces(burst);
    window.setTimeout(() => setConfettiPieces([]), rare ? 2200 : 1700);
  };

  const handleSpin = () => {
    if (spinning || alreadySpun) return;

    const rewardName = getWeightedReward(REWARDS);
    const rewardIndex = REWARDS.findIndex((item) => item.name === rewardName);
    const safeIndex = rewardIndex >= 0 ? rewardIndex : 0;
    const reward = REWARDS[safeIndex] || REWARDS[0];

    const targetAngle = 360 - (safeIndex * anglePerSlice + anglePerSlice / 2);
    const fullRounds = 360 * 5;
    const finalRotation = rotation + fullRounds + targetAngle;

    saveTodaySpinResult(reward.id);
    addRewardPoints(reward.points || 5);
    setSelectedReward(reward);
    setAlreadySpun(true);
    setSpinning(true);
    setRotation(finalRotation);
  };

  const handleSpinEnd = () => {
    setSpinning(false);
    if (selectedReward && spinning) {
      const rewardMeta = getRewardMeta(selectedReward);
      addReward({
        name: selectedReward.name,
        rewardType: rewardMeta.rewardType,
        value: rewardMeta.value,
        code: rewardMeta.code,
        expiry: Date.now() + REWARD_TTL_MS,
        used: false,
        usedAt: null,
        createdAt: Date.now(),
        source: "spin",
        autoApplicable: rewardMeta.autoApplicable,
        applicableOn: rewardMeta.applicableOn,
        minOrderValue: rewardMeta.minOrderValue,
        rarity: rewardMeta.rarity,
        discountType: rewardMeta.discountType,
        discountValue: rewardMeta.discountValue,
        freeItemName: rewardMeta.freeItemName,
      });
      triggerConfetti(Boolean(selectedReward.rare));
    }
  };

  const handleUseNow = () => {
    if (!selectedReward) return;
    const message = `Namaste, I won "${selectedReward.name}" in Spin & Win. Please help me claim it.`;
    const link = getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank", "noopener,noreferrer");
    }
    onClose?.();
  };

  return (
    <div className="ag-spin-overlay" role="dialog" aria-modal="true" aria-label="Spin and Win">
      <div className="ag-spin-modal">
        <button type="button" className="ag-spin-close" aria-label="Close spin wheel" onClick={onClose}>
          <X size={18} />
        </button>

        <div className="ag-spin-header">
          <h2 className="ag-spin-title">Spin & Win</h2>
          <p className="ag-spin-subtitle">Try your luck today</p>
        </div>

        <div className="ag-spin-wheel-stage">
          <div className="ag-spin-pointer" />
          <RewardWheelSVG rewards={REWARDS} rotation={rotation} onSpinEnd={handleSpinEnd} />
          <div className="ag-spin-hub" aria-hidden="true">
            <span className="ag-spin-hub-icon">{"\uD83C\uDF81"}</span>
          </div>
        </div>

        <button type="button" className="ag-spin-action" onClick={handleSpin} disabled={spinning || alreadySpun}>
          {spinning ? "Spinning..." : alreadySpun ? "Already Used Today" : "Spin Now"}
        </button>

        {selectedReward ? (
          <div className={`ag-spin-result-card ${rareRewardWon ? "ag-spin-result-card--rare" : ""}`}>
            <div className="ag-spin-result-row">
              <Gift size={18} />
              <strong>{resultMessage(selectedReward)}</strong>
            </div>
            <button type="button" onClick={handleUseNow}>
              Use Now
            </button>
          </div>
        ) : null}

        {confettiPieces.length > 0 ? (
          <div className="ag-confetti-layer" aria-hidden="true">
            {confettiPieces.map((piece) => (
              <span
                key={piece.id}
                className="ag-confetti-piece"
                style={{
                  left: `${piece.left}%`,
                  animationDelay: `${piece.delay}s`,
                  animationDuration: `${piece.duration}s`,
                  transform: `rotate(${piece.rotate}deg)`,
                  backgroundColor: `hsl(${piece.hue} 85% 55%)`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SpinWheelModal;

