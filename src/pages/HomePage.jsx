import React from "react";
import HomeTopSection from "../components/HomeTopSection";
import { useCart } from "../context/CartContext";
import "./HomePage.css";

const HomePage = () => {
  const { addToCart } = useCart();

  return (
    <div className="ag-home-page">
      <HomeTopSection addToCart={addToCart} />
    </div>
  );
};

export default HomePage;
