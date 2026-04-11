import React from "react";
import NotificationCard from "./NotificationCard";
import EmptyState from "./EmptyState";
import { BellRing } from "lucide-react";

const NotificationList = ({ notifications = [], loading = false, onOpen, emptyTitle, emptyDescription, emptyAction, emptyActionText }) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-[24px] bg-white shadow-sm ring-1 ring-slate-100" />
        ))}
      </div>
    );
  }

  if (!notifications.length) {
    return (
      <EmptyState
        title={emptyTitle || "No notifications yet"}
        description={emptyDescription || "Order updates, offers, and rewards will appear here."}
        action={emptyAction}
        actionText={emptyActionText || "Browse ApnaGaon"}
        icon={BellRing}
      />
    );
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <NotificationCard
          key={notification._id || notification.id}
          notification={notification}
          onOpen={onOpen}
        />
      ))}
    </div>
  );
};

export default NotificationList;
