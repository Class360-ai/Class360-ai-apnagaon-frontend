const normalizeItems = (items = []) =>
  (Array.isArray(items) ? items : []).map((item, index) => ({
    id: item?.id || item?._id || `${item?.name || "item"}-${index}`,
    name: item?.name || "Item",
    price: Number(item?.price || item?.fee || 0) || 0,
    quantity: Math.max(1, Number(item?.quantity || item?.qty || 1) || 1),
    image: item?.image || "",
    unit: item?.unit || item?.subtitle || item?.categoryName || "",
    oldPrice: Number(item?.oldPrice || item?.mrp || 0) || 0,
  }));

const getDiscountAmount = (source = {}, subtotal = 0) => {
  if (!source || subtotal <= 0) return 0;

  if (Number.isFinite(Number(source.discountAmount))) {
    return Math.max(0, Math.min(Number(source.discountAmount) || 0, subtotal));
  }

  const discountType = String(source.discountType || source.type || "").toLowerCase();
  const value = Number(source.discountValue ?? source.value ?? source.amount ?? 0) || 0;

  if (discountType === "percent") {
    return Math.max(0, Math.min(subtotal, Math.round((subtotal * value) / 100)));
  }

  if (discountType === "flat") {
    return Math.max(0, Math.min(value, subtotal));
  }

  const rewardName = String(source.name || source.code || source.label || "").toLowerCase();
  if (rewardName.includes("20%")) return Math.round((subtotal * 20) / 100);
  if (rewardName.includes("10%")) return Math.round((subtotal * 10) / 100);
  if (rewardName.includes("50")) return Math.min(50, subtotal);
  if (rewardName.includes("10")) return Math.min(10, subtotal);

  return 0;
};

const getDeliveryFeeEffect = (source = {}) => {
  const rewardType = String(source.rewardType || source.type || "").toLowerCase();
  const flags = [source.freeDelivery, source.isFreeDelivery, source.deliveryFree, source.deliveryWaived]
    .map(Boolean)
    .some(Boolean);

  return rewardType === "delivery" || rewardType === "free_delivery" || flags;
};

const getFreeGift = (source = {}) => {
  return (
    source.freeGift ||
    source.freeGiftName ||
    source.giftName ||
    source.freeItemName ||
    source.itemName ||
    source.name ||
    null
  );
};

export const calculateCartTotals = (items = [], options = {}) => {
  const safeItems = normalizeItems(items);
  const subtotal = safeItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const baseDeliveryFee = Number.isFinite(Number(options.deliveryFee)) ? Number(options.deliveryFee) : 0;
  const packagingFee = Number.isFinite(Number(options.packagingFee)) ? Number(options.packagingFee) : 0;
  const appliedReward = options.appliedReward || null;
  const coupon = options.coupon || null;

  let deliveryFee = baseDeliveryFee;
  let rewardDiscount = 0;
  let couponDiscount = 0;
  let freeGift = null;
  const notes = [];

  if (appliedReward) {
    if (getDeliveryFeeEffect(appliedReward)) {
      deliveryFee = 0;
      notes.push("Free delivery reward applied");
    }

    const rewardType = String(appliedReward.rewardType || "").toLowerCase();
    if (rewardType === "discount") {
      rewardDiscount = getDiscountAmount(appliedReward, subtotal);
      if (rewardDiscount > 0) notes.push(`Reward discount applied: ₹${rewardDiscount}`);
    } else if (rewardType === "item") {
      freeGift = getFreeGift(appliedReward);
      if (freeGift) notes.push(`Free gift added: ${freeGift}`);
    }
  }

  if (coupon) {
    if (getDeliveryFeeEffect(coupon)) {
      deliveryFee = 0;
      notes.push("Coupon removed delivery fee");
    }

    const couponType = String(coupon.rewardType || coupon.type || "").toLowerCase();
    if (couponType === "discount" || couponType === "coupon") {
      couponDiscount = getDiscountAmount(coupon, subtotal);
      if (couponDiscount > 0) notes.push(`Coupon discount applied: ₹${couponDiscount}`);
    } else if (couponType === "item") {
      freeGift = freeGift || getFreeGift(coupon);
      if (freeGift) notes.push(`Coupon free gift: ${freeGift}`);
    }
  }

  const discount = Math.max(0, rewardDiscount + couponDiscount);
  const total = Math.max(0, subtotal + deliveryFee + packagingFee - discount);

  return {
    items: safeItems,
    subtotal,
    baseDeliveryFee,
    deliveryFee,
    packagingFee,
    rewardDiscount,
    couponDiscount,
    discount,
    total,
    appliedReward,
    coupon,
    freeGift,
    notes,
  };
};

export default calculateCartTotals;
