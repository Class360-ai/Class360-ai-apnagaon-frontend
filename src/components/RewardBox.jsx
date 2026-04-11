import React, { useEffect, useMemo, useState } from "react";
import { Gift, Star, Wallet } from "lucide-react";
import { getWhatsAppLink } from "../utils/whatsappUtils";
import { getInviteCount, getRewardPoints, incrementInviteCount, rewardPointsEvents } from "../utils/rewardPoints";
import "./rewardBox.css";

const REDEEM_OPTIONS = [
  { id: "delivery", title: "Free Delivery", points: 40, icon: Gift },
  { id: "cashback", title: "₹20 Cashback", points: 80, icon: Wallet },
  { id: "milk", title: "Free Milk", points: 120, icon: Star },
];

const RewardBox = () => {
  const [points, setPoints] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);

  useEffect(() => {
    setPoints(getRewardPoints());
    setInviteCount(getInviteCount());

    const onPointsUpdate = (event) => {
      if (typeof event?.detail?.points === "number") {
        setPoints(event.detail.points);
      } else {
        setPoints(getRewardPoints());
      }
    };

    const onStorageUpdate = (event) => {
      if (event.key && event.key !== "apnagaon_reward_points") return;
      setPoints(getRewardPoints());
    };

    window.addEventListener(rewardPointsEvents.updated, onPointsUpdate);
    window.addEventListener("storage", onStorageUpdate);

    return () => {
      window.removeEventListener(rewardPointsEvents.updated, onPointsUpdate);
      window.removeEventListener("storage", onStorageUpdate);
    };
  }, []);

  const handleInviteFriends = () => {
    const message = "Join ApnaGaon and get rewards 🎁";
    const link = getWhatsAppLink(message);
    if (link && link !== "javascript:void(0)") {
      window.open(link, "_blank", "noopener,noreferrer");
      setInviteCount(incrementInviteCount());
    }
  };

  const options = useMemo(
    () =>
      REDEEM_OPTIONS.map((option) => ({
        ...option,
        unlocked: points >= option.points,
      })),
    [points]
  );

  return (
    <section className="ag-reward-box">
      <div className="ag-reward-head">
        <p className="ag-reward-kicker">Reward Points</p>
        <strong className="ag-reward-points">{points}</strong>
      </div>

      <div className="ag-reward-options">
        {options.map((option) => {
          const Icon = option.icon;
          return (
            <article key={option.id} className={`ag-reward-option ${option.unlocked ? "is-unlocked" : ""}`}>
              <div className="ag-reward-option-top">
                <span className="ag-reward-option-icon">
                  <Icon size={14} />
                </span>
                <span className="ag-reward-option-points">{option.points} pts</span>
              </div>
              <h4>{option.title}</h4>
              <button type="button" disabled={!option.unlocked}>
                {option.unlocked ? "Redeem Now" : "Keep Earning"}
              </button>
            </article>
          );
        })}
      </div>

      <div className="ag-reward-invite">
        <button type="button" onClick={handleInviteFriends}>
          Invite Friends
        </button>
        <p>You invited {inviteCount} friends</p>
      </div>
    </section>
  );
};

export default RewardBox;
