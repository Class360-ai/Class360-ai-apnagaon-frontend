import { canAddReward, isRareReward } from "./rewardWallet";

const getCartSubtotal = (cart = []) =>
  (Array.isArray(cart) ? cart : []).reduce(
    (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1),
    0
  );

export const validateRewardUse = (reward, cart = []) => {
  if (!reward || reward.used) return { valid: false, reason: "invalid_reward" };
  const now = Date.now();
  if (!Number.isFinite(reward.expiry) || reward.expiry <= now) return { valid: false, reason: "expired" };

  const subtotal = getCartSubtotal(cart);
  if (subtotal < (reward.minOrderValue || 0)) {
    return { valid: false, reason: "min_order_not_met" };
  }

  return { valid: true, reason: null };
};

const getDiscountAmount = (reward, subtotal) => {
  if (!reward || subtotal <= 0) return 0;
  if (reward.rewardType !== "discount") return 0;

  if (reward.discountType === "percent") {
    const value = Number(reward.discountValue) || 0;
    return Math.max(0, Math.round((subtotal * value) / 100));
  }

  if (reward.discountType === "flat") {
    const value = Number(reward.discountValue) || 0;
    return Math.max(0, Math.min(value, subtotal));
  }

  const safeName = String(reward.name || "").toLowerCase();
  if (safeName.includes("20%")) {
    return Math.round(subtotal * 0.2);
  }
  if (safeName.includes("50")) {
    return Math.min(50, subtotal);
  }
  if (safeName.includes("10")) {
    return Math.min(10, subtotal);
  }

  return 0;
};

const scoreReward = (reward, subtotal, deliveryFee) => {
  if (!reward) return 0;
  if (reward.rewardType === "delivery") return deliveryFee > 0 ? deliveryFee + 30 : 20;
  if (reward.rewardType === "discount") return getDiscountAmount(reward, subtotal) + 15;
  if (reward.rewardType === "item") return isRareReward(reward) ? 18 : 12;
  return 1;
};

export const getBestCartReward = (rewards = [], cart = [], options = {}) => {
  const subtotal = Number.isFinite(options.subtotal) ? options.subtotal : getCartSubtotal(cart);
  const deliveryFee = Number.isFinite(options.deliveryFee) ? options.deliveryFee : 0;
  const safeRewards = Array.isArray(rewards) ? rewards : [];

  const eligible = safeRewards.filter((reward) => {
    const validity = validateRewardUse(reward, cart);
    if (!validity.valid) return false;
    if (reward.autoApplicable === false) return false;
    const scope = Array.isArray(reward.applicableOn) ? reward.applicableOn : [];
    return scope.length === 0 || scope.includes("cart") || scope.includes("all");
  });

  if (!eligible.length) return null;

  return eligible.reduce((best, current) => {
    if (!best) return current;
    const bestScore = scoreReward(best, subtotal, deliveryFee);
    const currentScore = scoreReward(current, subtotal, deliveryFee);
    return currentScore > bestScore ? current : best;
  }, null);
};

export const applyRewardToCart = (cart = [], reward, options = {}) => {
  const subtotal = Number.isFinite(options.subtotal) ? options.subtotal : getCartSubtotal(cart);
  const baseDeliveryFee = Number.isFinite(options.deliveryFee) ? options.deliveryFee : 0;

  if (!reward) {
    return {
      reward: null,
      subtotal,
      baseDeliveryFee,
      deliveryFee: baseDeliveryFee,
      discountAmount: 0,
      total: subtotal + baseDeliveryFee,
      notes: [],
    };
  }

  let deliveryFee = baseDeliveryFee;
  let discountAmount = 0;
  const notes = [];

  if (reward.rewardType === "delivery") {
    if (deliveryFee > 0) {
      notes.push("Delivery fee waived");
    } else {
      notes.push("Free delivery reward is active");
    }
    deliveryFee = 0;
  } else if (reward.rewardType === "discount") {
    discountAmount = getDiscountAmount(reward, subtotal);
    if (discountAmount > 0) {
      notes.push(`Discount applied: ₹${discountAmount}`);
    } else {
      notes.push(`${reward.name} available for checkout validation`);
    }
  } else if (reward.rewardType === "item") {
    const freeItem = reward.freeItemName || reward.name;
    notes.push(`Free gift: ${freeItem}`);
  }

  const total = Math.max(0, subtotal + deliveryFee - discountAmount);
  return {
    reward,
    subtotal,
    baseDeliveryFee,
    deliveryFee,
    discountAmount,
    total,
    notes,
  };
};

export const removeAppliedReward = (cart = [], options = {}) =>
  applyRewardToCart(cart, null, options);

export { canAddReward, isRareReward };
