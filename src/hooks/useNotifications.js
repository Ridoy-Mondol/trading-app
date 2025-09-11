import Pusher from "pusher-js";
import { useEffect } from "react";

const useNotifications = (userId, addNotification, updateNotifications) => {
  useEffect(() => {
    if (!userId) return;

    const pusher = new Pusher(process.env.REACT_APP_PUSHER_KEY, {
      cluster: process.env.REACT_APP_PUSHER_CLUSTER,
      encrypted: true,
    });

    const channel = pusher.subscribe(`notification-${userId}`);

    channel.bind("new-notification", (data) => {
      addNotification(data);
    });

    channel.bind("update-notification", (data) => {
      updateNotifications(data);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [userId, addNotification, updateNotifications]);
};

export default useNotifications;
