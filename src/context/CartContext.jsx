import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getCartFromLocalStorage,
  getCartMetaFromLocalStorage,
  saveCartMetaToLocalStorage,
  saveCartToLocalStorage,
} from "../utils/storage";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [appliedReward, setAppliedReward] = useState(null);
  const [coupon, setCoupon] = useState(null);

  // Initialize cart from localStorage on mount
  useEffect(() => {
    const savedCart = getCartFromLocalStorage();
    const savedMeta = getCartMetaFromLocalStorage();
    setCart(savedCart);
    setAppliedReward(savedMeta?.appliedReward || null);
    setCoupon(savedMeta?.coupon || null);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    saveCartToLocalStorage(cart);
  }, [cart]);

  useEffect(() => {
    saveCartMetaToLocalStorage({
      appliedReward,
      coupon,
    });
  }, [appliedReward, coupon]);

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);

      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: (item.quantity || 1) + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const clearCart = () => {
    setCart([]);
    setAppliedReward(null);
    setCoupon(null);
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price || 0) * (item.quantity || 1), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const getCartItemCount = () => {
    return cart.reduce((total, item) => total + (item.quantity || 1), 0);
  };

  const isProductInCart = (productId) => {
    return cart.some((item) => item.id === productId);
  };

  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    appliedReward,
    setAppliedReward,
    coupon,
    setCoupon,
    getTotalPrice,
    getTotalItems,
    getCartItemCount,
    isProductInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export default CartContext;
