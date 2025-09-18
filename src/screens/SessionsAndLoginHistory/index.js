import React, { useState, useEffect } from "react";
import cn from "classnames";
import styles from "./SessionsAndLoginHistory.module.sass";
import Profile from "../../components/Profile";
import { Link } from "react-router-dom";
import Loader from "../../components/Loader";

const breadcrumbs = [
  {
    title: "Home",
    url: "/",
  },
  {
    title: "Sessions & login history",
  },
];

const SessionsAndLoginHistory = () => {
  const [sessions, setSessions] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/api/sessions`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok) {
          setLoading(false);
          console.error(data.message || "Failed to fetch sessions");
          return;
        }

        const currentSession = data.sessions.filter((s) => s.isActive) || [];
        const prevSessions = data.sessions.filter((s) => !s.isActive) || [];

        setSessions(currentSession);
        setHistory(prevSessions);
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Failed to fetch sessions:", err);
      }
    };

    fetchSessions();
  }, []);

  const handleLogoutAll = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/logout-all`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        setLoading(false);
        const data = await response.json();
        alert("Logout failed:", data.message || response.statusText);
        return;
      }

      setLoading(false);
      window.location.href = "/sign-in";
    } catch (error) {
      setLoading(false);
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
        }}
      >
        <Loader />
      </div>
    );
  }

  return (
    <Profile title="Sessions & login history" breadcrumbs={breadcrumbs}>
      <div className={styles.section}>
        <div className={styles.title}>Active sessions</div>
        <div className={styles.table}>
          <div className={styles.row}>
            <div className={styles.col}>Date / time</div>
            <div className={styles.col}>Device</div>
            <div className={styles.col}>Location</div>
          </div>
          {sessions?.map((x, index) => (
            <div className={styles.row} key={index}>
              <div className={styles.col}>
                <div className={styles.content}>
                  {x.createdAt.split("T")[0]}
                </div>
                <div className={styles.note}>
                  {x.createdAt.split("T")[1].split(".")[0]}
                </div>
              </div>
              <div className={styles.col}>
                <div className={styles.content}>{x.browser}</div>
                <div className={styles.note}>{x.opSystem}</div>
              </div>
              <div className={styles.col}>
                <div className={cn("category", styles.location)}>
                  {x.location?.split(",").pop()?.trim()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.btns} onClick={handleLogoutAll}>
          <button className={cn("button-stroke", styles.button)}>
            Log out all other devices
          </button>
        </div>
      </div>

      {history.length > 0 && (
        <div className={styles.section}>
          <div className={styles.title}>Login history</div>
          <div className={styles.table}>
            <div className={styles.row}>
              <div className={styles.col}>Date / time</div>
              <div className={styles.col}>IP address</div>
              <div className={styles.col}>Used 2FA</div>
            </div>
            {history.map((x, index) => (
              <div className={styles.row} key={index}>
                <div className={styles.col}>
                  <div className={styles.content}>
                    {x.createdAt.split("T")[0]}
                  </div>
                  <div className={styles.note}>
                    {x.createdAt.split("T")[1].split(".")[0]}
                  </div>
                </div>
                <div className={styles.col}>
                  <div className={styles.content}>{x.ipAddress}</div>
                </div>
                <div className={styles.col}>
                  {x.status ? (
                    <div className={cn("category-green", styles.status)}>
                      yes
                    </div>
                  ) : (
                    <div className={cn("category-red", styles.status)}>no</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.btns}>
        <Link className={cn("button-stroke", styles.button)} to="/contact">
          Contact us
        </Link>
      </div>
    </Profile>
  );
};

export default SessionsAndLoginHistory;
