import React, { useEffect, useMemo, useState } from "react";
import { Gift, Info, X } from "lucide-react";
import { getRewards, markUsed, removeExpiredRewards, rewardWalletEvents } from "../utils/rewardWallet";
import { openWhatsAppWithReward } from "../utils/whatsappHelper";
import "./rewardWallet.css";

const formatRewardType = (type) => {
  if (type === "delivery") return "Delivery";
  if (type === "discount") return "Discount";
  return "Item";
};

const getExpiryLabel = (expiry) => {
  if (!Number.isFinite(expiry)) return "Expires soon";
  const remaining = expiry - Date.now();
  if (remaining <= 0) return "Expired";

  const hours = Math.floor(remaining / (60 * 60 * 1000));
  const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

  if (hours > 0) return `Expires in ${hours} hr${hours > 1 ? "s" : ""}`;
  return `Expires in ${Math.max(1, minutes)} min`;
};

const getStatus = (reward) => {
  if (!reward) return "expired";
  if (reward.used) return "used";
  if (!Number.isFinite(reward.expiry) || reward.expiry <= Date.now()) return "expired";
  return "active";
};

const RewardWallet = ({ open, onClose }) => {
  const [rewards, setRewards] = useState([]);
  const [detailRewardId, setDetailRewardId] = useState(null);

  useEffect(() => {
    if (!open) return;

    const syncRewards = () => {
      removeExpiredRewards();
      setRewards(getRewards());
    };

    syncRewards();
    window.addEventListener(rewardWalletEvents.updated, syncRewards);
    window.addEventListener("storage", syncRewards);

    return () => {
      window.removeEventListener(rewardWalletEvents.updated, syncRewards);
      window.removeEventListener("storage", syncRewards);
    };
  }, [open]);

  const activeCount = useMemo(() => rewards.filter((reward) => getStatus(reward) === "active").length, [rewards]);

  const handleUseNow = (reward) => {
    if (!reward || getStatus(reward) !== "active") return;

    const opened = openWhatsAppWithReward(
      {
        items: [{ name: "ApnaGaon order", quantity: 1 }],
        paymentMethod: "WhatsApp",
      },
      reward
    );

    if (opened) {
      markUsed(reward.id);
      setRewards(getRewards());
    }
  };

  if (!open) return null;

  return (
    <div className="ag-wallet-overlay" role="dialog" aria-modal="true" aria-label="Reward Wallet">
      <div className="ag-wallet-modal">
        <button type="button" className="ag-wallet-close" onClick={onClose} aria-label="Close reward wallet">
          <X size={18} />
        </button>

        <div className="ag-wallet-head">
          <h3>Reward Wallet</h3>
          <p>{activeCount} active reward{activeCount === 1 ? "" : "s"}</p>
        </div>

        <div className="ag-wallet-list">
          {rewards.length === 0 ? (
            <div className="ag-wallet-empty">No rewards yet</div>
          ) : (
            rewards.map((reward) => {
              const status = getStatus(reward);
              const detailsOpen = detailRewardId === reward.id;
              return (
                <article key={reward.id} className={`ag-wallet-card is-${status}`}>
                  <div className="ag-wallet-card-top">
                    <span className="ag-wallet-icon">
                      <Gift size={14} />
                    </span>
                    <span className={`ag-wallet-status is-${status}`}>
                      {status === "active" ? "Active" : status === "used" ? "Used" : "Expired"}
                    </span>
                  </div>

                  <h4>{reward?.name || "Reward"}</h4>
                  <p>{formatRewardType(reward?.rewardType)}</p>
                  <p>{getExpiryLabel(reward?.expiry)}</p>

                  <div className="ag-wallet-actions">
                    <button type="button" disabled={status !== "active"} onClick={() => handleUseNow(reward)}>
                      {status === "active" ? "Use Now" : status === "used" ? "Used" : "Expired"}
                    </button>
                    <button
                      type="button"
                      className="ag-wallet-secondary-btn"
                      onClick={() => setDetailRewardId(detailsOpen ? null : reward.id)}
                    >
                      <Info size={13} />
                      View Details
                    </button>
                  </div>

                  {detailsOpen ? (
                    <div className="ag-wallet-details">
                      <span>Code: {reward.code || "-"}</span>
                      <span>Source: {reward.source || "manual"}</span>
                      <span>Min Order: ₹{reward.minOrderValue || 0}</span>
                    </div>
                  ) : null}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default RewardWallet;
