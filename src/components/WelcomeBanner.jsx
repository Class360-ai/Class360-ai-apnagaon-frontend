import React, { useEffect, useRef, useState } from "react";
import "./welcomeBanner.css";

const WelcomeBanner = ({ trigger = 0 }) => {
  const [visible, setVisible] = useState(false);
  const [fading, setFading] = useState(false);
  const fadeTimerRef = useRef(null);
  const hideTimerRef = useRef(null);

  useEffect(() => {
    if (!trigger) {
      return undefined;
    }

    setVisible(true);
    setFading(false);

    if (fadeTimerRef.current) {
      window.clearTimeout(fadeTimerRef.current);
    }
    if (hideTimerRef.current) {
      window.clearTimeout(hideTimerRef.current);
    }

    fadeTimerRef.current = window.setTimeout(() => {
      setFading(true);
    }, 2200);

    hideTimerRef.current = window.setTimeout(() => {
      setVisible(false);
      setFading(false);
    }, 3000);

    return () => {
      if (fadeTimerRef.current) {
        window.clearTimeout(fadeTimerRef.current);
      }
      if (hideTimerRef.current) {
        window.clearTimeout(hideTimerRef.current);
      }
    };
  }, [trigger]);

  if (!visible) {
    return null;
  }

  return (
    <aside
      className={`ag-welcome-banner ${fading ? "ag-welcome-banner--fade-out" : "ag-welcome-banner--fade-in"}`}
      aria-live="polite"
    >
      <p className="ag-welcome-banner__title">Welcome to ApnaGaon 👋</p>
      <p className="ag-welcome-banner__subtitle">Your village, now online</p>
    </aside>
  );
};

export default WelcomeBanner;
