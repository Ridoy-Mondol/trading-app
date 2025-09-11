import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import styles from "./Notifications.module.sass";
import Icon from "../../Icon";
import useNotifications from "../../../hooks/useNotifications";
import { useUser } from "../../../context/UserContext";

const Notifications = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const { user, loadingUser } = useUser();
  const limit = 5;
  const fetchedPages = useRef(new Set());
  const loadNotifications = async (pageNumber) => {
    if (fetchedPages.current.has(pageNumber)) return;
    fetchedPages.current.add(pageNumber);

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/notification?page=${pageNumber}&limit=${limit}`,
        {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to fetch notifications:", res.statusText);
        setLoading(false);
        return;
      }

      const data = await res.json();
      setNotifications((prev) => [...prev, ...data.notifications]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications(1);
  }, []);

  const addNotification = (notification) => {
    setNotifications((prev) => [notification, ...prev]);
  };

  const updateNotifications = (data) => {
    if (data.type === "bulk-mark-read") {
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    }
  };

  useNotifications(user?.id, addNotification, updateNotifications);

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/notification/mark-read`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        console.error("Failed to mark notifications as read:", res.statusText);
        setLoading(false);
        return;
      }

      const data = await res.json();

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

      return data;
    } catch (err) {
      console.error("Error marking notifications as read:", err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div
        className={cn(className, styles.notifications, {
          [styles.active]: visible,
        })}
      >
        <button
          className={cn(styles.head, {
            [styles.active]: notifications.some((n) => !n.isRead),
          })}
          onClick={() => setVisible(!visible)}
        >
          <Icon name="bell" size="24" />
        </button>
        <div className={styles.body}>
          <div className={styles.title}>Notifications</div>
          <div className={styles.list}>
            {notifications.map((x, index) => (
              <Link
                className={cn(styles.item, { [styles.new]: !x.isRead })}
                to="/notifications"
                onClick={() => setVisible(!visible)}
                key={index}
              >
                <div className={styles.subtitle}>{x.title}</div>
                <div className={styles.date}>
                  {(() => {
                    const d = new Date(x.createdAt);
                    const pad = (n) => n.toString().padStart(2, "0");
                    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
                      d.getDate()
                    )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
                      d.getSeconds()
                    )}`;
                  })()}
                </div>
              </Link>
            ))}
          </div>
          <div className={styles.btns}>
            <Link
              className={cn("button-small", styles.button)}
              to="/notifications"
              onClick={() => setVisible(false)}
            >
              View all
            </Link>
            <button
              className={cn("button-stroke button-small", styles.button)}
              onClick={markAllAsRead}
              disabled={loading}
            >
              Clear all
            </button>
          </div>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default Notifications;
