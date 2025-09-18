import React, { useState, useEffect, useRef } from "react";
import cn from "classnames";
import styles from "./Notifications.module.sass";
import Icon from "../../components/Icon";
import Item from "./Item";
import Filters from "./Filters";
import Actions from "../../components/Actions";
import useNotifications from "../../hooks/useNotifications";
import { useUser } from "../../context/UserContext";

const filters = [
  "Security",
  "Wallet",
  "Trade",
  "Deposit",
  "Withdrawal",
  "Referral",
  "API",
  "News",
  "Content",
  "Other",
];

const Notifications = () => {
  const [visible, setVisible] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const { user, loadingUser } = useUser();
  const limit = 10;
  const fetchedPages = useRef(new Set());

  const loadNotifications = async (pageNumber) => {
    if (fetchedPages.current.has(pageNumber)) return;
    fetchedPages.current.add(pageNumber);

    setLoading(true);
    try {
      const filterQuery =
        selectedFilters.length > 0
          ? `&filters=${selectedFilters.join(",")}`
          : "";

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/notification?page=${pageNumber}&limit=${limit}${filterQuery}`,
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

      setNotifications((prev) =>
        pageNumber === 1 ? data.notifications : [...prev, ...data.notifications]
      );
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchedPages.current.clear();
    loadNotifications(page);
  }, [page]);

  useEffect(() => {
    fetchedPages.current.clear();
    setNotifications([]);
    setPage(1);
    loadNotifications(1);
  }, [selectedFilters]);

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
    <div className={styles.notifications}>
      <div className={cn("container", styles.container)}>
        <div className={styles.body}>
          <div className={styles.top}>
            <h4 className={cn("h4", styles.title)}>Notifications</h4>
            <button
              className={cn("button-stroke button-small", styles.button)}
              onClick={markAllAsRead}
            >
              Mark all as read
            </button>
          </div>
          <div className={styles.row}>
            <button
              className={cn("button-small", styles.toggle, {
                [styles.active]: visible,
              })}
              onClick={() => setVisible(!visible)}
            >
              Advanced filter
            </button>
            <Filters
              className={cn(styles.filters, { [styles.active]: visible })}
              filters={filters}
              selectedFilters={selectedFilters}
              setSelectedFilters={setSelectedFilters}
            />
            <div className={styles.wrapper}>
              <div className={styles.list}>
                {notifications.map((x, index) => (
                  <Item
                    className={styles.item}
                    item={x}
                    key={index}
                    index={index}
                    loading={loading}
                  />
                ))}
              </div>
              {!(page >= totalPages) && (
                <div className={styles.btns}>
                  <button
                    className={cn("button-stroke button-small", styles.button)}
                    onClick={() => {
                      if (!loading && page < totalPages) {
                        setPage(page + 1);
                      }
                    }}
                    disabled={loading || page >= totalPages}
                  >
                    <span>{loading ? "Loading..." : "Load more"}</span>
                    <Icon name="calendar" size="16" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <Actions className={styles.actions} />
      </div>
    </div>
  );
};

export default Notifications;
