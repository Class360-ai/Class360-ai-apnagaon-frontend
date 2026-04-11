import { useContext } from "react";
import { NotificationsContext } from "./NotificationsContext";

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error("useNotifications must be used inside NotificationsProvider");
  return context;
};
