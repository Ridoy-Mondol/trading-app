import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cn from "classnames";
import OutsideClickHandler from "react-outside-click-handler";
import { MdLogin } from "react-icons/md";
import styles from "./User.module.sass";
import Icon from "../../Icon";
import Theme from "../../Theme";
import { useAuth } from "../../../context/AuthContext";
import { useUser } from "../../../context/UserContext";

const items = [
  {
    title: "Profile",
    icon: "user",
    content: "Important account details",
    url: "/profile-info",
  },
  {
    title: "Referrals",
    icon: "share",
    content: "Invite your friends and earn rewards",
    url: "/referrals",
  },
  {
    title: "2FA security",
    icon: "lock",
    content: "Setup 2FA for more security",
    url: "/2fa",
  },
  {
    title: "Settings",
    icon: "cog",
    content: "View additional settings",
    url: "/api-keys",
  },
  {
    title: "Dark mode",
    icon: "theme-dark",
    content: "Switch dark/light mode",
  },
];

const User = ({ className }) => {
  const [visible, setVisible] = useState(false);
  const { isAuthenticated } = useAuth();
  const { user, loadingUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        console.error("Logout failed:", data.message || response.statusText);
        return;
      }

      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const handleLogin = () => {
    navigate("/sign-in");
  };

  return (
    <OutsideClickHandler onOutsideClick={() => setVisible(false)}>
      <div className={cn(className, styles.user, { [styles.active]: visible })}>
        <button className={styles.head} onClick={() => setVisible(!visible)}>
          <img src={user?.photoUrl ? user?.photoUrl : "/images/content/avatar-user.jpg"} alt="Avatar" />
        </button>
        <div className={styles.body}>
          <div className={styles.menu}>
            {items.map((x, index) =>
              x.url ? (
                <Link
                  className={styles.item}
                  to={x.url}
                  onClick={() => setVisible(false)}
                  key={index}
                >
                  <div className={styles.icon}>
                    <Icon name={x.icon} size="20" />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.title}>{x.title}</div>
                    <div className={styles.content}>{x.content}</div>
                  </div>
                </Link>
              ) : (
                <div className={styles.item} key={index}>
                  <div className={styles.icon}>
                    <Icon name={x.icon} size="20" />
                  </div>
                  <div className={styles.details}>
                    <div className={styles.line}>
                      <div className={styles.title}>{x.title}</div>
                      {x.icon === "theme-dark" && (
                        <Theme className={styles.theme} small />
                      )}
                    </div>
                    {x.content && (
                      <div className={styles.content}>{x.content}</div>
                    )}
                  </div>
                </div>
              )
            )}

            {isAuthenticated ? (
              <button className={styles.item} onClick={handleLogout}>
                <div className={styles.icon}>
                  <Icon name="exit" size="20" />
                </div>
                <div className={styles.details}>
                  <div className={styles.title}>Log out</div>
                </div>
              </button>
            ) : (
              <button className={styles.item} onClick={handleLogin}>
                <div className={styles.icon}>
                  <MdLogin size={20} />
                </div>
                <div className={styles.details}>
                  <div className={styles.title}>Login</div>
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </OutsideClickHandler>
  );
};

export default User;
