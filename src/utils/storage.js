// Local storage utilities for persistent cart and language preference

const CART_STORAGE_KEY = "apnagaon_cart";
const LANGUAGE_STORAGE_KEY = "apnagaon_language";
const USER_STORAGE_KEY = "apnagaon_user";

// Cart utilities
export const saveCartToLocalStorage = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
};

export const getCartFromLocalStorage = () => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error("Error retrieving cart from localStorage:", error);
    return [];
  }
};

export const clearCartFromLocalStorage = () => {
  try {
    localStorage.removeItem(CART_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing cart from localStorage:", error);
  }
};

// Language utilities
export const saveLanguagePreference = (lang) => {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch (error) {
    console.error("Error saving language preference:", error);
  }
};

export const getLanguagePreference = () => {
  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en";
  } catch (error) {
    console.error("Error retrieving language preference:", error);
    return "en";
  }
};

// User utilities
export const saveUserPreference = (user) => {
  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Error saving user preference:", error);
  }
};

export const getUserPreference = () => {
  try {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user
      ? JSON.parse(user)
      : {
          name: "User",
          phone: "",
          village: "Azamgarh",
          address: "",
          email: "",
        };
  } catch (error) {
    console.error("Error retrieving user preference:", error);
    return {
      name: "User",
      phone: "",
      village: "Azamgarh",
      address: "",
      email: "",
    };
  }
};

export default {
  saveCartToLocalStorage,
  getCartFromLocalStorage,
  clearCartFromLocalStorage,
  saveLanguagePreference,
  getLanguagePreference,
  saveUserPreference,
  getUserPreference,
};
