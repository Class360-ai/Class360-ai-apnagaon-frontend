// Referral system utilities for ApnaGaon app

const REFERRAL_STORAGE_KEY = "apnagaon_referrals";

// Referral rewards configuration
export const REFERRAL_REWARDS = {
  successfulReferral: {
    reward: "free_item",
    itemName: "Cold Drink",
    itemNameHi: "कोल्ड ड्रिंक",
    itemId: "prod-015", // Coca Cola
    description: "Get a free cold drink on successful referral",
    descriptionHi: "सफल रेफरल पर एक फ्री कोल्ड ड्रिंक पाएं",
  },
  alternativeReward: {
    reward: "free_item",
    itemName: "Fresh Milk",
    itemNameHi: "ताजा दूध",
    itemId: "prod-006", // Fresh Milk
    description: "Get free fresh milk as alternative reward",
    descriptionHi: "वैकल्पिक इनाम के रूप में फ्री ताजा दूध पाएं",
  },
};

// Generate unique referral code
export const generateReferralCode = (userId) => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `AG${userId}${timestamp}${random}`.toUpperCase();
};

// Save referral data to localStorage
export const saveReferralData = (data) => {
  try {
    const existingData = getReferralData();
    const updatedData = { ...existingData, ...data };
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(updatedData));
  } catch (error) {
    console.error("Error saving referral data:", error);
  }
};

// Get referral data from localStorage
export const getReferralData = () => {
  try {
    const data = localStorage.getItem(REFERRAL_STORAGE_KEY);
    return data ? JSON.parse(data) : {
      referralCode: null,
      referredUsers: [],
      successfulReferrals: 0,
      pendingRewards: [],
      claimedRewards: [],
    };
  } catch (error) {
    console.error("Error retrieving referral data:", error);
    return {
      referralCode: null,
      referredUsers: [],
      successfulReferrals: 0,
      pendingRewards: [],
      claimedRewards: [],
    };
  }
};

// Add a referred user
export const addReferredUser = (userPhone) => {
  const data = getReferralData();
  if (!data.referredUsers.includes(userPhone)) {
    data.referredUsers.push(userPhone);
    saveReferralData(data);
  }
};

// Mark referral as successful and add reward
export const markReferralSuccessful = (userPhone) => {
  const data = getReferralData();
  const userIndex = data.referredUsers.indexOf(userPhone);
  if (userIndex !== -1) {
    data.successfulReferrals += 1;
    // Add reward to pending rewards
    data.pendingRewards.push({
      id: `reward_${Date.now()}`,
      type: "free_item",
      itemName: REFERRAL_REWARDS.successfulReferral.itemName,
      itemNameHi: REFERRAL_REWARDS.successfulReferral.itemNameHi,
      itemId: REFERRAL_REWARDS.successfulReferral.itemId,
      claimed: false,
      dateEarned: new Date().toISOString(),
    });
    saveReferralData(data);
    return true;
  }
  return false;
};

// Claim a reward
export const claimReward = (rewardId) => {
  const data = getReferralData();
  const rewardIndex = data.pendingRewards.findIndex(r => r.id === rewardId);
  if (rewardIndex !== -1) {
    const reward = data.pendingRewards[rewardIndex];
    reward.claimed = true;
    reward.dateClaimed = new Date().toISOString();
    data.claimedRewards.push(reward);
    data.pendingRewards.splice(rewardIndex, 1);
    saveReferralData(data);
    return reward;
  }
  return null;
};

// Get pending rewards count
export const getPendingRewardsCount = () => {
  const data = getReferralData();
  return data.pendingRewards.length;
};

// Get total successful referrals
export const getSuccessfulReferralsCount = () => {
  const data = getReferralData();
  return data.successfulReferrals;
};

// Generate referral message for WhatsApp
export const generateReferralMessage = (referralCode, userName, lang = "en") => {
  const referralLink = `https://apnagaon.com/join?ref=${referralCode}`;

  if (lang === "hi") {
    return `नमस्ते! मैं ApnaGaon ऐप का इस्तेमाल कर रहा हूं और यह बहुत बढ़िया है! हमारे गांव की सभी जरूरतें एक जगह - दूध, सब्जियां, सेवाएं, और बहुत कुछ!

रेफरल कोड: ${referralCode}

अगर आप साइन अप करेंगे तो आप भी फ्री कोल्ड ड्रिंक या दूध पा सकते हैं!

डाउनलोड करें: ${referralLink}

#ApnaGaon #VillageLife`;
  }

  return `Hi! I'm using the ApnaGaon app and it's amazing! Everything you need for village life - milk, vegetables, services, and more in one place!

Referral Code: ${referralCode}

Sign up with my code and get a FREE cold drink or milk!

Download: ${referralLink}

#ApnaGaon #VillageLife`;
};

// Get referral stats
export const getReferralStats = () => {
  const data = getReferralData();
  return {
    totalReferrals: data.referredUsers.length,
    successfulReferrals: data.successfulReferrals,
    pendingRewards: data.pendingRewards.length,
    claimedRewards: data.claimedRewards.length,
  };
};

export default {
  generateReferralCode,
  saveReferralData,
  getReferralData,
  addReferredUser,
  markReferralSuccessful,
  claimReward,
  getPendingRewardsCount,
  getSuccessfulReferralsCount,
  generateReferralMessage,
  getReferralStats,
  REFERRAL_REWARDS,
};